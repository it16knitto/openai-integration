import './libs/helpers/initModuleAlias';
import { dump } from '@knittotextile/knitto-core-backend';
import httpServer from '@http/index';
// import messageBroker from '@root/app/messageBroker';
import mysqlConnection from './libs/config/mysqlConnection';

import { startWs } from './app/ws';
import { getTopics } from './services/openai/openai.service';
// import rabbitConnection from './libs/config/rabbitConnection';

(async () => {
	try {
		// start infrastructure
		await mysqlConnection.init();
		// await rabbitConnection.init();
		// await indexPDFs();
		await getTopics();
		// start application
		await httpServer();
		await startWs();
		// await messageBroker();
	} catch (error) {
		dump(error);
		process.exit(1);
	}
})();
