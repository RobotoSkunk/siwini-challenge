import { NextFunction, Request, Response } from 'express';
import { connect } from '../../libraries/database';

import httpError from 'http-errors';


export default async function (req: Request, res: Response, next: NextFunction)
{
	const client = await connect();

	try {
		res.addHeadTag({
			type: 'css',
			source: '/assets/css/index.css'
		});


		const query = await client.query('SELECT id, title, picture, content FROM blogs ORDER BY id DESC');
		const blogs = [];


		for (const row of query.rows) {
			var content = row.content;

			if (content.length > 200) {
				content = content.substring(0, 200) + '...';
			}

			blogs.push({
				id: row.id,
				title: row.title,
				img: row.picture,
				content: content
			});
		}


		var count = 0;

		if (!req.useragent?.isBot) {
			const countQuery = await client.query('UPDATE visits SET count = count + 1 RETURNING count;');
			count = countQuery.rows[0].count;
		}

		res.renderLayout('index', { blogs, count });
	} catch (e) {
		next(httpError(500, e));
	} finally {
		client.release();
	}
}
