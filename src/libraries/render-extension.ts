import { Response, Request, NextFunction } from 'express';

import ejs from 'ejs';
import path from 'path';

import fs from 'fs/promises';

import * as data from './data.json';


// file deepcode ignore NoRateLimitingForExpensiveWebOperation: Just testing dude
export default function (req: Request, res: Response, next: NextFunction)
{
	res.locals.title = process.env.WEBSITE_NAME || 'Siwini Challenge Poza Rica 2023';
	res.locals.headTags = '';


	res.setSubtitle = (subtitle: string) =>
	{
		res.locals.subtitle = subtitle;
	}


	res.addHeadTag = (...headDefinitions) =>
	{
		for (const definition of headDefinitions) {
			var txt = '';

			switch (definition.type) {
				case 'js':
					if (definition.defer === undefined) {
						definition.defer = true;
					}

					if (definition.source.startsWith('/')) {
						definition.source = `${definition.source}?v=${data.version}`;
					}

					txt = `<script ${definition.defer ? 'defer ' : ''}` +
							`src="${definition.source}" nonce="${res.locals.nonce}"></script>`
					break;
				case 'css':
					txt = `<link rel="preload" href="${definition.source}?v=${data.version}" as="style">` +
							`<link rel="stylesheet" href="${definition.source}?v=${data.version}">`;
					break;
				case 'link':
					txt = `<link rel="${definition.rel}" href="${definition.source}" ` +
							`as="${definition.as}" type="${definition.mimeType}">`;
					break;
			}

			res.locals.headTags += `${txt}\n`;
		}
	}


	// EJS does not support layout blocks, so I've implemented my own layout system.
	// Thank you EJS for being so flexible... that's sarcasm if you didn't notice.
	res.renderLayout = async (file: string, options?: object) =>
	{
		return new Promise((resolve, reject) =>
		{
			if (res.locals.subtitle) {
				res.locals.title = `${res.locals.subtitle} - ${res.locals.title}`;
			}


			const fileToRender = path.join(process.cwd(), req.app.get('views'), `${file}.ejs`);


			fs.readFile(fileToRender, { encoding: 'utf-8' })
			.then((content) => {
				var fileContent = content.split('\n');

				const line = fileContent[0];

				const layout = ejs.render(line, {
					layout: (layout: string) => {
						return layout;
					}
				});


				if (layout !== line) {
					const finalOptions = {
						locals: res.locals,
						...options,
						...res.locals
					};

					const finalFileContent = fileContent.slice(1).join('\n');
					const renderedFile = ejs.render(finalFileContent, finalOptions);


					res.render(`.templates/${layout}.ejs`, {
						...res.locals,
						__body__: renderedFile,
						__head__: res.locals.headTags,
						__canonical__: `${res.locals.root}${req.originalUrl}`,
						__version__: data.version
					});

					return resolve();
				}

				res.render(file, {
					locals: res.locals,
					...options,
					...res.locals
				});

				return resolve();
			})
			.catch((err) => {
				reject(err);
			});	
		});
	};

	next();
}
