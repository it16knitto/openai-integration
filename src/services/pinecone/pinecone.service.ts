import { Pinecone } from '@pinecone-database/pinecone';
const pinecone = new Pinecone({
	apiKey: '38717377-43bc-4963-87f3-e86052c1ebd2'
});

const index = pinecone.index('data-csv');
export async function uploadToPinecone(vectors) {
	try {
		await index.upsert(vectors);
	} catch (error) {
		console.error('Error uploading to Pinecone:', error);
	}
}
