import mysqlConnection from '@root/libs/config/mysqlConnection';

import jwt from 'jsonwebtoken';
class CreateCredentialJWT {
	constructor(private readonly id: number) {}

	async generateToken(): Promise<string | null> {
		const checkUser = await mysqlConnection
			.raw<any[]>('SELECT * FROM user WHERE id = ? LIMIT 1', [this.id])
			.then((res) => res[0]);

		if (checkUser) {
			const token = jwt.sign(
				{
					id: checkUser.id,
					username: checkUser.username
				},
				process.env.APP_SECRET_KEY || 'knitto-secret-key',
				{ expiresIn: '1d' }
			);
			return token;
		} else {
			return null;
		}
	}
}

export default CreateCredentialJWT;
