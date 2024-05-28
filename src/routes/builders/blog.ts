import DOMPurify from 'isomorphic-dompurify';
import { NextFunction, Request, Response } from 'express';
import { marked } from 'marked';
import { connect } from '../../libraries/database';

import httpError from 'http-errors';


export default async function (req: Request, res: Response, next: NextFunction)
{
	const client = await connect();

	try {
		res.setSubtitle('Publicación');

		res.addHeadTag({
			type: 'css',
			source: '/assets/css/blog.css'
		});

		const query = await client.query(
			'SELECT title, picture, content FROM blogs WHERE id = $1',
			[ req.params.id ]
		);

		if (query.rows.length === 0) {
			return next(httpError(404));
		}

		const blog = query.rows[0];

		res.renderLayout('blog', {
			blogTitle: blog.title,
			img: `/picture/${blog.picture}?size=1024`,
			content: DOMPurify.sanitize(marked.parse(blog.content))
		});
	} catch (e) {
		next(httpError(500, e));
	} finally {
		client.release();
	}
}

