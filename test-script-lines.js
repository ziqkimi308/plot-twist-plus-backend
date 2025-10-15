import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read script
const scriptPath = path.join(__dirname, 'data', 'script', 'script-complete.txt');
const script = fs.readFileSync(scriptPath, 'utf-8');

// Count lines
const lines = script.split('\n');
console.log('Total lines in script:', lines.length);

// Find ACT markers
const actMarkers = [];
lines.forEach((line, i) => {
	if (/^\*\*ACT\s+(ONE|TWO|THREE)\*\*/i.test(line.trim())) {
		actMarkers.push({ line: i + 1, text: line.trim() });
	}
});

console.log('\nACT Markers:');
actMarkers.forEach(m => console.log(`  Line ${m.line}: ${m.text}`));

// Count non-empty lines per act
let actOnLines = 0, actTwoLines = 0, actThreeLines = 0;
let currentAct = 'ONE';

lines.forEach((line, i) => {
	// Check for act marker
	if (/^\*\*ACT\s+ONE\*\*/i.test(line.trim())) currentAct = 'ONE';
	else if (/^\*\*ACT\s+TWO\*\*/i.test(line.trim())) currentAct = 'TWO';
	else if (/^\*\*ACT\s+THREE\*\*/i.test(line.trim())) currentAct = 'THREE';

	// Skip ACT markers and empty lines
	if (/^\*\*ACT\s+(ONE|TWO|THREE)\*\*/i.test(line.trim())) return;
	if (!line.trim()) return;

	// Count by act
	if (currentAct === 'ONE') actOnLines++;
	else if (currentAct === 'TWO') actTwoLines++;
	else if (currentAct === 'THREE') actThreeLines++;
});

console.log('\nNon-empty lines per act:');
console.log(`  ACT ONE: ${actOnLines} lines`);
console.log(`  ACT TWO: ${actTwoLines} lines`);
console.log(`  ACT THREE: ${actThreeLines} lines`);
console.log(`  Total: ${actOnLines + actTwoLines + actThreeLines} lines`);

// Show last few lines of script
console.log('\nLast 5 non-empty lines:');
const nonEmptyLines = lines.filter(l => l.trim());
nonEmptyLines.slice(-5).forEach((line, i) => {
	console.log(`  ${nonEmptyLines.length - 5 + i + 1}: ${line.substring(0, 60)}...`);
});
