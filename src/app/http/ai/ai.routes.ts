import { requestHandler, Router } from '@knittotextile/knitto-http';
import {
	aiAskQuestionRetrievePDF,
	aiChatGenerate,
	aiChatGenerateWithCSV,
	aiChatGenerateWithPDF,
	aiConvertationPinecone,
	aiImportCSVToPinecone
} from './ai.controller';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/');
	},
	filename: function (req, file, cb) {
		const uniqueSuffix =
			Date.now() + '-' + crypto.randomBytes(4).toString('hex');
		cb(
			null,
			file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
		);
	}
});
const upload = multer({ storage });

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

defaultRouter.post(
	'/ai/import-csv',
	upload.single('csv'),
	requestHandler(aiImportCSVToPinecone)
);
defaultRouter.post('/ai/pinecone', requestHandler(aiConvertationPinecone));
defaultRouter.post(
	'/ai/retrieve-pdf',
	requestHandler(aiAskQuestionRetrievePDF)
);
export default defaultRouter;
