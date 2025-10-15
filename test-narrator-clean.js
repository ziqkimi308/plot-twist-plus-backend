/**
 * Test if NARRATOR blocks are clean (no character names or parentheticals)
 */

import { extractScriptWithNarration } from './utils/ttsEngine.js';
import fs from 'fs';

console.log('\n=== TESTING NARRATOR NARRATION CLEANLINESS ===\n');

const scriptPath = './data/script/script-complete.txt';
const script = fs.readFileSync(scriptPath, 'utf-8');
const elements = extractScriptWithNarration(script);

// Find NARRATOR elements
const narratorElements = elements.filter(e => e.character === 'NARRATOR');
console.log(`Total NARRATOR elements: ${narratorElements.length}\n`);
console.log('Checking for character names in narration...\n');

let foundIssues = false;
narratorElements.forEach((el, idx) => {
	const line = el.line;
	if (line.includes('DR. CROWLEY') || line.includes('SCIENTIST') || line.includes('(urgently)') || line.includes('(shaking')) {
		console.log(`❌ ISSUE at element ${idx + 1} (order ${el.order}):`);
		console.log(`   ${line.substring(0, 150)}...`);
		console.log('');
		foundIssues = true;
	}
});

if (!foundIssues) {
	console.log('✅ No character names or parentheticals found in NARRATOR blocks!\n');
	console.log('=== SAMPLE NARRATOR LINES ===\n');
	narratorElements.slice(24, 29).forEach(el => {
		console.log(`Order ${el.order}: ${el.line.substring(0, 80)}...`);
	});
}
