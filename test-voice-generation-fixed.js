/**
 * Test Voice Generation with Fixed Assignments
 * This will regenerate voices using the corrected logic
 */

import { generateScriptVoices } from './utils/ttsEngine.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n' + '='.repeat(80));
console.log('TESTING VOICE GENERATION WITH FIXED ASSIGNMENTS');
console.log('='.repeat(80) + '\n');

try {
	// Clear old voice data
	const voiceDir = path.join(__dirname, 'data', 'voice');
	if (fs.existsSync(voiceDir)) {
		console.log('🗑️  Clearing old voice data...');
		fs.rmSync(voiceDir, { recursive: true, force: true });
		console.log('✅ Old voice data cleared\n');
	}

	console.log('🎙️  Generating voices with corrected assignments...\n');
	console.log('Settings:');
	console.log('  - Provider: google-cloud-tts');
	console.log('  - Include narration: true');
	console.log('  - Narrator voice: en-US-Wavenet-D (VERY DEEP male)');
	console.log('  - Main character detection: FROM PLOT ORDER\n');

	// Generate voices with the fixed logic
	const results = await generateScriptVoices({
		provider: 'google-cloud-tts',
		includeNarration: true,
		narratorVoice: 'en-US-Wavenet-D',
		voiceMapping: {} // Let auto-assignment handle it
	});

	console.log('\n' + '='.repeat(80));
	console.log('GENERATION COMPLETE');
	console.log('='.repeat(80) + '\n');

	// Analyze results by character
	const byCharacter = {};
	for (const result of results) {
		if (!byCharacter[result.character]) {
			byCharacter[result.character] = {
				count: 0,
				voice: result.voice,
				provider: result.provider,
				examples: []
			};
		}
		byCharacter[result.character].count++;
		if (byCharacter[result.character].examples.length < 2) {
			byCharacter[result.character].examples.push({
				order: result.order,
				line: result.line.substring(0, 50) + '...',
				file: result.audioFile
			});
		}
	}

	console.log('📊 VOICE ASSIGNMENTS BY CHARACTER:\n');
	console.log('-'.repeat(80));

	const sortedCharacters = Object.keys(byCharacter).sort();
	for (const char of sortedCharacters) {
		const info = byCharacter[char];
		const isMain = (char === 'JOHN' || char === 'MARRY');
		const icon = isMain ? '👑' : '  ';

		console.log(`${icon} ${char.padEnd(15)} | Voice: ${info.voice?.padEnd(25) || 'N/A'} | Lines: ${info.count}`);

		if (info.examples.length > 0) {
			console.log(`   Example: "${info.examples[0].line}"`);
		}
	}

	console.log('\n' + '-'.repeat(80));
	console.log(`Total audio files generated: ${results.length}`);
	console.log(`Successful: ${results.filter(r => r.success).length}`);
	console.log(`Failed: ${results.filter(r => !r.success).length}`);

	// Check act distribution
	const byAct = { ONE: 0, TWO: 0, THREE: 0 };
	for (const result of results) {
		if (result.act && byAct[result.act] !== undefined) {
			byAct[result.act]++;
		}
	}

	console.log('\n📂 FILES BY ACT:');
	console.log(`   Act ONE: ${byAct.ONE} files`);
	console.log(`   Act TWO: ${byAct.TWO} files`);
	console.log(`   Act THREE: ${byAct.THREE} files`);

	console.log('\n✅ Voice generation test complete!');
	console.log('\n' + '='.repeat(80) + '\n');

} catch (error) {
	console.error('\n❌ ERROR:', error.message);
	console.error(error.stack);
	process.exit(1);
}
