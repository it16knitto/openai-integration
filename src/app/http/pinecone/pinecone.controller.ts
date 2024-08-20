import { TRequestFunction } from '@knittotextile/knitto-http';
import { getEmbeddings } from '@root/services/openai/openai.service';
import { uploadToPinecone } from '@root/services/pinecone/pinecone.service';
import csv from 'csv-parser';
import fs from 'fs';

const processCSV = async (filePath) => {
	const batchSize = 100; // Ukuran batch untuk embedding dan upload
	const overlapSize = 10; // Ukuran overlap untuk memastikan tidak kehilangan konteks
	let currentBatch = [];
	let currentId = 0;

	return new Promise((resolve, reject) => {
		fs.createReadStream(filePath)
			.pipe(csv())
			.on('data', async (row) => {
				const text = row.text || '';
				const id = row.id || (++currentId).toString(); // ID unik untuk setiap vektor

				currentBatch.push({ id, text });

				if (currentBatch.length >= batchSize) {
					const texts = currentBatch.map((item) => item.text);
					const embeddings = await getEmbeddings(texts);

					const vectors = embeddings.map((embedding, index) => ({
						id: currentBatch[index].id,
						values: embedding
					}));

					await uploadToPinecone(vectors);
					currentBatch = [];
				}
			})
			.on('end', async () => {
				if (currentBatch.length > 0) {
					const texts = currentBatch.map((item) => item.text);
					const embeddings = await getEmbeddings(texts);

					const vectors = embeddings.map((embedding, index) => ({
						id: currentBatch[index].id,
						values: embedding
					}));

					await uploadToPinecone(vectors);
				}
				resolve(true);
			})
			.on('error', (error) => {
				reject(error);
			});
	});
};
export const pineconeImportCSVtoDB: TRequestFunction = async (req) => {};
