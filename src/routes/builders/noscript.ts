import { NextFunction, Request, Response } from 'express';

import httpError from 'http-errors';

import data from '../../libraries/data.json';


// file deepcode ignore NoRateLimitingForExpensiveWebOperation: Nginx already handles this.

export default async function (req: Request, res: Response, next: NextFunction)
{
	try {
		res.render('.templates/noscript', {
			__version__: data.version,
			nonce: res.locals.nonce
		});
	} catch (e) {
		next(httpError(500, e));
	}
}

