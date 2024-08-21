import { WsServer } from '@root/libs/WsServer';
import { APP_PORT_WS } from '@root/libs/config';

export const wsServerApp = new WsServer();
export const startWs = async () => {
	wsServerApp.start(APP_PORT_WS);
};
