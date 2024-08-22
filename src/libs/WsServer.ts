import http from 'node:http';
import { WebSocketServer } from 'ws';
import type { WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { logger } from '@knittotextile/knitto-core-backend';
import { APP_SECRET_KEY } from './config';
import {
	getQuestionThemesWithScores,
	processAnswerFromTheme
} from '@root/services/openai/openai.service';
export interface WsMessageRequest {
	type: string;
	message: string;
	to_user_id?: number;
}
export interface WsMessageResponse {
	message: string;
	additional_files?: WsMessageAdditionalFiles[];
	from_user_id: number;
}
export interface WsMessageAdditionalFiles {
	filename: string;
	content?: string;
	link?: string;
	file_type: string;
}
export class WsServer {
	private readonly server: http.Server;
	private readonly app: WebSocketServer;
	clients = new Map<WebSocket, number>();

	constructor() {
		this.server = http.createServer((_req, res) => {
			res.writeHead(200, { 'content-type': 'text/plain' });
			res.end('WebSocket server');
		});

		this.app = new WebSocketServer({ server: this.server });

		this.app.on('connection', (ws, request) => {
			this.handleConnection(ws, request);
		});
	}

	handleConnection(ws: WebSocket, request: http.IncomingMessage) {
		const token = request.url.split('?token=')[1];

		if (!token) {
			ws.send(JSON.stringify({ status: 'Error', message: 'Token mismatch' }));
			ws.close();
		}

		jwt.verify(token, APP_SECRET_KEY, (err: any, decode: any) => {
			if (err) {
				let msg = 'Invalid Credential';

				if (err.name === 'TokenExpiredError') msg = err.message;

				ws.send(JSON.stringify({ status: 'Error', message: msg }));
				ws.close();
			} else {
				this.clients.set(ws, decode.id as number);
			}
		});

		ws.on('error', (error) => {
			logger.error({ stack: error.stack, msg: error.message });
		});

		ws.on('message', async (message) => {
			try {
				const data: WsMessageRequest = JSON.parse(message.toString('utf-8'));
				if (data.type === 'message') {
					this.sendMessageToUser(data.to_user_id, {
						message: data.message,
						from_user_id: this.clients.get(ws)
					});
				} else if (data.type === 'question') {
					//nanti disini handle type AI nya
					const response = await getQuestionThemesWithScores(data.message);

					const result = await processAnswerFromTheme(response, data.message);
					this.sendMessageToUser(this.clients.get(ws), {
						message: JSON.stringify(result),
						// additional_files: [
						// 	{
						// 		filename: response.filename,
						// 		link: response.filename,
						// 		file_type: 'pdf'
						// 	}
						// ],
						from_user_id: 0
					});
				}
			} catch (error: any) {
				ws.send(
					JSON.stringify({
						status: 'Error',
						message: error.message ?? error.toString()
					})
				);
			}
		});

		ws.on('close', () => {
			this.clients.delete(ws);
		});
	}

	start(port: string) {
		this.server.listen(port, () => {
			logger.info(`[ws] listening on : ${port}`);
		});
	}

	sendMessage(ws: WebSocket, data: string) {
		ws.send(data);
	}
	sendMessageToUser(userId: number, data: WsMessageResponse) {
		for (const [ws, id] of this.clients.entries()) {
			if (id === userId) {
				ws.send(JSON.stringify(data));
				break; // Stop after sending to the specific user
			}
		}
	}
	// sendNotificationBatch(userIds: number[], message: string) {
	// 	for (const userId of userIds) {
	// 		this.sendMessageToUser(userId, message, this.clients.get(ws));
	// 	}
	// }
}
