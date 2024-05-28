import { NextFunction, Request, Response } from 'express';

import httpError from 'http-errors';


export default function (file: string, name: string)
{
	return async function (req: Request, res: Response, next: NextFunction)
	{
		try {
			res.setSubtitle(`Hospedaje ${name.toLowerCase()}`);

			res.addHeadTag({
				type: 'css',
				source: '/assets/css/hosting.css'
			});

			res.renderLayout('hosting', { file, name });
		} catch (e) {
			next(httpError(500, e));
		}
	}
}

