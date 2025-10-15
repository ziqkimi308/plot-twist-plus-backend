/**
 * Comprehensive Voice Assignment Test
 * Shows exactly which voice is assigned to each character
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Copy of extractCharactersFromPlot function from ttsEngine.js
function extractCharactersFromPlot(plot) {
	if (!plot || typeof plot !== 'string') {
		return { genderMap: {}, characterOrder: [] };
	}

	const genderMap = {};
	const characterOrder = []; // Track order characters appear in plot

	const characterSectionMatch = plot.match(/\*\*CHARACTERS:\*\*([\s\S]*?)(?=\*\*ACT|$)/i);

	if (!characterSectionMatch) {
		console.log('⚠️  No CHARACTER section found in plot');
		return { genderMap, characterOrder };
	}

	const characterSection = characterSectionMatch[1];
	const lines = characterSection.split('\n');

	for (const line of lines) {
		const trimmed = line.trim();
		const match = trimmed.match(/^-\s*(.+?)\s*\((male|female)\)/i);
		if (match) {
			const fullName = match[1].trim().toUpperCase();
			const gender = match[2].toLowerCase();

			genderMap[fullName] = gender;

			// Track character order (first character in list = main character)
			if (!characterOrder.find(c => c.name === fullName)) {
				characterOrder.push({ name: fullName, gender });
			}

			const nameParts = fullName.split(/\s+/);
			const commonTitles = ['DR.', 'DR', 'MR.', 'MR', 'MRS.', 'MRS', 'MS.', 'MS', 'MISS', 'NURSE', 'OFFICER', 'DETECTIVE', 'PROFESSOR', 'PROF.', 'PROF'];

			let firstName = nameParts[0];
			if (commonTitles.includes(nameParts[0]) && nameParts.length > 1) {
				firstName = nameParts[1];
				const nameWithoutTitle = nameParts.slice(1).join(' ');
				if (!genderMap[nameWithoutTitle]) {
					genderMap[nameWithoutTitle] = gender;
				}
			}

			if (firstName && firstName !== fullName && !commonTitles.includes(firstName)) {
				if (!genderMap[firstName]) {
					genderMap[firstName] = gender;
				}
			}
		}
	}

	return { genderMap, characterOrder };
}

console.log('\n' + '='.repeat(80));
console.log('COMPREHENSIVE VOICE ASSIGNMENT DIAGNOSTIC');
console.log('='.repeat(80) + '\n');

// Step 1: Read plot and extract character genders
const plotPath = path.join(__dirname, 'data', 'plot', 'plot-complete.txt');
const plot = fs.readFileSync(plotPath, 'utf-8');
const extracted = extractCharactersFromPlot(plot);
const characterGenders = extracted.genderMap;
const characterOrder = extracted.characterOrder;

console.log('📋 CHARACTER GENDERS EXTRACTED FROM PLOT:');
console.log('-'.repeat(80));
Object.entries(characterGenders).forEach(([name, gender]) => {
	console.log(`   ${name.padEnd(25)} -> ${gender}`);
});

// Step 2: Read script and extract unique characters
const scriptPath = path.join(__dirname, 'data', 'script', 'script-complete.txt');
const script = fs.readFileSync(scriptPath, 'utf-8');

const lines = script.split('\n');
const charactersInScript = new Set();

for (const line of lines) {
	const trimmed = line.trim();
	const characterMatch = trimmed.match(/^([A-Z][A-Z\s]+?)(\s*\(.*?\))?:?\s*$/);
	if (characterMatch && trimmed.length > 0 && trimmed.length < 50) {
		const charName = characterMatch[1].trim();
		charactersInScript.add(charName);
	}
}

console.log('\n🎬 CHARACTERS FOUND IN SCRIPT:');
console.log('-'.repeat(80));
Array.from(charactersInScript).sort().forEach(char => {
	console.log(`   ${char}`);
});

// Step 3: Simulate voice assignment logic
console.log('\n🎙️  VOICE ASSIGNMENT SIMULATION:');
console.log('-'.repeat(80));

const gcpMainMale = 'en-GB-Wavenet-D';      // British, deep & fierce
const gcpMainFemale = 'en-US-Neural2-H';    // American female, clear & strong
const gcpSupportingFemale = [
	'en-GB-Neural2-A',      // British female
	'en-AU-Neural2-A',      // Australian female
	'en-IN-Neural2-A',      // Indian female
	'en-AU-Wavenet-A',      // Australian Wavenet female
];
const gcpSupportingMale = [
	'en-IN-Neural2-B',      // Indian accent (Asia)
	'en-AU-Neural2-D',      // Australian accent
	'en-IN-Wavenet-B',      // Indian Wavenet
	'en-AU-Wavenet-D',      // Australian Wavenet
	'en-GB-Neural2-B',      // British (lighter than main)
];
const gcpNarrator = 'en-US-Wavenet-D'; // VERY DEEP male narrator

const FEMALE_NAMES = new Set([
	'SARAH', 'EMILY', 'EMMA', 'ANNA', 'LUCY', 'OLIVIA', 'AVA', 'MIA', 'SOPHIA', 'ISABELLA', 'CHARLOTTE', 'RACHEL', 'BELLA', 'ELLI', 'AMELIA', 'GRACE', 'ELLA', 'LILY', 'JESSICA', 'JENNIFER', 'LISA', 'MICHELLE', 'AMANDA', 'STEPHANIE', 'NICOLE', 'HANNAH', 'MADISON', 'CHLOE'
]);
const MALE_NAMES = new Set([
	'JOHN', 'JACK', 'JAMES', 'MIKE', 'MICHAEL', 'MARCUS', 'ADAM', 'ANTONI', 'ARNOLD', 'HENRY', 'WILLIAM', 'LIAM', 'NOAH', 'SAM', 'JOSH', 'SCOTT', 'DAVID', 'ROBERT', 'DANIEL', 'MATTHEW', 'JOSEPH', 'ANDREW', 'RYAN', 'CHRISTOPHER', 'BRIAN', 'KEVIN', 'THOMAS', 'JASON', 'BRANDON', 'ERIC', 'TYLER', 'JUSTIN', 'BENJAMIN', 'JACOB', 'ALEXANDER', 'NATHAN', 'JONATHAN', 'LUKE', 'MARK', 'PAUL', 'PETER', 'STEVEN', 'PATRICK', 'SEAN', 'KYLE', 'DEREK', 'CHAD', 'TRAVIS', 'CONNOR', 'ETHAN', 'OLIVER', 'SEBASTIAN', 'OWEN', 'CALEB', 'DYLAN', 'LUCAS', 'MASON', 'LOGAN', 'CARTER', 'JACKSON', 'HUNTER', 'AARON', 'GABRIEL', 'JULIAN', 'WYATT', 'ISAAC', 'CHARLES', 'GEORGE', 'FRANK', 'RICHARD', 'ANTHONY', 'DONALD', 'KENNETH', 'GARY', 'LARRY', 'TERRY', 'JERRY', 'DENNIS', 'WAYNE', 'RANDY', 'GREGORY', 'RONALD', 'TIMOTHY', 'EDWARD', 'JEFFREY', 'LAWRENCE'
]);

const guessGender = (name) => {
	const nameUpper = String(name || '').toUpperCase().trim();

	// PRIORITY 1: Use extracted gender from CHARACTER section in plot
	if (characterGenders[nameUpper]) {
		return { gender: characterGenders[nameUpper], source: 'plot' };
	}

	// PRIORITY 2: Fallback to name guessing
	const first = nameUpper.split(/\s|\(/)[0];
	if (FEMALE_NAMES.has(first)) {
		return { gender: 'female', source: 'name-list' };
	}
	if (MALE_NAMES.has(first)) {
		return { gender: 'male', source: 'name-list' };
	}
	if (first.endsWith('A')) {
		return { gender: 'female', source: 'name-pattern' };
	}

	return { gender: 'unknown', source: 'none' };
};

let fIdx = 0, mIdx = 0, uIdx = 0;
let mainMaleAssigned = false, mainFemaleAssigned = false;
const autoMapping = {};

// Assign narrator first
autoMapping['NARRATOR'] = gcpNarrator;

// Determine main characters from plot order (first male and first female in characterOrder)
let mainMaleCharacter = null;
let mainFemaleCharacter = null;

if (characterOrder && characterOrder.length > 0) {
	// Find first male and first female from plot order
	for (const charInfo of characterOrder) {
		if (!mainMaleCharacter && charInfo.gender === 'male') {
			mainMaleCharacter = charInfo.name;
			console.log(`   👑 Main male character from plot: ${mainMaleCharacter}`);
		}
		if (!mainFemaleCharacter && charInfo.gender === 'female') {
			mainFemaleCharacter = charInfo.name;
			console.log(`   👑 Main female character from plot: ${mainFemaleCharacter}`);
		}
		if (mainMaleCharacter && mainFemaleCharacter) break;
	}
}

console.log(`\n`);

const sortedChars = Array.from(charactersInScript).filter(c => c !== 'NARRATOR').sort();

for (const ch of sortedChars) {
	const up = String(ch).toUpperCase();
	const { gender, source } = guessGender(ch);

	let assignedVoice;
	let voiceType;

	// Check if this character is a main character based on plot order
	const isMainMale = mainMaleCharacter && (
		up === mainMaleCharacter ||
		up === mainMaleCharacter.split(' ')[0] || // First name
		up === mainMaleCharacter.replace(/^(DR\.|MR\.|MRS\.|MS\.)\s+/i, '') // Without title
	);
	const isMainFemale = mainFemaleCharacter && (
		up === mainFemaleCharacter ||
		up === mainFemaleCharacter.split(' ')[0] || // First name
		up === mainFemaleCharacter.replace(/^(DR\.|MR\.|MRS\.|MS\.)\s+/i, '') // Without title
	);

	if (gender === 'female') {
		if (isMainFemale && !mainFemaleAssigned) {
			assignedVoice = gcpMainFemale;
			voiceType = '👑 MAIN Female (American) [from plot]';
			mainFemaleAssigned = true;
		} else {
			assignedVoice = gcpSupportingFemale[fIdx % gcpSupportingFemale.length];
			voiceType = `Supporting Female [${fIdx}]`;
			fIdx++;
		}
	} else if (gender === 'male') {
		if (isMainMale && !mainMaleAssigned) {
			assignedVoice = gcpMainMale;
			voiceType = '👑 MAIN Male (British) [from plot]';
			mainMaleAssigned = true;
		} else {
			assignedVoice = gcpSupportingMale[mIdx % gcpSupportingMale.length];
			voiceType = `Supporting Male [${mIdx}]`;
			mIdx++;
		}
	} else {
		const both = [...gcpSupportingFemale, ...gcpSupportingMale];
		assignedVoice = both[uIdx % both.length];
		voiceType = `Unknown Gender [${uIdx}]`;
		uIdx++;
	}

	autoMapping[ch] = assignedVoice;

	console.log(`   ${ch.padEnd(25)} | Gender: ${gender.padEnd(8)} (${source.padEnd(12)}) | ${voiceType.padEnd(35)} | Voice: ${assignedVoice}`);
}

// NARRATOR
console.log(`   ${'NARRATOR'.padEnd(25)} | Gender: ${'male'.padEnd(8)} (${'narrator'.padEnd(12)}) | ${'🎙️  NARRATOR (Deep)'.padEnd(30)} | Voice: ${gcpNarrator}`);

console.log('\n⚠️  CRITICAL ISSUES FOUND:');
console.log('-'.repeat(80));

// Check for name mismatches
const issues = [];

if (charactersInScript.has('MARILY') && !characterGenders['MARILY']) {
	issues.push({
		scriptName: 'MARILY',
		plotName: 'MARRY THOMPSON or Marry Thompson',
		issue: 'Character name MISMATCH - script uses "MARILY" but plot defines "Marry Thompson"'
	});
}

if (charactersInScript.has('JOHN') && !characterGenders['JOHN'] && characterGenders['JOHN TAYLOR']) {
	issues.push({
		scriptName: 'JOHN',
		plotName: 'JOHN TAYLOR',
		issue: 'Partial match - script uses "JOHN", plot defines "John Taylor" - WORKS due to first name extraction'
	});
}

if (charactersInScript.has('CROWLEY') && !characterGenders['CROWLEY'] && characterGenders['CROWLEY JENKINS']) {
	issues.push({
		scriptName: 'CROWLEY',
		plotName: 'CROWLEY JENKINS',
		issue: 'Partial match - script uses "CROWLEY", plot defines "Crowley Jenkins" - WORKS due to first name extraction'
	});
}

if (charactersInScript.has('LIAM CHEN')) {
	const scriptName = 'LIAM CHEN';
	if (!characterGenders[scriptName] && characterGenders['DR. LIAM CHEN']) {
		issues.push({
			scriptName: 'LIAM CHEN',
			plotName: 'DR. LIAM CHEN',
			issue: 'Missing title - script uses "LIAM CHEN", plot defines "Dr. Liam Chen" - May not match'
		});
	}
}

if (charactersInScript.has('EMILY PATEL')) {
	const scriptName = 'EMILY PATEL';
	if (!characterGenders[scriptName] && characterGenders['EMILY PATEL']) {
		issues.push({
			scriptName: 'EMILY PATEL',
			plotName: 'EMILY PATEL',
			issue: 'EXACT match - should work correctly'
		});
	}
}

if (charactersInScript.has('RACHEL LEE')) {
	const scriptName = 'RACHEL LEE';
	if (!characterGenders[scriptName] && characterGenders['DR. RACHEL LEE']) {
		issues.push({
			scriptName: 'RACHEL LEE',
			plotName: 'DR. RACHEL LEE',
			issue: 'Missing title - script uses "RACHEL LEE", plot defines "Dr. Rachel Lee" - May not match'
		});
	}
}

if (issues.length > 0) {
	issues.forEach((issue, idx) => {
		console.log(`\n${idx + 1}. Script: "${issue.scriptName}" vs Plot: "${issue.plotName}"`);
		console.log(`   ${issue.issue}`);
	});
} else {
	console.log('   ✅ No critical name mismatches found!');
}

console.log('\n' + '='.repeat(80));
console.log('RECOMMENDATIONS:');
console.log('='.repeat(80));
console.log('1. Fix "MARILY" -> should be "MARRY" in the script');
console.log('2. Update extractCharactersFromPlot() to handle titles (Dr., Mr., Mrs.)');
console.log('3. Ensure first name extraction works for all character formats');
console.log('4. Consider normalizing character names between plot and script generation');
console.log('='.repeat(80) + '\n');
