import { requestHandler, Router } from '@knittotextile/knitto-http';
import {
	aiChatGenerate,
	aiChatGenerateWithCSV,
	aiChatGenerateWithPDF
} from './ai.controller';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const defaultRouter = Router();

/**
 * POST /ai/chat-ai
 * @tags Common
 * @summary AI Chat Generate
 * @typedef {object} Chat
 * @property {string} prompt.required - The username
 * @param {Chat} request.body.required - login request
 * @return {object} 201 - success
 * @example response - 201 - success
 * {
 * 	"message": "Success",
 * 	"result": {
 * 	}
 * }
 */
defaultRouter.post('/ai/chat-ai', requestHandler(aiChatGenerate));

/**
 * POST /ai/chat-ai-with-pdf
 * @tags Common
 * @summary AI Chat Generate with PDF
 * @typedef {object} Chat
 * @property {string} prompt.required - The username
 * @param {Chat} request.body.required - login request
 * @return {object} 201 - success
 * @example response - 201 - success
 * {
 * 	"message": "Success",
 * 	"result": {
 * 	}
 * }
 */
defaultRouter.post(
	'/ai/chat-ai-with-pdf',
	upload.single('pdf'),
	requestHandler(aiChatGenerateWithPDF)
);
defaultRouter.post(
	'/ai/chat-ai-with-csv',
	upload.single('csv'),
	requestHandler(aiChatGenerateWithCSV)
);
export default defaultRouter;
