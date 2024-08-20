import { logger } from '@knittotextile/knitto-core-backend';
import rabbitConnection from '@root/libs/config/rabbitConnection';
import path from 'path';

async function listener() {
	try {
		await rabbitConnection.subscribe(path.join(__dirname, './listen'));
	} catch (err) {
		logger.error('RabbitMQ Apps Error');
		throw err;
	}
}

export default listener;
