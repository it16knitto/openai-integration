import { openaiConfig } from '@root/libs/config';
import mysqlConnection from '@root/libs/config/mysqlConnection';
import OpenAI from 'openai';

const openai = new OpenAI({
	apiKey: openaiConfig.apiKey
});

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
