import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Router } from '@knittotextile/knitto-http';
import { requestHandler } from '@knittotextile/knitto-http';
import {
	documentTopicSuggestion,
	topicFindAll,
	uploadDocument
} from './document.controller';
import { getTopics } from '@root/services/openai/openai.service';
const storage = multer.diskStorage({
	destination: function (_, __, cb) {
		cb(null, 'uploads/');
	},
	filename: function (_, file, cb) {
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
defaultRouter.post(
	'/document/upload',
	upload.single('file'),
	requestHandler(uploadDocument)
);
defaultRouter.post(
	'/document/topic-suggestion',
	upload.single('file'),
	requestHandler(documentTopicSuggestion)
);
defaultRouter.get('/topic', requestHandler(topicFindAll));
defaultRouter.get('/topic/fetch', requestHandler(getTopics));
export default defaultRouter;
