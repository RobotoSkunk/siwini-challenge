import { NextFunction, Request, Response } from 'express';

import httpError from 'http-errors';


// file deepcode ignore NoRateLimitingForExpensiveWebOperation: Nginx already handles this.

export default async function (req: Request, res: Response, next: NextFunction)
{
	try {
		res.render('.templates/fish');
	} catch (e) {
		next(httpError(500, e));
	}
}

