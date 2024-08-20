import { MySqlConnector } from '@knittotextile/knitto-mysql';
import { mysqlConfig, NODE_ENV } from '.';

const mysqlConnection = new MySqlConnector(
	{
		host: mysqlConfig.HOST,
		database: mysqlConfig.NAME,
		port: Number(mysqlConfig.PORT),
		user: mysqlConfig.USER,
		password: mysqlConfig.PASSWORD
	},
	NODE_ENV !== 'production'
);

export default mysqlConnection;
