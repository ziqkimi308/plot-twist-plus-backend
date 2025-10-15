/**
 * Debug Script Extraction
 * Step through the extraction process to see what's happening
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n=== DEBUGGING SCRIPT EXTRACTION ===\n');

// Read script
const scriptPath = path.join(__dirname, 'data', 'script', 'script-complete.txt');
const script = fs.readFileSync(scriptPath, 'utf-8');

const narratorName = 'NARRATOR';
const lines = script.split('\n');
const scriptElements = [];
let currentCharacter = null;
let currentDialogue = '';
let currentNarration = '';
let lineNumber = 0;
let currentAct = 'ONE';

console.log('Processing around line 95-105 where DR. CROWLEY appears:\n');

for (let i = 0; i < lines.length; i++) {
	const trimmed = lines[i].trim();

	// Only show debug info for lines 95-110
	if (i >= 94 && i <= 110) {
		console.log(`Line ${i + 1}: "${trimmed}"`);

		if (!trimmed) {
			console.log('  → Empty line, skipped');
			continue;
		}

		// Check for character name (allow periods for titles like DR., MR., MRS.)
		const characterMatch = trimmed.match(/^([A-Z][A-Z\s.]+?)(\s*\(.*?\))?:?\s*$/);

		if (characterMatch && trimmed.length > 0 && trimmed.length < 50) {
			const matchedName = characterMatch[1].trim();
			console.log(`  → CHARACTER DETECTED: "${matchedName}"`);

			if (matchedName.toUpperCase() === narratorName.toUpperCase()) {
				console.log(`  → Is NARRATOR, flushing previous narration`);
				if (currentNarration) {
					console.log(`  → Saving narration: "${currentNarration.substring(0, 50)}..."`);
				}
				currentNarration = '';
				currentCharacter = null;
				currentDialogue = '';
			} else {
				console.log(`  → Regular character: ${matchedName}`);
				if (currentNarration) {
					console.log(`  → Saving previous narration: "${currentNarration.substring(0, 50)}..."`);
				}
				currentNarration = '';
				currentCharacter = matchedName;
				currentDialogue = '';
			}
		}
		// Dialogue or narration
		else {
			if (currentCharacter) {
				if (!trimmed.match(/^\(.*\)$/)) {
					let cleanLine = trimmed.replace(/\([^)]*\)/g, '').trim();
					cleanLine = cleanLine.replace(/^["']|["']$/g, '').trim();
					if (cleanLine) {
						console.log(`  → Adding to ${currentCharacter}'s dialogue: "${cleanLine}"`);
						currentDialogue += (currentDialogue ? ' ' : '') + cleanLine;
					} else {
						console.log(`  → Skipped parenthetical`);
					}
				} else {
					console.log(`  → Skipped parenthetical line`);
				}
			} else {
				console.log(`  → Adding to narration: "${trimmed.substring(0, 40)}..."`);
				currentNarration += (currentNarration ? ' ' : '') + trimmed;
			}
		}

		console.log(`  State: character="${currentCharacter}", narration length=${currentNarration.length}, dialogue length=${currentDialogue.length}`);
		console.log('');
	} else {
		// Process normally but don't debug
		if (!trimmed) continue;

		const actMatch = trimmed.match(/^\*\*ACT\s+(ONE|TWO|THREE)\*\*/i);
		if (actMatch) {
			currentAct = actMatch[1].toUpperCase();
			continue;
		}

		const characterMatch = trimmed.match(/^([A-Z][A-Z\s]+?)(\s*\(.*?\))?:?\s*$/);

		if (characterMatch && trimmed.length > 0 && trimmed.length < 50) {
			const matchedName = characterMatch[1].trim();

			if (matchedName.toUpperCase() === narratorName.toUpperCase()) {
				if (currentNarration) {
					scriptElements.push({ character: narratorName, line: currentNarration.trim(), order: lineNumber++ });
					currentNarration = '';
				}
				currentCharacter = null;
				currentDialogue = '';
			} else {
				if (currentNarration) {
					scriptElements.push({ character: narratorName, line: currentNarration.trim(), order: lineNumber++ });
					currentNarration = '';
				}
				if (currentCharacter && currentDialogue) {
					scriptElements.push({ character: currentCharacter, line: currentDialogue.trim(), order: lineNumber++ });
				}
				currentCharacter = matchedName;
				currentDialogue = '';
			}
		} else if (currentCharacter) {
			if (!trimmed.match(/^\(.*\)$/)) {
				let cleanLine = trimmed.replace(/\([^)]*\)/g, '').trim();
				cleanLine = cleanLine.replace(/^["']|["']$/g, '').trim();
				if (cleanLine) {
					currentDialogue += (currentDialogue ? ' ' : '') + cleanLine;
				}
			}
		} else {
			currentNarration += (currentNarration ? ' ' : '') + trimmed;
		}
	}
}

console.log('\n=== END DEBUG ===\n');
