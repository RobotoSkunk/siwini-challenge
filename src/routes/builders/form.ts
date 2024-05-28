import { NextFunction, Request, Response } from 'express';
import { connect } from '../../libraries/database';
import storeImage from '../../libraries/store-image';

import crypto from 'crypto';

import httpError from 'http-errors';
import bufferToImage from '../../libraries/buffer-to-image';


async function renderPage(req: Request, res: Response, next: NextFunction)
{
	const client = await connect();


	if (req.query.id) {
		const id = req.query.id.toString().replace(/-/g, '');

		const query = await client.query('SELECT checkout_picture FROM forms WHERE id = $1', [ id ]);

		if (query.rows.length === 0) {
			return next(httpError(404, 'Form not found'));
		}

		if (query.rows[0].checkout_picture) {
			res.renderLayout('form-result', { id: false });
			return;
		}

		res.renderLayout('form-result', { id: req.query.id });
	} else {
		try {
			res.setSubtitle('Formulario de Inscripción');
	
			res.addHeadTag(
				{
					type: 'js',
					source: '/assets/js/register.js',
					defer: true
				}, {
					type: 'js',
					source: '/assets/js/form.js',
					defer: true
				}
			);
	
	
			const categories = [];
			const query = await client.query('SELECT id, name FROM categories');
	
			for (const row of query.rows) {
				categories.push({
					id: row.id,
					name: row.name
				});
			}
	
			res.renderLayout('form', { categories });
		} catch (e) {
			next(httpError(500, e));
		} finally {
			client.release();
		}
	}
}


export async function formPost(req: Request, res: Response, next: NextFunction)
{
	function sendResponse(success: boolean, message: string, code?: string): void
	{
		res.send({ success, message, code });
	}

	try {
		const body: {
			'robot-name': string,
			category: string,
			'team-name': string,
			'team-leader-name': string,
			'team-leader-email': string,
			'contact-phone'?: string,
			'assistant-1': string,
			'assistant-2': string,
			consultant: string,
			institution: string,
			country: string,

			'robot-pic'?: string,
			checkout?: string
		} = req.body;


		// file deepcode ignore HTTPSourceWithUncheckedType: The type of the body is checked
		for (const key of [
			'robot-name',
			'category',
			'team-name',
			'team-leader-name',
			'team-leader-email',
			'assistant-1',
			'assistant-2',
			'consultant',
			'institution',
			'country'
		]) {
			if (typeof body[key] !== 'string') {
				next(httpError(400, `Missing ${key}`));
				return;
			}
		}


		const categoryId = Number.parseInt(body.category);

		if (Number.isNaN(categoryId)) {
			res.locals.message = 'Categoría inválida.';

			sendResponse(false, 'Categoría inválida.');
			return;
		}


		const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		if (!emailRegex.test(body['team-leader-email'])) {
			sendResponse(false, 'El correo electrónico del líder del equipo es inválido.');
			return;
		}


		if (body['robot-pic']) {
			if (typeof body['robot-pic'] !== 'string') {
				next(httpError(400, 'robot-pic is not a string'));
				return;
			}

			if (!body['robot-pic'].startsWith('data:image/')) {
				next(httpError(400, 'data:image/ expected in robot-pic (form.ts)'));
				return;
			}

			if (body['robot-pic'].length > 1024 * 1024 * 3) {
				sendResponse(false, 'No se pueden subir imágenes de más de 3MB.');
				return;
			}
		}

		if (body.checkout) {
			if (typeof body.checkout !== 'string') {
				next(httpError(400, 'checkout is not a string'));
				return;
			}

			if (!body.checkout.startsWith('data:image/')) {
				next(httpError(400, 'data:image/ expected in checkout (form.ts)'));
				return;
			}

			if (body.checkout.length > 1024 * 1024 * 3) {
				sendResponse(false, 'No se pueden subir imágenes de más de 3MB.');
				return;
			}
		}


		const client = await connect();

		try {
			var robotId = null;
			var checkoutId = null;

			if (body['robot-pic']) {
				const base64 = body['robot-pic'].split(',')[1];
				const buffer = Buffer.from(base64, 'base64');

				const image = await bufferToImage(buffer);

				if (image.width > 1200 || image.height > 1200) {
					sendResponse(false, 'La imagen debe tener un tamaño máximo de 1200 x 1200 píxeles.');
					return;
				}

				robotId = await storeImage(image);
			}

			if (body.checkout) {
				const base64 = body.checkout.split(',')[1];
				const buffer = Buffer.from(base64, 'base64');

				const image = await bufferToImage(buffer);

				if (image.width > 1200 || image.height > 1200) {
					sendResponse(false, 'La imagen debe tener un tamaño máximo de 1200 x 1200 píxeles.');
					return;
				}

				checkoutId = await storeImage(image);
			}


			// Random ID of 8 base64url characters
			var id = crypto.randomBytes(16).toString('base64url');

			// Remove all - and _
			id = id.replace(/[-_]/g, '');

			// Get the first 8 characters
			id = id.substring(0, 8);


			client.query(`INSERT INTO forms (
				id, robot_name, category, robot_picture,
				team_name, team_captain, team_captain_email, team_captain_phone, assistant_1, assistant_2, consultant,
				institution_or_company, country, checkout_picture
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`, [
				id, body['robot-name'], categoryId, robotId,
				body['team-name'], body['team-leader-name'], body['team-leader-email'], body['contact-phone'],
				body['assistant-1'], body['assistant-2'], body['consultant'],
				body.institution, body.country, checkoutId
			]);


			const checkoutIdPublic = id.substring(0, 4) + '-' + id.substring(4);

			sendResponse(true, 'OK', checkoutIdPublic);

		} catch (e) {
			res.status(500);

			console.error(e);
			sendResponse(false, 'Error interno del servidor.');
		} finally {
			client.release();
		}
	} catch (e) {
		res.status(500);

		console.error(e);
		sendResponse(false, 'Error interno del servidor.');
	}
}


export default renderPage;
