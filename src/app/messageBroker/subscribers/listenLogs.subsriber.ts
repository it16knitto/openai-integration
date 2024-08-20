import { logger } from '@knittotextile/knitto-core-backend';
import rabbitSubscribers from '@knittotextile/knitto-rabbitmq/dist/rabbit-subscriber';
import { rabbitMQConfig } from '@root/libs/config';
const queueName = 'backendLogs';

const listenLogs = rabbitSubscribers();

listenLogs.add({
	exchangeName: rabbitMQConfig.EXCHANGE,
	queue: queueName,
	routingKey: 'user.created',
	prefetch: 1
}, async (msg) => {
	logger.info(JSON.stringify(msg.data));
});

export default listenLogs;
