import jwt from 'jsonwebtoken';
import { ExpressType, sendResponse } from '@knittotextile/knitto-http';
import { APP_SECRET_KEY } from '@root/libs/config';

const authorizeMiddlware = (
	req: ExpressType.Request,
	res: ExpressType.Response,
	next: ExpressType.NextFunction
) => {
	const tokenHeader = req.headers.authorization;
	if (!tokenHeader) {
		sendResponse({ status: 403, message: 'Authentication required.' }, res);
		return;
	}

	const token: string[] = tokenHeader.split(' ');
	switch (true) {
		case token === undefined:
			sendResponse({ status: 400, result: 'Error token null' }, res);
			break;
		case token.length < 2:
			sendResponse({ status: 400, result: 'Error token length' }, res);
			break;
		case token[0] !== 'Bearer':
			sendResponse({ status: 400, result: 'Error Token Format' }, res);
			break;
		case !token[1]:
			sendResponse({ status: 400, result: 'Error Token Format Body' }, res);
			break;
		default:
			jwt.verify(token[1], APP_SECRET_KEY, (err: any, decode: any) => {
				if (err) sendResponse({ status: 401, result: 'Token Expired' }, res);
				else {
					(req as any).user = { id: decode.id, username: decode.username };
					next();
				}
			});
			break;
	}
};

export default authorizeMiddlware;
