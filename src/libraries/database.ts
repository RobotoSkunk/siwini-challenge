import pg from 'pg';


var pool: pg.Pool;


export function setup(database: string, user: string, password: string, host: string)
{
	pool = new pg.Pool({
		database,
		user,
		password,
		host
	});
}


export async function connect()
{
	return await pool.connect();
}
