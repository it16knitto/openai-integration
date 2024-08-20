import { flowiseConfig } from '../config';

const flowiseBaseURL = flowiseConfig.baseUrl;

export async function fetchFlowise(predictionId: string, question: string) {
	const url = new URL(`${flowiseBaseURL}/api/v1/prediction/${predictionId}`);
	const response = await fetch(url.toString(), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ question })
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	const data = await response.json();
	return data;
}
