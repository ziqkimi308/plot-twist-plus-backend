/**
 * Test Voice Mapping
 * Verifies that the correct voices are assigned to each character
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== VOICE MAPPING TEST ===\n');

// Read the plot to extract character genders
const plotPath = path.join(__dirname, 'data', 'plot', 'plot-complete.txt');
const plot = fs.readFileSync(plotPath, 'utf-8');

console.log('📋 Characters from plot:');
const characterSection = plot.match(/\*\*CHARACTERS:\*\*([\s\S]*?)(?=\*\*ACT|$)/i);
if (characterSection) {
	const lines = characterSection[1].split('\n');
	for (const line of lines) {
		const match = line.match(/^-\s*(.+?)\s*\((male|female)\)/i);
		if (match) {
			console.log(`   ${match[1].trim()} - ${match[2]}`);
		}
	}
}

console.log('\n📁 Checking audio files...\n');

// Check voice-act-one
const voiceActOnePath = path.join(__dirname, 'data', 'voice', 'voice-act-one');
if (fs.existsSync(voiceActOnePath)) {
	const files = fs.readdirSync(voiceActOnePath).slice(0, 20);

	console.log('🎵 First 20 files in voice-act-one:');
	files.forEach(file => {
		const match = file.match(/^\d+_(.+)\.mp3$/);
		if (match) {
			console.log(`   ${file} -> Character: ${match[1]}`);
		}
	});
}

console.log('\n📊 Expected voice assignments (based on ttsEngine.js logic):');
console.log('   NARRATOR -> en-US-Wavenet-D (VERY DEEP male narrator)');
console.log('   First male character (JOHN TAYLOR) -> en-GB-Wavenet-D (British main)');
console.log('   First female character (MARRY THOMPSON) -> en-US-Neural2-H (American main)');
console.log('   CROWLEY JENKINS (male) -> Supporting male voice (Indian/Australian)');
console.log('   DR. RACHEL LEE (female) -> Supporting female voice');
console.log('   DR. LIAM CHEN (male) -> Supporting male voice');
console.log('   EMILY PATEL (female) -> Supporting female voice');

console.log('\n⚠️  POTENTIAL ISSUE:');
console.log('   The script uses "JOHN" but plot defines "John Taylor (male)"');
console.log('   The script uses "CROWLEY" but plot defines "Crowley Jenkins (male)"');
console.log('   The script uses "LIAM CHEN" but plot defines "Dr. Liam Chen (male)"');
console.log('   The script uses "EMILY PATEL" but plot defines "Emily Patel (female)"');
console.log('   The script uses "RACHEL LEE" but plot defines "Dr. Rachel Lee (female)"');
console.log('   The script uses "MARILY" but plot defines "Marry Thompson (female)"');
console.log('\n   ⚡ Character name mismatch could cause voice assignment issues!');

console.log('\n=== END TEST ===');
