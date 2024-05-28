import { NextFunction, Request, Response } from 'express';

import httpError from 'http-errors';


export default function (name: string, code: string)
{
	return async function (req: Request, res: Response, next: NextFunction)
	{
		try {
			res.setSubtitle(name.toLowerCase());

			res.addHeadTag({
				type: 'css',
				source: '/assets/css/hosting.css'
			});

			res.renderLayout('tournament', { name, code });
		} catch (e) {
			next(httpError(500, e));
		}
	}
}

