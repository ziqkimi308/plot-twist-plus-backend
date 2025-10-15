/**
 * Test to show exact act assignment for ALL elements
 */

import fs from 'fs';
import path from 'path';

const scriptPath = path.join(process.cwd(), 'data', 'script', 'script-complete.txt');
const script = fs.readFileSync(scriptPath, 'utf-8');
const lines = script.split('\n');

// Extract elements the same way as the fixed getActForLine
let elements = [];
let currentAct = 'ONE';
let i = 0;

while (i < lines.length) {
	const line = lines[i].trim();

	// Check for act markers
	const actMatch = line.match(/^\*\*ACT\s+(ONE|TWO|THREE)\*\*/i);
	if (actMatch) {
		currentAct = actMatch[1].toUpperCase();
		console.log(`\n--- ACT ${currentAct} STARTS AT LINE ${i + 1} ---`);
		i++;
		continue;
	}

	// Skip empty lines
	if (!line) {
		i++;
		continue;
	}

	// Check for NARRATOR or CHARACTER blocks
	if (line === 'NARRATOR' || (line === line.toUpperCase() && !line.includes('**') && line.length > 2)) {
		const blockStart = i;
		const character = line;
		i++; // Skip the label line

		// Collect content lines
		let content = [];
		while (i < lines.length) {
			const contentLine = lines[i].trim();
			if (!contentLine) break;
			if (contentLine === 'NARRATOR' || (contentLine === contentLine.toUpperCase() && !contentLine.includes('**') && contentLine.length > 2)) break;
			if (contentLine.match(/^\*\*ACT\s+(ONE|TWO|THREE)\*\*/i)) break;
			content.push(contentLine);
			i++;
		}

		if (content.length > 0) {
			elements.push({
				order: elements.length,
				act: currentAct,
				line: blockStart + 1,
				character,
				content: content.join(' ').substring(0, 50) + '...'
			});
		}
	} else {
		i++;
	}
}

console.log('\n=== ALL ELEMENTS ===');
elements.forEach(el => {
	console.log(`Order ${el.order.toString().padStart(2)}: ACT ${el.act} | Line ${el.line.toString().padStart(3)} | ${el.character.padEnd(15)} | ${el.content}`);
});

console.log('\n=== SUMMARY ===');
const actCounts = elements.reduce((acc, el) => {
	acc[el.act] = (acc[el.act] || 0) + 1;
	return acc;
}, {});

console.log(`ACT ONE: ${actCounts.ONE || 0} elements`);
console.log(`ACT TWO: ${actCounts.TWO || 0} elements`);
console.log(`ACT THREE: ${actCounts.THREE || 0} elements`);
console.log(`Total: ${elements.length} elements`);
