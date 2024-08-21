import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

export const pdfs: any[] = [];

export async function createPDF(dataArray: any[]) {
	const pdfDoc = await PDFDocument.create();
	let page = pdfDoc.addPage([600, 800]);

	let yPosition = 750;
	const titleFontSize = 24;
	const itemFontSize = 20;
	const detailFontSize = 18;
	const margin = 50;

	page.drawText('Dynamic PDF Generation', {
		x: margin,
		y: yPosition,
		size: titleFontSize,
		color: rgb(0, 0, 0)
	});

	yPosition -= 50;

	dataArray.forEach((data, index) => {
		page.drawText(`Item ${index + 1}:`, {
			x: margin,
			y: yPosition,
			size: itemFontSize,
			color: rgb(0, 0, 0)
		});

		yPosition -= 30;

		for (const [key, value] of Object.entries(data)) {
			page.drawText(`${key}: ${value}`, {
				x: margin + 20,
				y: yPosition,
				size: detailFontSize,
				color: rgb(0.2, 0.2, 0.2)
			});
			yPosition -= 25;
		}

		yPosition -= 20;

		if (yPosition < margin) {
			yPosition = 750;
			page = pdfDoc.addPage([600, 800]);
		}
	});

	const pdfBytes = await pdfDoc.save();
	const base64String = Buffer.from(pdfBytes).toString('base64');
	return base64String;
}
export async function indexPDFs() {
	const pdfDir = './storage/static/private/pdfs';
	const files = fs.readdirSync(pdfDir);

	for (const file of files) {
		const filePath = path.join(pdfDir, file);
		const dataBuffer = fs.readFileSync(filePath);
		const pdfData = await pdfParse(dataBuffer);

		pdfs.push({
			filename: file,
			text: pdfData.text,
			path: filePath
		});
	}
}
