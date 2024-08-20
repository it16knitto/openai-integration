import { logger } from '@knittotextile/knitto-core-backend';
import httpServer from '../src/app/http';
import listener from '../src/app/listener';
import { connectionMysql } from '../src/config/dbConnection';
import { rabbitConnection } from '../src/config/rabbitConnection';

import startApp from '../src'

jest.mock('@knittotextile/knitto-core-backend', () => ({
	logger: {
		error: jest.fn(),
	},
}));


jest.mock('../src/config/dbConnection', () => ({
	connectionMysql: {
		init: jest.fn(),
	},
}));

jest.mock('../src/config/rabbitConnection', () => ({
	rabbitConnection: {
		init: jest.fn(),
	},
}));

jest.mock('../src/app/listener', () => jest.fn());
jest.mock('../src/app/http', () => jest.fn());



describe('Pengujian pemanggilan aplikasi', () => {
	test('pastikan database, listener dan http dijalankan', async () => {
		await startApp()
		expect(connectionMysql.init).toHaveBeenCalledTimes(1);
		expect(rabbitConnection.init).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledTimes(1);
		expect(httpServer).toHaveBeenCalledTimes(1);
	})

	test('pengujian catch pada index dengan error database', async () => {
		(connectionMysql.init as jest.Mock).mockRejectedValue(new Error('MySQL connection error'));

		try {
			await startApp();
		} catch (error) {
			expect(logger.error).toHaveBeenCalledWith(new Error('MySQL connection error'));

			expect(error.message).toBe('MySQL connection error');
		}
	});
})
