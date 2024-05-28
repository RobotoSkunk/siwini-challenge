import { connect } from "./database";


export default async function (id: string, size: number): Promise<Buffer>
{
	const client = await connect();

	try {
		const sizes = [ 2048, 1024, 512, 256, 128 ];

		if (!sizes.includes(size)) {
			size = 2048;
		}


		for (const _size of sizes) {
			if (_size > size) {
				continue;
			}

			const result = await client.query(
				`SELECT x${_size} AS picture FROM pictures WHERE id = $1`,
				[ id ]
			);

			
			if (result.rows.length === 0) {
				return null;
			}

			if (result.rows[0].picture) {
				return result.rows[0].picture;
			}
		}

		return null;
	} catch (e) {
			} finally {
		client.release();
	}

	return null;
}
