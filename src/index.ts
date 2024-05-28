import 'source-map-support/register';
import 'dotenv/config';

import express, { Response, Request, NextFunction } from 'express';

import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import httpError, { HttpError } from 'http-errors';

import crypto from 'crypto';

import renderExtension from './libraries/render-extension';
import routes from './routes';
import * as database from './libraries/database';
import { minify } from './libraries/minify';

import * as data from './libraries/data.json';
import useragent from 'express-useragent';


// file deepcode ignore UseCsurfForExpress: This project does not use cookies
// file deepcode ignore NoRateLimitingForExpensiveWebOperation: Nginx handles this
const app = express();


if (!process.env.PORT) {
	process.env.PORT = '80';
}


function choose(choices: string[])
{
	const index = Math.floor(Math.random() * choices.length);
	return choices[index];
}


(async () => {
	database.setup(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, process.env.DB_HOST);

	app.set('etag', false);
	app.set('views', './views');
	app.set('view engine', 'ejs');
	app.set('view cache', process.env.NODE_ENV === 'production');
	app.set('x-powered-by', false);
	app.set('case sensitive routing', true);
	app.set('trust proxy', true);

	app.use(helmet());
	app.use(compression());
	app.use(cors());
	app.use(express.json());
	app.use(express.urlencoded({ extended: true, limit: '10mb' }));
	app.use(useragent.express());
	app.use(
		process.env.NODE_ENV === 'production' ?
			morgan('combined', {
				'skip': (req, res) => res.statusCode < 500 && res.statusCode !== 429
			}) :
			morgan('dev')
	);

	if (process.env.NODE_ENV === 'production') {
		app.use(await minify());
	}


	app.use(async (req, res, next) => {
		// Set a nonce for CSP
		res.locals.nonce = crypto.randomBytes(32).toString('base64url');
		res.locals.root = `${req.protocol}://${req.headers.host}`;

		res.setHeader('Content-Security-Policy',
			`default-src 'self' 'unsafe-hashes' 'unsafe-inline' www.google-analytics.com;` +
			`script-src 'strict-dynamic' 'unsafe-inline' https: 'nonce-${res.locals.nonce}' ` +
						'www.googletagmanager.com www.google-analytics.com;' +
			`base-uri 'self';` +
			`object-src 'none';` +
			`frame-src 'self' data: www.score7.io;` +
			`img-src 'self' data:;` +
			`upgrade-insecure-requests;`
		);

		next();
	});

	app.use(renderExtension);

	app.use('/', routes);

	app.use(express.static('./public', {
		maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0,
		dotfiles: 'ignore',
		fallthrough: true,
		etag: true
	}));



	async function errorHandler(err: HttpError<number>, req: Request, res: Response, next: NextFunction)
	{
		const msg = err.message || '[Error message not provided]';
		const status = err.status || 500;

		var message = 'Algo salió mal...';


		switch (status) {
			case 400:
			case 401:
			case 403:
				message = choose([
					'No estás autorizado para hacer eso.',
					'Mejor ve a leer un libro.',
					'¿Qué estás haciendo?'
				]);
				break;

			case 404:
				message = choose([
					'¿Estás perdido?',
					'¿Qué estás buscando?',
					'¿Necesitas un mapa?',
					'¿Sabías que hay botones para navegar?'
				]);
				break;

			case 500:
				message = choose([
					'Algo salió mal...',
					'Descuida, no es tu culpa.'
				]);
				break;
		}


		res.status(status).render('.templates/error', {
			status: status,
			message: message,
			__version__: data.version
		});

		if (status !== 404) {
			console.error(`[${req.method}] ${req.originalUrl} - ${status} ${msg}`);
		}
	}


	app.use(errorHandler);

	app.use(async (req, res) =>
	{
		errorHandler(httpError(404), req, res, () => {});
	});

	app.listen(process.env.PORT, () => {
		console.log(`Server running on port ${process.env.PORT}`);
	});
})();
