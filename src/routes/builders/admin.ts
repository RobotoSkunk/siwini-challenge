import { NextFunction, Request, Response } from 'express';
import storeImage from '../../libraries/store-image';
import { connect } from '../../libraries/database';
import authorizeToken from '../../libraries/authorize-token';

import httpError from 'http-errors';


export const adminRoot = '/kT3uHCx9';


export async function adminLogin(req: Request, res: Response, next: NextFunction)
{
	try {
		res.setSubtitle('Acceso de administrador');

		res.renderLayout('admin/index', {
			nofollow: true
		});
	} catch (e) {
		next(httpError(500, e));
	}
}

export async function adminLoginPost(req: Request, res: Response, next: NextFunction)
{
	const { token } = req.body;

	try {
		if (typeof token !== 'string') {
			return next(httpError(404, ''));
		}

		if (!await authorizeToken(token)) {
			res.locals.message = 'Token inválido';

			return await adminLogin(req, res, next);
		}

		res.cookie('admin', token, {
			maxAge: 1000 * 60 * 60 * 24 * 7,
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production'
		});

		res.redirect(`${adminRoot}/panel`);
	} catch (e) {
		next(httpError(500, e));
	}
}

