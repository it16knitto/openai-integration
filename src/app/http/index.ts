import { logger } from '@knittotextile/knitto-core-backend';
import { ExpressServer } from '@knittotextile/knitto-http';
import {
	APP_EXPOSE_DOCS,
	APP_NAME,
	APP_PORT_HTTP,
	APP_VERSION
} from '@root/libs/config';
import expressJSDocSwagger from 'express-jsdoc-swagger';
import path from 'path';

async function httpServer() {
	try {
		const server = new ExpressServer({
			routerPath: {
				basePath: __dirname,
				exceptDir: [path.join(__dirname, 'middlewares')]
			},
			port: APP_PORT_HTTP
		});

		expressJSDocSwagger(server.app)(swaggerOptions);

		await server.start();
	} catch (error) {
		logger.error('HTTP server error');
		throw error;
	}
}

// see documentation https://brikev.github.io/express-jsdoc-swagger-docs/#/
const swaggerOptions = {
	info: {
		version: `${APP_VERSION}`,
		title: `${APP_NAME}`,
		description: 'KNITTO API DOCUMENTATION'
	},
	security: {
		BearerAuth: {
			type: 'http',
			scheme: 'bearer'
		}
	},
	baseDir: __dirname,
	filesPattern: './**/*.routes.{js,ts}',
	swaggerUIPath: '/docs',
	exposeSwaggerUI: APP_EXPOSE_DOCS,
	// Expose Open API JSON Docs documentation in `apiDocsPath` path.
	exposeApiDocs: APP_EXPOSE_DOCS,
	// Open API JSON Docs endpoint.
	apiDocsPath: '/json-api-docs',
	// Set non-required fields as nullable by default
	notRequiredAsNullable: false,
	// You can customize your UI options.
	// you can extend swagger-ui-express config. You can checkout an example of this
	// in the `example/configuration/swaggerOptions.js`
	swaggerUiOptions: {},
	multiple: false
};

export default httpServer;
