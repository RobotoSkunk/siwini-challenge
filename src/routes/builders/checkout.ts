import { NextFunction, Request, Response } from 'express';
import { connect } from '../../libraries/database';
import storeImage from '../../libraries/store-image';

import httpError from 'http-errors';
import bufferToImage from '../../libraries/buffer-to-image';


export async function checkoutStep1(req: Request, res: Response, next: NextFunction)
{
	try {
		res.setSubtitle('Subir comprobante de pago');

		res.addHeadTag({
			type: 'js',
			source: '/assets/js/checkout.js',
			defer: true
		});

		res.renderLayout('checkout-step1');
	} catch (e) {
		next(httpError(500, e));
	}
}

export async function checkoutStep2(req: Request, res: Response, next: NextFunction)
{
	try {
		res.setSubtitle('Subir comprobante de pago');

		res.addHeadTag(
			{
				type: 'js',
				source: '/assets/js/checkout-step2.js',
				defer: true
			}, {
				type: 'js',
				source: '/assets/js/form.js',
				defer: true
			}
		);


		const client = await connect();

		try {
			const query = await client.query(`SELECT
												f.checkout_picture, f.robot_name, c.name AS category
												FROM forms f, categories c
												WHERE f.id = $1 AND f.category = c.id`, [ req.params.form_id ]);

			if (query.rows.length === 0) {
				return next(httpError(404, 'Not found'));
			}

			if (query.rows[0].checkout_picture !== null) {
				return next(httpError(404, 'Not found'));
			}


			res.renderLayout('checkout-step2', {
				formId: req.params.form_id,
				name: query.rows[0].robot_name,
				category: query.rows[0].category
			});

			return;
		} catch (e) {
			next(httpError(500, e));
		} finally {
			client.release();
		}

		next(httpError(404, 'Not found'));
	} catch (e) {
		next(httpError(500, e));
	}
}


export async function checkoutPostStep1(req: Request, res: Response, next: NextFunction)
{
	function sendResponse(success: boolean, message: string, code?: string): void
	{
		res.send({ success, message, code });
	}

	try {
		const body: {
			'form-id': string
		} = req.body;


		// file deepcode ignore HTTPSourceWithUncheckedType: The type of the body is checked
		if (typeof body['form-id'] !== 'string') {
			return next(httpError(400, `Missing form-id`));
		}


		if (req.body['form-id'].length > 12) {
			sendResponse(false, 'El código de registro es incorrecto.');
			return;
		}

		body['form-id'] = body['form-id'].replace(/-/g, '');


		const client = await connect();

		try {
			const query = await client.query('SELECT checkout_picture FROM forms WHERE id = $1', [ body['form-id'] ]);

			if (query.rows.length === 0) {
				sendResponse(false, 'El código de registro proporcionado no existe.');
				return;
			}

			if (query.rows[0].checkout_picture !== null) {
				sendResponse(false, 'El código de registro proporcionado ya ha sido pagado.');
				return;
			}

			sendResponse(true, 'OK', body['form-id']);

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

export async function checkoutPostStep2(req: Request, res: Response, next: NextFunction)
{
	function sendResponse(success: boolean, message: string, code?: string): void
	{
		res.send({ success, message, code });
	}

	try {
		const body: {
			checkout: string
		} = req.body;


		// file deepcode ignore HTTPSourceWithUncheckedType: The type of the body is checked
		if (typeof body.checkout !== 'string') {
			return next(httpError(400, `Missing checkout`));
		}


		if (req.params.form_id.length > 12) {
			sendResponse(false, 'El código de registro es incorrecto.');
			return;
		}

		if (!body.checkout.startsWith('data:image/')) {
			return next(httpError(400, 'data:image/ expected in checkout (checkout.ts)'));
		}

		if (body.checkout.length > 1024 * 1024 * 3) {
			sendResponse(false, 'No se pueden subir imágenes de más de 3MB.');
			return;
		}

		req.params.form_id = req.params.form_id.replace(/-/g, '');


		const client = await connect();

		try {
			const query = await client.query('SELECT checkout_picture FROM forms WHERE id = $1', [ req.params.form_id ]);

			if (query.rows.length === 0) {
				sendResponse(false, 'El código de registro proporcionado no existe.');
				return;
			}

			if (query.rows[0].checkout_picture !== null) {
				sendResponse(false, 'El código de registro proporcionado ya ha sido pagado.');
				return;
			}


			const base64 = body.checkout.split(',')[1];
			const buffer = Buffer.from(base64, 'base64');

			const image = await bufferToImage(buffer);

			if (image.width > 1200 || image.height > 1200) {
				sendResponse(false, 'La imagen debe tener un tamaño máximo de 1200 x 1200 píxeles.');
				return;
			}

			const checkoutId = await storeImage(image);

			client.query(`UPDATE forms SET checkout_picture = $1 WHERE id = $2`, [ checkoutId, req.params.form_id ]);

			sendResponse(true, 'OK', req.params.form_id);

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
