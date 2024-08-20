import { TRequestFunction } from '@knittotextile/knitto-http';
import mysqlConnection from '@root/libs/config/mysqlConnection';
import { fetchFlowise } from '@root/libs/helpers/fetch';
import {
	askQuestionWithFile,
	convertToNaturalLanguage,
	generateSQLQuery,
	getSQLPromptVStok
} from '@root/services/openai/openai.service';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import csv from 'csv-parser';
import { createPDF } from '@root/libs/helpers/pdf';

async function extractTextFromPDF(filePath: string): Promise<string> {
	const dataBuffer = fs.readFileSync(filePath);
	const data = await pdfParse(dataBuffer);
	return data.text;
}

async function extractDataFromCSV(filePath: string): Promise<string[]> {
	const rows: string[] = [];

	return new Promise((resolve, reject) => {
		fs.createReadStream(filePath)
			.pipe(csv())
			.on('data', (data) => {
				rows.push(JSON.stringify(data));
			})
			.on('end', () => {
				resolve(rows);
			})
			.on('error', (error) => {
				reject(error);
			});
	});
}

export const aiChatGenerate: TRequestFunction = async (req) => {
	const { prompt } = req.body;

	let answer: any;
	let data: any[];
	let additional_files;
	const response = await fetchFlowise(
		'f9d31cdf-1416-4f56-a978-049689b165c0',
		prompt
	);
	answer = response.text;

	if (answer.match(/belum bisa/)) {
		const promptVstok = await getSQLPromptVStok();
		const retreiveSQLQuery = await generateSQLQuery(promptVstok, prompt);
		const sqlQuery = retreiveSQLQuery.trim();
		if (sqlQuery.includes('SELECT') && sqlQuery.includes('v_stokglobal')) {
			data = await mysqlConnection.raw(sqlQuery);
			answer = await convertToNaturalLanguage(data);
			if (data.length > 0) {
				const pdfFile = await createPDF(data);
				additional_files = [{ file_name: '.pdf', base64File: pdfFile }];
			}
		} else {
			answer = 'SQL query tidak valid';
		}
	}

	return { statusCode: 201, result: { prompt, answer, additional_files } };
};

export const aiChatGenerateWithPDF: TRequestFunction = async (req) => {
	const pdfPath = req.file?.path;
	const { prompt } = req.body;

	const text = await extractTextFromPDF(pdfPath);

	const answer = await askQuestionWithFile(text, prompt);

	return { result: { prompt, answer } };
};

export const aiChatGenerateWithCSV: TRequestFunction = async (req) => {
	const csvPath = req.file?.path;
	const { prompt } = req.body;

	const csvData = await extractDataFromCSV(csvPath);
	const csvText = csvData.join('\n');

	const answer = await askQuestionWithFile(csvText, prompt);

	return { result: { prompt, answer } };
};
