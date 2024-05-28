import { NextFunction, Request, Response } from 'express';

import httpError from 'http-errors';


export default function (file: string, name: string, extras: object = {})
{
	return async function (req: Request, res: Response, next: NextFunction)
	{
		try {
			res.setSubtitle(name);

			res.renderLayout(file, extras);
		} catch (e) {
			next(httpError(500, e));
		}
	}
}

