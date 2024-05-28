import 'dotenv/config';
import pm2 from 'pm2';


async function wait(ms: number): Promise<void>
{
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

async function ping(log: boolean = false): Promise<boolean>
{
	try {
		const controller = new AbortController();
		setTimeout(() => controller.abort(), 10000);

		const response = await fetch('http://127.0.0.1:' + process.env.PORT, {
			signal: controller.signal
		});

		if (response.ok) {
			return true;
		}

		if (log) {
			console.error(response);
		}

		return false;
	} catch (e) {
		if (log) {
			console.error(e);
		}

		return false;
	}
}

console.log('Starting...');

pm2.connect((err) => {
	if (err) {
		console.error(err);
		process.exit(2);
	}

	pm2.list((err, list) => {
		for (const proc of list) {
			if (proc.name != 'siwini') {
				continue;
			}


			(async () => {
				console.log('Found process, pinging...');
				const test = await ping(true);

				if (!test) {
					process.exit(1);
				} else {
					console.log('Website is up, starting ping loop...');
				}

				while (1) {
					await wait(30000);

					const isAlive = await ping();

					if (!isAlive) {
						console.log('Website down, restarting...');

						pm2.restart(proc.pm_id, (err, proc) =>
						{
							if (err) {
								console.log('Something went wrong, check the logs');
								console.error(err);
								process.exit(2);
							}
						});
					}
				}
			})();
		}
	});
});
