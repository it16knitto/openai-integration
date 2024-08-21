import * as fs from 'fs';
import csv from 'csv-parser';
import { Pinecone } from '@pinecone-database/pinecone';

import { nama_kain } from './const/nama_kain';
import { jenis_warna } from './const/jenis_warna';
import OpenAI from 'openai';
import { openaiConfig } from '@root/libs/config';

const BATCH_SIZE = 100; // Sesuaikan dengan batasan API dan performa
const pinecone = new Pinecone({
	apiKey: '38717377-43bc-4963-87f3-e86052c1ebd2'
});
const openai = new OpenAI({
	apiKey: openaiConfig.apiKey
});
const index = pinecone.index('data-stock-csv');
// Fungsi untuk mengubah data CSV menjadi vektor
async function transformToVector(row) {
	// Mengubah tanggal ke timestamp
	const date = new Date(row.tanggal_terima).getTime();

	// Ekstrak dan konversi bidang numerik
	const vector = [
		date || 0,
		parseFloat(row.berat_packing) || 0,
		parseFloat(row.berat_panjang) || 0,
		parseFloat(row.panjang_asal) || 0,
		parseFloat(row.panjang_order) || 0,
		parseFloat(row.body) || 0,
		parseFloat(row.netto) || 0,
		parseFloat(row.gramasi) || 0,
		parseFloat(row.lebar) || 0,
		parseFloat(row.harga) || 0,
		parseFloat(row.terima) || 0,
		parseFloat(row.penjualan) || 0,
		parseFloat(row.retur) || 0,
		parseFloat(row.berat_asal) || 0,
		parseFloat(row.b_order) || 0,
		parseFloat(row.berat) || 0
	];

	// Tambahkan metadata
	const metadata = {
		id: row.id,
		nama_kain: row.nama_kain,
		jenis_kain: row.jenis_kain,
		kualitas: row.kualitas,
		jenis_warna: row.jenis_warna,
		status_fisik: row.status_fisik,
		kode: row.kode
	};

	// Encoding data kategori
	const categoricalFields = {
		status_fisik: ['ADA', 'TIDAK ADA'],
		kode: [], // Anda bisa menambahkan kategori
		jenis_kain: ['BODY', 'KRAH', 'MANSET', 'RIB', 'RIBF', 'RIBS'],
		kualitas: ['HITAMAN', 'KW1', 'KW2', 'KW3', 'PUTIHAN'],
		nama_kain: nama_kain,
		jenis_warna: jenis_warna
	};

	for (const [key, categories] of Object.entries(categoricalFields)) {
		const index = categories.indexOf(row[key]);
		vector.push(index >= 0 ? index : -1);
	}

	return { values: vector, metadata };
}

// Fungsi untuk upsert vektor ke Pinecone
export async function upsertVectors(vectors) {
	const batch = [];
	for (let i = 0; i < vectors.length; i++) {
		batch.push({ id: i.toString(), ...vectors[i] });
		if (batch.length >= BATCH_SIZE || i === vectors.length - 1) {
			try {
				const upsertResponse = await index.upsert(batch);
				console.log('Respon Upsert:', upsertResponse);
			} catch (error) {
				console.error('Error during upsert:', error);
			}
			batch.length = 0; // Kosongkan batch setelah upsert
		}
	}
}

// Baca dan proses file CSV
export function processCSV(filePath) {
	const vectors = [];
	fs.createReadStream(filePath)
		.pipe(csv())
		.on('data', async (row) => {
			const vector = await transformToVector(row);
			vectors.push(vector);
			console.log(vector);
		})
		.on('end', async () => {
			console.log('File CSV berhasil diproses');
			await upsertVectors(vectors);
		});
}

export async function generateAndSearch(query) {
	try {
		// Generate embeddings for the query
		const embeddingResponse = await openai.embeddings.create({
			model: 'text-embedding-ada-002', // Or any other embedding model
			input: query
		});

		const queryEmbedding = embeddingResponse.data[0].embedding;

		// Query Pinecone with the generated embedding
		const searchResponse = await index.query({
			vector: queryEmbedding,
			topK: 5 // Number of similar items to retrieve
		});

		console.log('Search Results:', searchResponse);
	} catch (error) {
		console.error('Error:', error);
	}
}
