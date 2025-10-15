import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractScriptWithNarration } from './utils/ttsEngine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read script
const scriptPath = path.join(__dirname, 'data', 'script', 'script-complete.txt');
const script = fs.readFileSync(scriptPath, 'utf-8');

// Extract elements
const elements = extractScriptWithNarration(script, {
	narratorName: 'NARRATOR',
	skipSceneHeadings: false,
	skipTransitions: true
});

console.log(`Total elements extracted: ${elements.length}\n`);

// Group by type
const byType = elements.reduce((acc, el) => {
	acc[el.type] = (acc[el.type] || 0) + 1;
	return acc;
}, {});

console.log('By type:', byType);

// Show first and last elements from each section
console.log('\n=== First 3 elements ===');
elements.slice(0, 3).forEach(el => {
	console.log(`${el.order}: [${el.character}] ${el.line.substring(0, 60)}...`);
});

console.log('\n=== Last 3 elements ===');
elements.slice(-3).forEach(el => {
	console.log(`${el.order}: [${el.character}] ${el.line.substring(0, 60)}...`);
});

// Find where each act should start based on content
console.log('\n=== Searching for act transitions in extracted content ===');
elements.forEach((el, i) => {
	if (el.line.includes('Emily') && el.line.includes('What are you talking')) {
		console.log(`Order ${el.order} (index ${i}): Last line before ACT THREE`);
		console.log(`  "${el.line.substring(0, 80)}..."`);
		if (elements[i + 1]) {
			console.log(`Next element: Order ${elements[i + 1].order} - "${elements[i + 1].line.substring(0, 80)}..."`);
		}
	}
});
