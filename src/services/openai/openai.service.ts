import { openaiConfig } from '@root/libs/config';
import mysqlConnection from '@root/libs/config/mysqlConnection';
import { pdfs } from '@root/libs/helpers/pdf';
import OpenAI from 'openai';

const openai = new OpenAI({
	apiKey: openaiConfig.apiKey
});
enum QuestionTheme {
	FabricTypes = 'FabricTypes',
	FabricCare = 'FabricCare',
	Pricing = 'Pricing',
	Availability = 'Availability',
	CustomOrders = 'CustomOrders',
	Shipping = 'Shipping',
	ReturnsAndExchanges = 'ReturnsAndExchanges',
	StoreLocation = 'StoreLocation',
	FabricUsage = 'FabricUsage',
	Promotions = 'Promotions',
	Undefined = 'Undefined'
}

// Interface untuk menyimpan tema beserta skornya
interface ThemeWithScore {
	theme: QuestionTheme;
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
					content: `Given the PDF: "${pdf.filename}", please answer the question: "${prompt}"
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

		const negativeWords = ['sorry', 'Maaf'];
		if (!negativeWords.some((word) => answer.includes(word))) {
			filename = pdf.filename;

			break;
		}
	}
	return { answer, filename };
}

export async function getQuestionThemesWithScores(
	question: string
): Promise<ThemeWithScore[]> {
	try {
		const prompt = `Classify the following question into one or more of the following themes: ${Object.values(
			QuestionTheme
		).join(', ')}. 
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

			const themeMap = {
				FabricTypes: QuestionTheme.FabricTypes,
				FabricCare: QuestionTheme.FabricCare,
				Pricing: QuestionTheme.Pricing,
				Availability: QuestionTheme.Availability,
				CustomOrders: QuestionTheme.CustomOrders,
				Shipping: QuestionTheme.Shipping,
				ReturnsAndExchanges: QuestionTheme.ReturnsAndExchanges,
				StoreLocation: QuestionTheme.StoreLocation,
				FabricUsage: QuestionTheme.FabricUsage,
				Promotions: QuestionTheme.Promotions
			};
			return { theme: themeMap[theme] || QuestionTheme.Undefined, score };
		});

		// Filter untuk menghapus 'Undefined' dan skor yang sangat rendah (misalnya, < 0.1)
		return themesWithScores.filter(
			(themeWithScore) =>
				themeWithScore.theme !== QuestionTheme.Undefined &&
				themeWithScore.score > 0
		);
	} catch (error) {
		console.error('Error fetching themes with scores:', error);
		return [{ theme: QuestionTheme.Undefined, score: 1 }];
	}
}

export async function processAnswerFromTheme(
	themes: QuestionTheme[],
	prompt: string
) {
	let answer = '';
	// for (const theme of themes) {
	// 	switch (theme) {
	// 		case QuestionTheme.FabricTypes:
	// 			answer = await getAnswerFromTheme(theme, prompt);
	// 			break;
	// 		case QuestionTheme.FabricCare:
	// 			answer = await getAnswerFromTheme(theme, prompt);
	// 			break;
	// 	}
	// }
	return answer;
}
