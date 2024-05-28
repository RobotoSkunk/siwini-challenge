import { NextFunction, Request, Response } from 'express';
import { connect } from '../../libraries/database';

import httpError from 'http-errors';


export default async function (req: Request, res: Response, next: NextFunction)
{
	const client = await connect();

	try {
		res.setSubtitle('Información de costos');

		res.addHeadTag({
			type: 'css',
			source: '/assets/css/prices.css'
		});

		res.renderLayout('prices');
	} catch (e) {
		next(httpError(500, e));
	} finally {
		client.release();
	}
}
