import { TRequestFunction } from '@knittotextile/knitto-http';
import mysqlConnection from '@root/libs/config/mysqlConnection';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
const calculateHash = (filePath, callback) => {
	const hash = crypto.createHash('sha256');
	const stream = fs.createReadStream(filePath);

	stream.on('data', (chunk) => hash.update(chunk));
	stream.on('end', () => callback(null, hash.digest('hex')));
	stream.on('error', (err) => callback(err));
};

export const uploadDocument: TRequestFunction = async (req) => {
	const filePath = req.file.path;
	console.log(req.file);

	return { result: filePath };
};
export const typeFindAll: TRequestFunction = async (req) => {
	const data = await mysqlConnection.raw('SELECT * FROM type');
	return { result: data };
};
