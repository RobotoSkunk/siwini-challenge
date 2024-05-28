import { NextFunction, Request, Response } from 'express';
import storeImage from '../../libraries/store-image';
import { connect } from '../../libraries/database';
import authorizeToken from '../../libraries/authorize-token';

import httpError from 'http-errors';
import bufferToImage from '../../libraries/buffer-to-image';


async function renderPage(req: Request, res: Response, next: NextFunction)
{
	try {
		res.setSubtitle('Crear Publicación');

		res.addHeadTag({
			type: 'js',
			source: '/assets/js/form.js',
			defer: true
		});


		res.renderLayout('admin/blog', {
			nofollow: true
		});
	} catch (e) {
		next(httpError(500, e));
	}
}

export async function blogPost(req: Request, res: Response, next: NextFunction)
{
	try {
		const body: {
			title: string,
			picture: string,
			content: string,
			token: string
		} = req.body;


		// file deepcode ignore HTTPSourceWithUncheckedType: The type of the body is checked
		for (const key of [ 'title', 'picture', 'content', 'token' ]) {
			if (typeof body[key] !== 'string') {
				return next(httpError(400, `Missing ${key}`));
			}
		}

		if (!await authorizeToken(body.token)) {
			res.locals.message = 'Token inválido';

			return renderPage(req, res, next);
		}


		if (!body.picture.startsWith('data:image/')) {
			res.locals.message = 'Imagen inválida';

			return renderPage(req, res, next);
		}

		if (body.picture.length > 1024 * 1024 * 3) {
			res.locals.message = 'No se pueden subir imágenes de más de 3MB';

			return renderPage(req, res, next);
		}


		const base64 = body.picture.split(',')[1];
		const buffer = Buffer.from(base64, 'base64');

		const image = await bufferToImage(buffer);

		if (image.width > 1200 || image.height > 1200) {
			res.locals.message = 'La imagen debe tener un tamaño máximo de 1200 x 1200 píxeles.';

			return renderPage(req, res, next);
		}

		const imgId = await storeImage(image);

		const client = await connect();

		try {
			const query = await client.query(
				`INSERT INTO blogs (title, picture, content) VALUES ($1, $2, $3) RETURNING id`,
				[ body.title, imgId, body.content ]
			);

			res.redirect(`/blog/${query.rows[0].id}`);
		} catch (e) {
			next(httpError(500, e));
		} finally {
			client.release();
		}
	} catch (e) {
		next(httpError(500, e));
	}
}


export default renderPage;
