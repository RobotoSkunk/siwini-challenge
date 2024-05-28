import { NextFunction, Request, Response } from 'express';
import getImage from '../../libraries/get-image';

import httpError from 'http-errors';


export default async function (req: Request, res: Response, next: NextFunction)
{
	try {
		const id = req.params.id;

		if (typeof id !== 'string') {
			return res.status(400).send();
		}

		var size = 2048;

		if (req.query.size) {
			size = parseInt(req.query.size as string);

			if (isNaN(size)) {
				return next(httpError(404));
			}
		}

		const image = await getImage(id, size);
		if (image === null) {
			return next(httpError(404));
		}

		res.set('Content-Type', 'image/png');
		res.set('Cache-Control', 'public, max-age=31536000, immutable');
		res.set('Expires', new Date(Date.now() + 31536000000).toUTCString());
		res.set('Content-Disposition', 'inline');


		// file deepcode ignore XSS: The content is an image.
		res.send(image);
	} catch (e) {
		next(httpError(500, e));
	}
}

