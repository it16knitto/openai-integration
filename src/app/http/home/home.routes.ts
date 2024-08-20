import { Router, requestHandler, requestValidator } from '@knittotextile/knitto-http';
import {  home, sampleValidation } from './home.controller';
import homeRequest from './home.request';

const defaultRouter = Router();

/**
 * GET /
 * @tags Common
 * @summary informasi aplikasi dan healthcheck
 * @return {object} 200 - success
 * @example response - 200 - success
 * {
 * 	"message": "Success",
 * 	"result": {
 * 		"APP_NAME": "rest-boilerplate-ts",
 * 		"APP_VERSION": "0.6.0"
 * 	}
 * }
 */
defaultRouter.get('/', requestHandler(home));

/**
 * GET /sample-validation
 * @tags Common
 * @summary contoh penggunaan validasi
 * @param {string} name.query.required - contoh: test
 * @return {object} 200 - success
 * @return {object} 400 - bad request
 * @example response - 200 - success
 * {
 *   "message": "Success",
 *   "result": {
 *     "name": "test"
 *   }
 * }
 * @example response - 400 - bad request
 * {
 *   "message": "Name harus berupa string",
 *   "result": null
 * }
 */
defaultRouter.get('/sample-validation',
	requestValidator({
		requestType: 'query',
		type: homeRequest.sampleValidation
	}),
	requestHandler(sampleValidation)
);

export default defaultRouter;
