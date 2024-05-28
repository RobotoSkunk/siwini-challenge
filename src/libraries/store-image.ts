import { connect } from "./database";
import canvas from '@napi-rs/canvas';

import crypto from 'crypto';


export default async function (image: canvas.Image): Promise<string>
{
	const client = await connect();

	try {
		const ratio = image.height / image.width;

		const sizes = [ 128, 256, 512, 1024, 2048 ];
		const images = [];


		for (const size of sizes) {
			if (image.width < size) {
				continue;
			}

			const c = canvas.createCanvas(size / ratio, size);
			const context = c.getContext('2d');

			context.drawImage(image, 0, 0, size / ratio, size);
			images.push(await c.encode('png'));
		}

		for (let i = images.length; i < sizes.length; i++) {
			images.push(null);
		}


		const id = crypto.randomBytes(16).toString('base64url');

		await client.query(
			'INSERT INTO pictures (id, x128, x256, x512, x1024, x2048) VALUES ($1, $2, $3, $4, $5, $6)',
			[ id, images[0], images[1], images[2], images[3], images[4] ]
		);

		return id;
	} catch (e) {
		console.error(e);
		throw e;
	} finally {
		client.release();
	}
}
