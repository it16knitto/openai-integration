import{ rabbitMQConfig } from '@root/libs/config';
import { logger } from '@knittotextile/knitto-core-backend';
import rabbitConnection from '@root/libs/config/rabbitConnection';

async function sendLogs(message: listenerQueue.EventMessageData) {
	try {
		await rabbitConnection.publishMessage(message, {
			exchangeName: rabbitMQConfig.EXCHANGE,
			routingKey: message.eventName
		});
	} catch (err) {
		logger.error(err);
		throw err;
	}
}

export default sendLogs;
