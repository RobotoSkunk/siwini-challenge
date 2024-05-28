import { connect } from "./database";

import crypto from 'crypto';


const algo = 'sha256';

export default async function (token: string): Promise<boolean>
{
	const client = await connect();

	try {
		const [ tokenId, validator ] = token.split(':');

		const query = await client.query(
			'SELECT password FROM admin_access WHERE id = $1',
			[ tokenId ]
		);

		if (query.rows.length === 0) {
			return false;
		}

		const password = query.rows[0].password;
		const hash = crypto.createHash(algo).update(validator).digest('hex');


		return crypto.timingSafeEqual(Buffer.from(password), Buffer.from(hash));
	} catch (e) {
			} finally {
		client.release();
	}

	return false;
}
