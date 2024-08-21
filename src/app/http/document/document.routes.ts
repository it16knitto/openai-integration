import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Router } from '@knittotextile/knitto-http';
import { requestHandler } from '@knittotextile/knitto-http';
import { typeFindAll, uploadDocument } from './document.controller';
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
defaultRouter.post(
	'/document/upload',
	upload.single('file'),
	requestHandler(uploadDocument)
);

defaultRouter.get('/type', requestHandler(typeFindAll));
export default defaultRouter;
