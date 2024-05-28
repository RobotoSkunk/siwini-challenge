import { NextFunction, Request, Response } from 'express';

import httpError from 'http-errors';


export default function (file: string, name: string)
{
	return async function (req: Request, res: Response, next: NextFunction)
	{
		try {
			res.setSubtitle(`Reglamento de ${name.toLowerCase()}`);

			res.renderLayout('rules', { file, name });
		} catch (e) {
			next(httpError(500, e));
		}
	}
}

