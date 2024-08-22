import { openaiConfig } from '@root/libs/config';
import mysqlConnection from '@root/libs/config/mysqlConnection';
import { pdfs } from '@root/libs/helpers/pdf';
import { WsMessageResponse } from '@root/libs/WsServer';
import TopicRepository from '@root/repositories/Topic.repository';
import OpenAI from 'openai';

const openai = new OpenAI({
	apiKey: openaiConfig.apiKey
});
export const typesThemes: any[] = [];
const negativeWords = ['sorry', 'Maaf'];
// Interface untuk menyimpan tema beserta skornya
interface TopicWithScore {
	id?: number;
	type: string;
	score: number; // Skor antara 0 dan 1, atau dalam persen
}
export async function getSQLPromptVStok() {
	try {
		const schemaInfo: any[] = await mysqlConnection.raw(
			`SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = ?`,
			['v_stokglobal']
		);

		const createColumns = [];
		const columnNames = [];

		for (const schemaData of schemaInfo) {
			columnNames.push(`${schemaData['COLUMN_NAME']}`);
			createColumns.push(
				`${schemaData['COLUMN_NAME']} ${schemaData['COLUMN_TYPE']} ${
					schemaData['IS_NULLABLE'] === 'NO' ? 'NOT NULL' : ''
				}`
			);
		}

		const sqlCreateTableQuery = `CREATE TABLE v_stokglobal (${createColumns.join(
			', '
		)})`;
		const sqlSelectTableQuery = `SELECT * FROM v_stokglobal LIMIT 3`;

		// Get first 3 rows
		const rows: any = await mysqlConnection.raw(sqlSelectTableQuery);

		const allValues = [];
		for (const row of rows) {
			const rowValues = [];
			for (const colName in row) {
				rowValues.push(row[colName]);
			}
			allValues.push(rowValues.join(' '));
		}

		return (
			sqlCreateTableQuery +
			'\n' +
			sqlSelectTableQuery +
			'\n' +
			columnNames.join(' ') +
			'\n' +
			allValues.join('\n')
		);
	} catch (e) {
		console.error(e);
		throw e;
	}
}
export async function generateSQLQuery(schema: string, promptUser: string) {
	const chatCompletion = await openai.chat.completions.create({
		messages: [
			{
				role: 'user',
				content: `Based on the provided SQL table schema and question below, return a SQL SELECT query that would answer the user's question.
				------------
				SCHEMA: ${schema}
				------------
				QUESTION: ${promptUser}
				------------
				Additional Context:
				- fields that are mostly 0 / null do not need to be displayed
				- default limit 10
				------------
				SQL QUERY:
				`
			}
		],
		temperature: 0.7,
		model: 'gpt-4',
		max_tokens: 150
	});

	return chatCompletion.choices[0].message.content;
}

export async function convertToNaturalLanguage(data) {
	const chatCompletion = await openai.chat.completions.create({
		messages: [
			{
				role: 'user',
				content: `Convert the following SQL query result into a detailed natural language explanation:

				SQL Query Result: ${JSON.stringify(data)}
				
				Additional Context:
				- Use Indonesian Language
				- Explain briefly concisely and clearly
				- dont' use computer language like(query, select)
				`
			}
		],
		temperature: 0.7,
		model: 'gpt-4',
		max_tokens: 250
	});

	return chatCompletion.choices[0].message.content;
}

export async function askQuestionWithFile(
	text: string,
	question: string
): Promise<string> {
	const response = await openai.chat.completions.create({
		model: 'gpt-4',
		messages: [
			{ role: 'system', content: 'You are a helpful assistant.' },
			{
				role: 'user',
				content: `Given the following text: "${text}", please answer the question: "${question}"`
			}
		],
		temperature: 0.5
	});

	return response.choices[0].message.content || '';
}

export async function getEmbeddings(texts) {
	try {
		const response = await openai.embeddings.create({
			input: texts,
			model: 'text-embedding-ada-002'
		});
		return response.data.map((d) => d.embedding);
	} catch (error) {
		console.error('Error getting embeddings:', error);
		return [];
	}
}

export async function askQuestionWithRetrievePDF(prompt: string) {
	let filename: string;

	let answer: string;
	for (const pdf of pdfs) {
		const response = await openai.chat.completions.create({
			model: 'gpt-4o',
			messages: [
				{ role: 'system', content: 'You are a helpful assistant.' },
				{
					role: 'user',
					content: `Given the PDF: "${pdf.text}", please answer the question: "${prompt}"
					Additional Context:
					- Use Indonesian Language
					- Explain briefly concisely and clearly
					- answer as if you were customer service and sales marketing or the owner
					- if the answer is not found, say "Maaf, saya belum memiliki informasi tentang itu. Mungkin Anda bisa mencoba pertanyaan lain."
					`
				}
			],
			temperature: 0.5
		});
		answer = response.choices[0].message.content.trim();

		if (!negativeWords.some((word) => answer.includes(word))) {
			filename = pdf.filename;

			break;
		}
	}
	return { answer, filename };
}

