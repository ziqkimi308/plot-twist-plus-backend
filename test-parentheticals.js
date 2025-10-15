/**
 * Test Parenthetical Stripping
 * Check if parentheticals are being properly removed from dialogue
 */

import { extractScriptWithNarration } from './utils/ttsEngine.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n=== TESTING PARENTHETICAL STRIPPING ===\n');

// Read script
const scriptPath = path.join(__dirname, 'data', 'script', 'script-complete.txt');
const script = fs.readFileSync(scriptPath, 'utf-8');

// Extract with narration
const elements = extractScriptWithNarration(script, {
	narratorName: 'NARRATOR',
	skipSceneHeadings: false,
	skipTransitions: true
});

console.log('Checking for parentheticals in extracted dialogue:\n');

let foundIssues = false;

for (const element of elements) {
	// Check if line contains parentheticals
	if (element.line.includes('(') && element.line.includes(')')) {
		console.log(`❌ ISSUE FOUND:`);
		console.log(`   Character: ${element.character}`);
		console.log(`   Type: ${element.type}`);
		console.log(`   Order: ${element.order}`);
		console.log(`   Line: "${element.line}"`);
		console.log('');
		foundIssues = true;
	}
}

if (!foundIssues) {
	console.log('✅ No parentheticals found in extracted dialogue!');
	console.log('   All parenthetical directions have been properly stripped.\n');
} else {
	console.log('\n⚠️  Issues found - parentheticals are NOT being stripped properly!\n');
}

// Show a few examples of what WAS extracted
console.log('=== SAMPLE EXTRACTED LINES ===\n');

const samples = elements.filter(e => e.character !== 'NARRATOR').slice(0, 10);
samples.forEach(s => {
	console.log(`${s.character}: "${s.line.substring(0, 60)}..."`);
});

console.log('\n');
