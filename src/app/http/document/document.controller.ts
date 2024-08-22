import { TRequestFunction } from '@knittotextile/knitto-http';
import mysqlConnection from '@root/libs/config/mysqlConnection';
import { extractTextFromPDF } from '@root/libs/helpers/pdf';
import DocumentRepository from '@root/repositories/Document.repository';
import RelationDocumentTopicRepository from '@root/repositories/RelationDocumentTopic.repository';
import { getDocoumentTopicWithScores } from '@root/services/openai/openai.service';

export const uploadDocument: TRequestFunction = async (req) => {
	const filePath = req.file.path;
	const type = req.body.type;
	const typeArray = JSON.parse(type);

	const text = await extractTextFromPDF(filePath);

	await mysqlConnection.transaction(async (trx) => {
		const documentRepository = new DocumentRepository(trx);
		const document: any = await documentRepository.insert({
			filename: req.file.filename,
			hash_file: 'belum',
			parse_text: text
		});
		const documentId = document.insertId;
		if (typeArray.length > 0) {
			const relationDocumentTopicRepository =
				new RelationDocumentTopicRepository(trx);
			await relationDocumentTopicRepository.createMany(typeArray, documentId);
		}
	});
	return { result: true };
};
export const typeFindAll: TRequestFunction = async () => {
	const data = await mysqlConnection.raw(
		'SELECT * FROM type order by name asc'
	);
	return { result: data };
};
export const documentTopicSuggestion: TRequestFunction = async (req) => {
	const filePath = req.file.path;
	const text = await extractTextFromPDF(filePath);
	const data = await getDocoumentTopicWithScores(text);
	return { result: { data, text } };
};