export async function getQuestionThemesWithScores(
	question: string
): Promise<TopicWithScore[]> {
	try {
		const prompt = `Classify the following question into one or more of the following themes: ${typesThemes
			.map((theme) => theme.name)
			.join(', ')}, and other relevant themes. 
        Provide a score between 0 and 100 for each theme indicating how well it fits the question. 
        Format the result as "Theme: Score" pairs, separated by commas:\n\n"${question}"\n\nThemes and Scores:`;

		const response = await openai.chat.completions.create({
			model: 'gpt-4o',
			messages: [
				{ role: 'system', content: 'You are a helpful assistant.' },
				{
					role: 'user',
					content: prompt
				}
			],
			temperature: 0.5
		});
		const result = response.choices[0].message.content?.trim();
		const themeScorePairs = result?.split(',').map((pair) => pair.trim()) || [];

		const themesWithScores = themeScorePairs.map((pair) => {
			const [theme, scoreStr] = pair.split(':').map((item) => item.trim());
			const score = parseFloat(scoreStr) / 100; // Skor diubah menjadi antara 0 dan 1

			const themeMap = typesThemes.reduce((acc, theme) => {
				acc[theme.name] = theme.name;
				return acc;
			}, {});

			return {
				id: typesThemes.find((t) => t.name === theme)?.id || 0,
				type: themeMap[theme] || 'Undefined',
				score
			};
		});
		return themesWithScores
			.filter(
				(themeWithScore) =>
					themeWithScore.type !== 'Undefined' && themeWithScore.score > 0.1
			)
			.sort((a, b) => b.score - a.score);
	} catch (error) {
		console.error('Error fetching themes with scores:', error);
		return [{ id: 0, type: 'Undefined', score: 1 }];
	}
}

export async function processAnswerFromTheme(
	topicsWithScores: TopicWithScore[],
	prompt: string
): Promise<WsMessageResponse> {
	let result: any;
	if (topicsWithScores.length === 0) {
		return {
			from_user_id: 0,
			message:
				'Maaf, saya belum memiliki informasi tentang itu. Mungkin Anda bisa mencoba pertanyaan lain.',
			additional_files: []
		};
	}

	for (const theme of topicsWithScores) {
		if (theme.type === 'Greeting') {
			return {
				from_user_id: 0,
				message: 'Halo, apa yang bisa saya bantu?',
				additional_files: []
			};
		}
		result = await askQuestionWithDocumentTopic(prompt, theme.id);
		if (!negativeWords.some((word) => result.answer.includes(word))) {
			break;
		}
	}
	return {
		from_user_id: 0,
		message: result.answer,
		additional_files: [
			{ filename: result.filename, file_type: result.filename ? 'pdf' : '' }
		]
	};
}
export async function askQuestionWithDocumentTopic(
	prompt: string,
	topicId: number
) {
	const documentTopic: any[] = await mysqlConnection.raw(
		`SELECT document.id, document.parse_text, document.filename
		FROM
		document join relation_document_topic on document.id = relation_document_topic.document_id
		WHERE
		relation_document_topic.topic_id = ?`,
		[topicId]
	);
	if (documentTopic.length === 0) {
		return {
			answer:
				'Maaf, saya belum memiliki informasi tentang itu. Mungkin Anda bisa mencoba pertanyaan lain.',
			filename: ''
		};
	}
	let filename: string;
	let answer: string;
	for (const document of documentTopic) {
		const response = await openai.chat.completions.create({
			model: 'gpt-4o',
			messages: [
				{ role: 'system', content: document.parse_text },
				{
					role: 'user',
					content: `Please answer the question: "${prompt}"
					Additional Context:
					- Use Indonesian Language
					- Explain briefly, concisely, and clearly
					- Answer as if you were a customer service representative, sales marketer, or the owner
					- If the answer is not found, say "Maaf, saya belum memiliki informasi tentang itu. Mungkin Anda bisa mencoba pertanyaan lain."
					`
				}
			],
			temperature: 0.5
		});
		answer = response.choices[0].message.content.trim();

		if (!negativeWords.some((word) => answer.includes(word))) {
			filename = document.filename;

			break;
		}
	}

	return { answer, filename };
}
export async function getDocoumentTopicWithScores(
	document: string
): Promise<TopicWithScore[]> {
	try {
		const prompt = `Classify the following document into one or more of the following themes: ${typesThemes
			.map((theme) => theme.name)
			.join(', ')}, and other relevant themes. 
			Provide a score between 0 and 100 for each theme indicating how well it fits the document.
			Format the result as "Theme: Score" pairs, separated by commas:
			\`\`\`
			${document}
			\`\`\`
			Themes and Scores:`;

		const response = await openai.chat.completions.create({
			model: 'gpt-4',
			messages: [
				{ role: 'system', content: 'You are a helpful assistant.' },
				{
					role: 'user',
					content: prompt
				}
			],
			temperature: 0.5,
			max_tokens: 150
		});
		const result = response.choices[0].message.content?.trim();

		const themeScorePairs = result?.split(',').map((pair) => pair.trim()) || [];

		const themesWithScores = themeScorePairs.map((pair) => {
			const [theme, scoreStr] = pair.split(':').map((item) => item.trim());
			const score = parseFloat(scoreStr) / 100; // Skor diubah menjadi antara 0 dan 1

			// const themeMap = typesThemes.reduce((acc, theme) => {
			// 	acc[theme.name] = theme.name;
			// 	return acc;
			// }, {});

			return {
				type: theme,
				score
			};
		});
		console.log(result);

		return themesWithScores
			.filter(
				(themeWithScore) =>
					themeWithScore.type !== 'Undefined' && themeWithScore.score > 0.1
			)
			.sort((a, b) => b.score - a.score);
	} catch (error) {
		console.error('Error fetching themes with scores:', error);
		return [{ id: 0, type: 'Undefined', score: 1 }];
	}
}

export async function getTypes() {
	const topicRepository = new TopicRepository(mysqlConnection);
	const types: any[] = await topicRepository.findAll();
	if (types.length > 0) {
		typesThemes.push(...types);
	}
}
