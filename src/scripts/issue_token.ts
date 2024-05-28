import 'source-map-support/register';
import 'dotenv/config';

import crypto from 'crypto';

import * as database from '../libraries/database';


(async () => {
	database.setup(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, process.env.DB_HOST);

	const id =  crypto.randomBytes(16).toString('base64url');
	const secret = crypto.randomBytes(32).toString('base64url');


	const client = await database.connect();

	try {
		const hash = crypto.createHash('sha256').update(secret).digest('hex');

		await client.query(
			'INSERT INTO admin_access (id, password) VALUES ($1, $2)',
			[ id, hash ]
		);


		console.log(`${id}:${secret}`);
	} catch (e) {
			} finally {
		client.release();
	}

	process.exit(0);
})();
