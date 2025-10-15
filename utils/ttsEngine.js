/**
 * PlotTwist+ Text-to-Speech Engine
 * Converts screenplay scripts into audio files using multiple TTS providers with fallback
 * Primary: ElevenLabs (high quality, 10k chars/month free)
 * Secondary: Google TTS (free unlimited, basic quality)
 * Note: Fish Audio API requires premium subscription ($11+/month)
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAPIConfig } from './config.js';
import { trackElevenLabsUsage, hasQuotaAvailable, getUsageStats } from './usageTracker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let googleTTSClientCache = null; // Lazy-loaded Google Cloud TTS client

/**
 * Available ElevenLabs voices (free tier)
 * More voices available at: https://elevenlabs.io/voice-library
 */
const ELEVENLABS_VOICES = {
	// Male voices
	'adam': 'pNInz6obpgDQGcFmaJgB',      // Deep, mature male
	'antoni': 'ErXwobaYiN019PkySvjV',    // Well-rounded male
	'arnold': 'VR6AewLTigWG4xSOukaG',    // Crisp, resonant male
	'josh': 'TxGEqnHWrfWFTfGW9XjX',      // Young, energetic male (great for Marcus)
	'sam': 'yoZ06aMxZJJ28mfd3POQ',       // Raspy, dynamic male
	'nigel': 'adZJnAl6IYZw4EYI9FVd',     // Nigel Graves - Professional voice (good for main characters)
	'john': 'EiNlNiXeDU1pqqOPrYMO',      // John Doe - Deep narrator voice (BEST FOR NARRATION)

	// Female voices
	'bella': 'EXAVITQu4vr4xnSDxMaL',     // Soft, well-rounded female
	'elli': 'MF3mGyEYCl7XYWbV9V6O',      // Emotional, expressive female
	'rachel': '21m00Tcm4TlvDq8ikWAM',    // Calm, articulate female
	'domi': 'AZnzlk1XvdvUeBnXmlld',      // Strong, confident female
	'dorothy': 'ThT5KcBeYPX3keUQqHPh'    // Pleasant, conversational female
};

/**
 * Get voice ID by name or return default
 * @param {string} voiceName - Voice name (e.g., 'adam', 'bella')
 * @returns {string} Voice ID
 */
function getVoiceId(voiceName) {
	if (!voiceName) return ELEVENLABS_VOICES.adam; // Default
	const lowerName = voiceName.toLowerCase();
	return ELEVENLABS_VOICES[lowerName] || ELEVENLABS_VOICES.adam;
}

/**
 * Extract character gender information from script
 * Parses gender markers like: CHARACTER NAME (male) or CHARACTER NAME (female)
 * @param {string} script - Full screenplay script
 * @returns {Object} Map of character names to their gender {characterName: 'male'|'female'}
 */
function extractCharacterGenders(script) {
	if (!script || typeof script !== 'string') {
		return {};
	}

	const genderMap = {};
	const lines = script.split('\n');

	for (const line of lines) {
		const trimmed = line.trim();
		// Match: CHARACTER NAME (male) or CHARACTER NAME (female)
		const match = trimmed.match(/^([A-Z][A-Z\s]+?)\s*\((male|female)\)/i);
		if (match) {
			const characterName = match[1].trim().toUpperCase();
			const gender = match[2].toLowerCase();
			if (!genderMap[characterName]) {
				genderMap[characterName] = gender;
				console.log(`📋 Extracted gender: ${characterName} = ${gender}`);
			}
		}
	}

	return genderMap;
}

/**
 * Extract character genders from plot CHARACTER section
 * Looks for **CHARACTERS:** section and extracts all character-gender pairs
 * @param {string} plot - The generated plot with CHARACTER section
 * @returns {Object} Object with genderMap and characterOrder array
 */
function extractCharactersFromPlot(plot) {
	if (!plot || typeof plot !== 'string') {
		return { genderMap: {}, characterOrder: [] };
	}

	const genderMap = {};
	const characterOrder = []; // Track order characters appear in plot

	// Find the CHARACTERS section
	const characterSectionMatch = plot.match(/\*\*CHARACTERS:\*\*([\s\S]*?)(?=\*\*ACT|$)/i);

	if (!characterSectionMatch) {
		console.log('⚠️  No CHARACTER section found in plot');
		return { genderMap, characterOrder };
	}

	const characterSection = characterSectionMatch[1];
	const lines = characterSection.split('\n');

	console.log('🔍 Extracting characters from plot CHARACTER section...');

	for (const line of lines) {
		const trimmed = line.trim();
		// Match: - Character Name (male) or - Character Name (female)
		const match = trimmed.match(/^-\s*(.+?)\s*\((male|female)\)/i);
		if (match) {
			const fullName = match[1].trim().toUpperCase();
			const gender = match[2].toLowerCase();

			// Store with FULL NAME (e.g., "JOHN SMITH" or "DR. RACHEL LEE")
			genderMap[fullName] = gender;

			// Track character order (first character in list = main character)
			if (!characterOrder.find(c => c.name === fullName)) {
				characterOrder.push({ name: fullName, gender });
			}

			// Extract name variations for flexible matching
			const commonTitles = ['DR.', 'DR', 'MR.', 'MR', 'MRS.', 'MRS', 'MS.', 'MS', 'MISS', 'NURSE', 'OFFICER', 'DETECTIVE', 'PROFESSOR', 'PROF.', 'PROF'];
			const nameParts = fullName.split(/\s+/);

			let nameWithoutTitle = fullName;
			let firstName = nameParts[0];

			// If first word is a title, extract name without title
			if (commonTitles.includes(nameParts[0]) && nameParts.length > 1) {
				// "DR. RACHEL LEE" -> "RACHEL LEE"
				nameWithoutTitle = nameParts.slice(1).join(' ');
				firstName = nameParts[1];

				// Store without title
				if (!genderMap[nameWithoutTitle]) {
					genderMap[nameWithoutTitle] = gender;
				}
			}

			// Store FIRST NAME ONLY (e.g., "JOHN", "RACHEL")
			if (firstName && firstName !== fullName && !commonTitles.includes(firstName)) {
				if (!genderMap[firstName]) {
					genderMap[firstName] = gender;
				}
			}

			// Store LAST NAME if multiple parts (e.g., "LIAM CHEN" from "DR. LIAM CHEN")
			if (nameParts.length >= 2 && !commonTitles.includes(nameParts[0])) {
				const lastName = nameParts[nameParts.length - 1];
				// Don't store common single-letter last names
				if (lastName.length > 1) {
					// This helps with partial matches
				}
			}

			// Store full name with spaces (e.g., "LIAM CHEN" from "DR. LIAM CHEN")
			if (nameParts.length > 1 && commonTitles.includes(nameParts[0])) {
				const nameWithoutTitleSpaces = nameParts.slice(1).join(' ');
				if (!genderMap[nameWithoutTitleSpaces]) {
					genderMap[nameWithoutTitleSpaces] = gender;
				}
			}

			console.log(`📋 Plot character: ${fullName} = ${gender} (variations stored)`);
		}
	}

	console.log(`✅ Found ${Object.keys(genderMap).length} character mappings in plot`);
	console.log(`📊 Character order (for main character detection):`, characterOrder.map(c => c.name).join(', '));

	return { genderMap, characterOrder };
}

/**
 * Extract dialogue from script (DIALOGUE ONLY - no narration)
 * @param {string} script - Full screenplay script
 * @returns {Array} Array of dialogue objects with character, line, and order
 */
export function extractDialogue(script) {
	if (!script || typeof script !== 'string') {
		throw new Error('Script must be a non-empty string');
	}

	const lines = script.split('\n');
	const dialogue = [];
	let currentCharacter = null;
	let currentLine = '';
	let lineNumber = 0;
	let currentAct = 'ONE'; // Track current act

	for (const line of lines) {
		const trimmed = line.trim();

		// Check for ACT markers
		const actMatch = trimmed.match(/^\*\*ACT\s+(ONE|TWO|THREE)\*\*/i);
		if (actMatch) {
			// Before switching acts, flush any pending dialogue under the current act
			if (currentCharacter && currentLine) {
				dialogue.push({
					character: currentCharacter,
					line: currentLine.trim(),
					order: lineNumber++,
					act: currentAct
				});
				currentCharacter = null;
				currentLine = '';
			}
			currentAct = actMatch[1].toUpperCase();
			continue;
		}

		// Check if line is a character name (ALL CAPS, potentially with gender marker in parentheses)
		// Format: CHARACTER NAME (male) or CHARACTER NAME (female)
		const characterMatch = trimmed.match(/^([A-Z][A-Z\s]+?)(\s*\((male|female|.*?)\))?:?\s*$/);

		if (characterMatch && trimmed.length > 0 && trimmed.length < 50) {
			// Save previous dialogue if exists
			if (currentCharacter && currentLine) {
				dialogue.push({
					character: currentCharacter,
					line: currentLine.trim(),
					order: lineNumber++,
					act: currentAct
				});
			}
			// Extract character name (without gender marker)
			currentCharacter = characterMatch[1].trim();
			currentLine = '';
		}
		// Check if line contains dialogue (after character name or in quotes)
		else if (currentCharacter && trimmed.length > 0) {
			// Skip parentheticals like (angrily), (whispers)
			if (!trimmed.match(/^\(.*\)$/)) {
				// Remove quotes if present
				const cleanLine = trimmed.replace(/^["']|["']$/g, '');
				if (cleanLine && !cleanLine.match(/^(INT\.|EXT\.|FADE|CUT TO)/i)) {
					currentLine += (currentLine ? ' ' : '') + cleanLine;
				}
			}
		}
	}

	// Add final dialogue
	if (currentCharacter && currentLine) {
		dialogue.push({
			character: currentCharacter,
			line: currentLine.trim(),
			order: lineNumber++,
			act: currentAct
		});
	}

	return dialogue;
}

/**
 * Extract script with BOTH narration and dialogue (for full audiobook experience)
 * Optimized for new TTS-friendly script format with explicit NARRATOR blocks
 * @param {string} script - Full screenplay script
 * @param {Object} options - Extraction options
 * @returns {Array} Array of script elements (narration + dialogue) in order
 */
export function extractScriptWithNarration(script, options = {}) {
	if (!script || typeof script !== 'string') {
		throw new Error('Script must be a non-empty string');
	}

	const {
		narratorName = 'NARRATOR',
		skipSceneHeadings = false,
		skipTransitions = false  // Changed default to keep FADE IN/OUT
	} = options;

	const lines = script.split('\n');
	const scriptElements = [];
	let currentCharacter = null;
	let currentDialogue = '';
	let currentNarration = '';
	let lineNumber = 0;
	let currentAct = 'ONE'; // Track current act

	const isSceneHeading = (line) => /^(INT\.|EXT\.|FADE|CUT TO|DISSOLVE)/i.test(line);
	const isTransition = (line) => /^(FADE IN|FADE OUT|CUT TO|DISSOLVE TO)/i.test(line);
	const isActMarker = (line) => /^\*\*ACT\s+(ONE|TWO|THREE)\*\*/i.test(line);
	const isCharacterName = (line) => {
		const match = line.match(/^([A-Z][A-Z\s]+?)(\s*\(.*?\))?:?\s*$/);
		return match && line.length > 0 && line.length < 50;
	};

	for (let i = 0; i < lines.length; i++) {
		const trimmed = lines[i].trim();

		if (!trimmed) continue; // Skip empty lines

		// Check for ACT markers and update current act
		const actMatch = trimmed.match(/^\*\*ACT\s+(ONE|TWO|THREE)\*\*/i);
		if (actMatch) {
			// Before switching acts, save any pending content from the previous act
			if (currentNarration) {
				scriptElements.push({
					character: narratorName,
					line: currentNarration.trim(),
					order: lineNumber++,
					type: 'narration',
					act: currentAct
				});
				currentNarration = '';
			}
			if (currentCharacter && currentDialogue) {
				scriptElements.push({
					character: currentCharacter,
					line: currentDialogue.trim(),
					order: lineNumber++,
					type: 'dialogue',
					act: currentAct
				});
				currentCharacter = null;
				currentDialogue = '';
			}

			currentAct = actMatch[1].toUpperCase();
			continue; // Skip ACT markers from being added to content
		}

		// Check for character name (allow periods for titles like DR., MR., MRS.)
		const characterMatch = trimmed.match(/^([A-Z][A-Z\s.]+?)(\s*\(.*?\))?:?\s*$/);

		if (characterMatch && trimmed.length > 0 && trimmed.length < 50) {
			const matchedName = characterMatch[1].trim();

			// Check if this is the NARRATOR (special handling)
			if (matchedName.toUpperCase() === narratorName.toUpperCase()) {
				// Save previous narration if exists (flush before starting new narrator block)
				if (currentNarration) {
					scriptElements.push({
						character: narratorName,
						line: currentNarration.trim(),
						order: lineNumber++,
						type: 'narration',
						act: currentAct
					});
					currentNarration = '';
				}
				// Save previous dialogue if exists (switching from dialogue to narration)
				if (currentCharacter && currentDialogue) {
					scriptElements.push({
						character: currentCharacter,
						line: currentDialogue.trim(),
						order: lineNumber++,
						type: 'dialogue',
						act: currentAct
					});
				}
				// IMPORTANT: Clear currentCharacter so narration goes to currentNarration
				currentCharacter = null;
				currentDialogue = '';
				// Don't set currentCharacter for NARRATOR
				// Narrator content will be accumulated in currentNarration
				continue; // Skip to next line
			}

			// Regular character (not NARRATOR)
			// Save previous narration if exists
			if (currentNarration) {
				scriptElements.push({
					character: narratorName,
					line: currentNarration.trim(),
					order: lineNumber++,
					type: 'narration',
					act: currentAct
				});
				currentNarration = '';
			}

			// Save previous dialogue if exists
			if (currentCharacter && currentDialogue) {
				scriptElements.push({
					character: currentCharacter,
					line: currentDialogue.trim(),
					order: lineNumber++,
					type: 'dialogue',
					act: currentAct
				});
			}

			currentCharacter = matchedName;
			currentDialogue = '';
		}
		// Dialogue line (after character name)
		else if (currentCharacter && trimmed.length > 0) {
			// Skip lines that are ONLY parentheticals
			if (!trimmed.match(/^\(.*\)$/)) {
				// Strip inline parentheticals like "(concerned) dialogue" or "dialogue (whispers)"
				let cleanLine = trimmed.replace(/\([^)]*\)/g, '').trim();
				// Remove surrounding quotes
				cleanLine = cleanLine.replace(/^["']|["']$/g, '').trim();
				if (cleanLine && !isSceneHeading(cleanLine)) {
					currentDialogue += (currentDialogue ? ' ' : '') + cleanLine;
				}
			}
		}
		// Action line (narration)
		else if (trimmed.length > 0 && !isCharacterName(trimmed)) {
			// Save previous dialogue if switching to narration
			if (currentCharacter && currentDialogue) {
				scriptElements.push({
					character: currentCharacter,
					line: currentDialogue.trim(),
					order: lineNumber++,
					type: 'dialogue',
					act: currentAct
				});
				currentCharacter = null;
				currentDialogue = '';
			}

			// Handle scene headings
			if (isSceneHeading(trimmed)) {
				if (!skipSceneHeadings && !isTransition(trimmed) || !skipTransitions) {
					if (currentNarration) {
						scriptElements.push({
							character: narratorName,
							line: currentNarration.trim(),
							order: lineNumber++,
							type: 'narration',
							act: currentAct
						});
						currentNarration = '';
					}
					scriptElements.push({
						character: narratorName,
						line: trimmed,
						order: lineNumber++,
						type: 'scene-heading',
						act: currentAct
					});
				}
			}
			// Regular action/narration
			else {
				currentNarration += (currentNarration ? ' ' : '') + trimmed;
			}
		}
	}

	// Save final narration
	if (currentNarration) {
		scriptElements.push({
			character: narratorName,
			line: currentNarration.trim(),
			order: lineNumber++,
			type: 'narration',
			act: currentAct
		});
	}

	// Save final dialogue
	if (currentCharacter && currentDialogue) {
		scriptElements.push({
			character: currentCharacter,
			line: currentDialogue.trim(),
			order: lineNumber++,
			type: 'dialogue',
			act: currentAct
		});
	}

	// Note: Do not alter act assignments post-process. Acts are set when content is flushed.

	return scriptElements;
}

/**
 * Generate TTS audio using ElevenLabs API
 * @param {string} text - Text to convert to speech
 * @param {string} apiKey - ElevenLabs API key
 * @param {Object} options - Voice options
 * @returns {Promise<Buffer>} Audio buffer (MP3)
 */
async function generateWithElevenLabs(text, apiKey, options = {}) {
	const {
		voice_id = 'pNInz6obpgDQGcFmaJgB', // Default: Adam (male voice)
		model_id = 'eleven_monolingual_v1',
		voice_settings = {
			stability: 0.5,
			similarity_boost: 0.75
		}
	} = options;

	const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`;

	const response = await fetch(url, {
		method: 'POST',
		headers:
		{
			'Accept': 'audio/mpeg',
			'Content-Type': 'application/json',
			'xi-api-key': apiKey
		},
		body: JSON.stringify({
			text,
			model_id,
			voice_settings
		}),
		timeout: 30000
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`ElevenLabs API error ${response.status}: ${errorText.slice(0, 200)}`);
	}

	const arrayBuffer = await response.arrayBuffer();
	return Buffer.from(arrayBuffer);
}

/**
 * Generate TTS audio using Google TTS (free, unlimited)
 * @param {string} text - Text to convert to speech
 * @param {string} language - Language code (e.g., 'en', 'es')
 * @returns {Promise<Buffer>} Audio buffer (MP3)
 */
async function generateWithGoogleTTS(text, language = 'en') {
	// Google Translate TTS API endpoint (unofficial but free)
	const encodedText = encodeURIComponent(text);
	const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${language}&client=tw-ob&q=${encodedText}`;

	const response = await fetch(url, {
		headers: {
			'User-Agent': 'Mozilla/5.0'
		}
	});

	if (!response.ok) {
		throw new Error(`Google TTS error ${response.status}`);
	}

	const arrayBuffer = await response.arrayBuffer();
	return Buffer.from(arrayBuffer);
}

/**
 * Lazily create a Google Cloud Text-to-Speech client
 */
async function getGoogleCloudTTSClient() {
	if (googleTTSClientCache) return googleTTSClientCache;
	// Dynamic import to avoid loading dependency when not used
	const mod = await import('@google-cloud/text-to-speech');
	googleTTSClientCache = new mod.TextToSpeechClient();
	return googleTTSClientCache;
}

/**
 * Generate TTS audio using Google Cloud Text-to-Speech
 * @param {string} text
 * @param {Object} opts
 * @param {string} opts.languageCode e.g., 'en-US'
 * @param {string} opts.voiceName e.g., 'en-US-Neural2-D'
 * @param {number} opts.speakingRate default 1.0
 * @param {number} opts.pitch default 0.0
 * @returns {Promise<Buffer>} MP3 audio buffer
 */
async function generateWithGoogleCloudTTS(text, {
	languageCode = 'en-US',
	voiceName = 'en-US-Neural2-D',
	speakingRate = 1.0,
	pitch = 0.0
} = {}) {
	const client = await getGoogleCloudTTSClient();
	const [response] = await client.synthesizeSpeech({
		input: { text },
		voice: { languageCode, name: voiceName },
		audioConfig: {
			audioEncoding: 'MP3',
			speakingRate,
			pitch
		}
	});
	return Buffer.from(response.audioContent, 'base64');
}

/**
 * Infer languageCode from a Google Cloud TTS voice name
 * Example: 'en-US-Neural2-D' -> 'en-US'
 */
function languageCodeFromVoiceName(voiceName, fallback = 'en-US') {
	if (typeof voiceName !== 'string') return fallback;
	const parts = voiceName.split('-');
	if (parts.length >= 2) return `${parts[0]}-${parts[1]}`;
	return fallback;
}

/**
 * Generate audio for all dialogue in script with fallback
 * @param {string} script - Full screenplay script
 * @param {Object} options - Generation options
 * @returns {Promise<Array>} Array of audio results with character, audio buffer, and metadata
 */
export async function generateScriptVoices(options = {}) {
	// Load complete script from data/script folder
	const scriptDir = path.join(__dirname, '..', 'data', 'script');
	if (!fs.existsSync(scriptDir)) {
		throw new Error('Script folder does not exist');
	}
	const scriptFile = path.join(scriptDir, 'script-complete.txt');
	if (!fs.existsSync(scriptFile)) {
		throw new Error('No script file found in data/script folder');
	}
	const script = fs.readFileSync(scriptFile, 'utf-8');

	// Load plot file to extract character genders
	const plotDir = path.join(__dirname, '..', 'data', 'plot');
	const plotFile = path.join(plotDir, 'plot-complete.txt');
	let characterGenders = {};
	let characterOrder = [];
	if (fs.existsSync(plotFile)) {
		const plot = fs.readFileSync(plotFile, 'utf-8');
		const extracted = extractCharactersFromPlot(plot);
		characterGenders = extracted.genderMap;
		characterOrder = extracted.characterOrder;
	} else {
		console.log('⚠️  Plot file not found, will use name-based gender guessing');
	}

	const {
		provider = 'auto', // 'auto', 'elevenlabs', 'google'
		language = 'en',
		outputDir = path.join(__dirname, '..', 'data', 'voice'),
		voiceMapping = {}, // Map character names to voice names
		includeNarration = false, // Include action lines as narration
		narratorVoice = 'john' // Voice for narrator (default: John Doe - Deep narrator voice)
	} = options;

	// Get API config
	const config = getAPIConfig();
	const { elevenlabsApiKey } = config;

	// Extract dialogue from script
	let dialogue;
	if (includeNarration) {
		console.log('Extracting script with narration...');
		dialogue = extractScriptWithNarration(script, {
			narratorName: 'NARRATOR',
			skipSceneHeadings: false,
			skipTransitions: true
		});
		// Add narrator to voice mapping if not already set
		// defer narrator assignment to auto-mapping below to respect provider
		console.log(`Found ${dialogue.length} script elements (narration + dialogue)`);
	} else {
		console.log('Extracting dialogue from script...');
		dialogue = extractDialogue(script);
		console.log(`Found ${dialogue.length} dialogue lines`);
	}

	if (dialogue.length === 0) {
		console.warn('No dialogue found in script');
		return [];
	}

	// Create output directory if needed
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	// Character genders are already extracted from plot file above
	// (characterGenders variable is already defined)
	console.log('📊 Character gender map from plot:', characterGenders);

	// Build automatic voice mapping for characters not explicitly mapped
	const providedMapping = voiceMapping || {};
	// Normalize provided mapping to uppercase keys
	const providedMappingUpper = Object.fromEntries(
		Object.entries(providedMapping).map(([k, v]) => [String(k).toUpperCase(), v])
	);
	const uniqueChars = Array.from(new Set(dialogue.map(d => d.character)));

	// Gender detection function - uses extracted genders first, then falls back to name guessing
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
			console.log(`✅ Gender from plot CHARACTER section: ${nameUpper} = ${characterGenders[nameUpper]}`);
			return characterGenders[nameUpper];
		}

		// PRIORITY 2: Fallback to name guessing (for backwards compatibility)
		const first = nameUpper.split(/\s|\(/)[0];
		if (FEMALE_NAMES.has(first)) {
			console.log(`ℹ️  Gender from name list: ${nameUpper} = female (${first} in FEMALE_NAMES)`);
			return 'female';
		}
		if (MALE_NAMES.has(first)) {
			console.log(`ℹ️  Gender from name list: ${nameUpper} = male (${first} in MALE_NAMES)`);
			return 'male';
		}
		if (first.endsWith('A')) {
			console.log(`ℹ️  Gender from name pattern: ${nameUpper} = female (ends with 'A')`);
			return 'female';
		}

		console.log(`⚠️  Unknown gender for: ${nameUpper} (no plot CHARACTER match, not in name list, no pattern match)`);
		return 'unknown';
	};

	// Voice pools per provider - MAIN CHARACTERS + DIVERSE SUPPORTING CAST

	// MAIN CHARACTER VOICES (consistent, high-quality)
	const gcpMainMale = 'en-GB-Wavenet-D';      // British, deep & fierce (not as deep as narrator)
	const gcpMainFemale = 'en-US-Neural2-H';    // American female, clear & strong

	// SUPPORTING CHARACTER VOICES (diverse international accents)
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

	// Voice settings for different character types
	const gcpNarratorSettings = { speakingRate: 0.82, pitch: -10.0 };  // Very deep narrator
	const gcpMainMaleSettings = { speakingRate: 0.92, pitch: -6.0 };   // British main (deep & fierce)
	const gcpMainFemaleSettings = { speakingRate: 0.95, pitch: -2.0 }; // American main (strong, clear)
	const gcpMaleSettings = { speakingRate: 0.95, pitch: -5.0 };       // Supporting males
	const gcpFemaleSettings = { speakingRate: 0.98, pitch: -3.0 };     // Supporting females

	const elFemale = ['rachel', 'bella', 'elli', 'domi', 'dorothy'];
	const elMale = ['john', 'adam', 'josh', 'antoni', 'arnold'];
	const elNarrator = 'john'; // deep male

	let fIdx = 0, mIdx = 0, uIdx = 0;
	let mainMaleAssigned = false, mainFemaleAssigned = false;
	const autoMapping = {};

	// Assign narrator first if present or requested
	const hasNarrator = includeNarration || uniqueChars.some(c => String(c).toUpperCase() === 'NARRATOR');
	if (hasNarrator && !providedMappingUpper['NARRATOR']) {
		autoMapping['NARRATOR'] = (provider === 'google-cloud-tts') ? gcpNarrator : elNarrator;
	}

	// Determine main characters from plot order (first male and first female in characterOrder)
	let mainMaleCharacter = null;
	let mainFemaleCharacter = null;

	if (characterOrder && characterOrder.length > 0) {
		// Find first male and first female from plot order
		for (const charInfo of characterOrder) {
			if (!mainMaleCharacter && charInfo.gender === 'male') {
				mainMaleCharacter = charInfo.name;
				console.log(`👑 Main male character from plot order: ${mainMaleCharacter}`);
			}
			if (!mainFemaleCharacter && charInfo.gender === 'female') {
				mainFemaleCharacter = charInfo.name;
				console.log(`👑 Main female character from plot order: ${mainFemaleCharacter}`);
			}
			if (mainMaleCharacter && mainFemaleCharacter) break;
		}
	}

	// Process characters in the order they appear in the script (not alphabetically)
	for (const ch of uniqueChars) {
		const up = String(ch).toUpperCase();
		if (up === 'NARRATOR') continue;
		if (providedMappingUpper[up]) continue;
		const g = guessGender(ch);

		if (provider === 'google-cloud-tts') {
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

			// Assign MAIN CHARACTER voices based on plot order
			if (g === 'female') {
				if (isMainFemale && !mainFemaleAssigned) {
					autoMapping[ch] = gcpMainFemale;  // American main female
					mainFemaleAssigned = true;
					console.log(`👑 Main Female Character: ${ch} -> ${gcpMainFemale} (American) [from plot order]`);
				} else {
					autoMapping[ch] = gcpSupportingFemale[fIdx++ % gcpSupportingFemale.length];
				}
			} else if (g === 'male') {
				if (isMainMale && !mainMaleAssigned) {
					autoMapping[ch] = gcpMainMale;  // British main male
					mainMaleAssigned = true;
					console.log(`👑 Main Male Character: ${ch} -> ${gcpMainMale} (British) [from plot order]`);
				} else {
					autoMapping[ch] = gcpSupportingMale[mIdx++ % gcpSupportingMale.length];
				}
			} else {
				// Unknown gender - use supporting cast
				const both = [...gcpSupportingFemale, ...gcpSupportingMale];
				autoMapping[ch] = both[uIdx++ % both.length];
			}
		} else if (provider === 'elevenlabs') {
			if (g === 'female') autoMapping[ch] = elFemale[fIdx++ % elFemale.length];
			else if (g === 'male') autoMapping[ch] = elMale[mIdx++ % elMale.length];
			else {
				const both = [...elFemale, ...elMale];
				autoMapping[ch] = both[uIdx++ % both.length];
			}
		}
	}

	// Final mapping: prefer explicit provided (uppercase keys), with auto as fallback
	const mappingUpper = { ...Object.fromEntries(Object.entries(autoMapping).map(([k, v]) => [String(k).toUpperCase(), v])), ...providedMappingUpper };

	if (Object.keys(autoMapping).length) {
		console.log('Auto voice mapping applied:', autoMapping);
	}

	// Create act directories first
	const actDirs = {
		'ONE': path.join(outputDir, 'voice-act-one'),
		'TWO': path.join(outputDir, 'voice-act-two'),
		'THREE': path.join(outputDir, 'voice-act-three')
	};
	Object.values(actDirs).forEach(dir => {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
	});

	// Generate all voices in PARALLEL for speed
	console.log(`\n🎙️  Generating ${dialogue.length} voice clips in parallel...`);
	console.log(`   Provider: ${provider}`);
	console.log(`   This should be much faster than sequential processing!\n`);

	const voicePromises = dialogue.map((dialogueItem, index) =>
		generateSingleVoice(
			dialogueItem,
			index,
			{
				provider,
				language,
				outputDir,
				mappingUpper,
				gcpNarrator,
				gcpMainMale,
				gcpMainFemale,
				gcpNarratorSettings,
				gcpMainMaleSettings,
				gcpMainFemaleSettings,
				gcpMaleSettings,
				gcpFemaleSettings,
				elevenlabsApiKey,
				config
			}
		)
	);

	const results = await Promise.all(voicePromises);
	console.log(`\n✅ All ${results.length} voice clips generated!`);

	// Display usage summary after generation
	console.log('\n' + '='.repeat(70));
	const stats = getUsageStats();
	console.log(`\n📊 ElevenLabs Usage: ${stats.used} / ${stats.limit} chars (${stats.percentUsed}%)`);
	console.log(`   Remaining: ${stats.remaining} chars (~${stats.estimatedMinutesLeft} min of audio)`);
	if (stats.percentUsed >= 75) {
		console.log(`\n💡 TIP: Approaching quota limit. Google TTS will automatically take over.`);
	}
	console.log('='.repeat(70) + '\n');

	return results;
}

/**
 * Generate a single voice clip (extracted for parallel processing)
 */
async function generateSingleVoice(dialogueItem, index, options) {
	const { character, line, order, act } = dialogueItem;
	const {
		provider,
		language,
		outputDir,
		mappingUpper,
		gcpNarrator,
		gcpMainMale,
		gcpMainFemale,
		gcpNarratorSettings,
		gcpMainMaleSettings,
		gcpMainFemaleSettings,
		gcpMaleSettings,
		gcpFemaleSettings,
		elevenlabsApiKey
	} = options;

	// Map act to folder name
	let actFolderName;
	if (act === 'ONE') actFolderName = 'voice-act-one';
	else if (act === 'TWO') actFolderName = 'voice-act-two';
	else if (act === 'THREE') actFolderName = 'voice-act-three';
	else actFolderName = `voice-act-${act.toLowerCase()}`;

	const actDir = path.join(outputDir, actFolderName);

	let audioBuffer = null;
	let providerUsed = null;
	let chosenVoiceName = null;

	console.log(`📢 [${index + 1}] Processing: ${character} (Act ${act}, Order ${order})`);

	// Google Cloud TTS path (explicit provider)
	if (!audioBuffer && provider === 'google-cloud-tts') {
		try {
			const key = String(character).toUpperCase();
			const gcVoiceName = mappingUpper[key]
				|| (key === 'NARRATOR' ? gcpNarrator : 'en-US-Neural2-D');
			const languageCode = languageCodeFromVoiceName(gcVoiceName, 'en-US');

			// Determine voice settings based on character type
			let voiceSettings;
			let accentInfo = '';
			let characterType = '';

			if (key === 'NARRATOR') {
				voiceSettings = gcpNarratorSettings;
				console.log(`   🔊 [${index + 1}] NARRATOR - Voice: ${gcVoiceName}, Pitch: ${voiceSettings.pitch}, Rate: ${voiceSettings.speakingRate}`);
			} else {
				// Detect accent from voice name
				if (gcVoiceName.includes('en-IN')) accentInfo = ' (Indian)';
				else if (gcVoiceName.includes('en-GB')) accentInfo = ' (British)';
				else if (gcVoiceName.includes('en-AU')) accentInfo = ' (Australian)';
				else if (gcVoiceName.includes('en-US')) accentInfo = ' (American)';

				// Check if this is a MAIN CHARACTER voice
				const isMainMale = gcVoiceName === gcpMainMale;
				const isMainFemale = gcVoiceName === gcpMainFemale;

				if (isMainMale) {
					voiceSettings = gcpMainMaleSettings;
					characterType = '👑 MAIN Male';
				} else if (isMainFemale) {
					voiceSettings = gcpMainFemaleSettings;
					characterType = '👑 MAIN Female';
				} else {
					// Supporting character - detect gender
					const isFemaleVoice =
						gcVoiceName.match(/-(A|C|F|H)($|[^a-z])/i) ||
						gcVoiceName.toLowerCase().includes('female');

					voiceSettings = isFemaleVoice ? gcpFemaleSettings : gcpMaleSettings;
					characterType = isFemaleVoice ? 'Female' : 'Male';
				}

				console.log(`   🎙️  [${index + 1}] ${characterType}${accentInfo} - Voice: ${gcVoiceName}, Pitch: ${voiceSettings.pitch}, Rate: ${voiceSettings.speakingRate}`);
			}

			chosenVoiceName = gcVoiceName;
			// Chunk very long inputs for safety (API handles up to ~5000 chars)
			const maxLen = 4500;
			if (line.length > maxLen) {
				const chunks = [];
				for (let start = 0; start < line.length; start += maxLen) {
					const chunk = line.substring(start, start + maxLen);
					const gcOpts = {
						languageCode,
						voiceName: gcVoiceName,
						speakingRate: voiceSettings.speakingRate,
						pitch: voiceSettings.pitch
					};
					const buf = await generateWithGoogleCloudTTS(chunk, gcOpts);
					chunks.push(buf);
					await sleep(250);
				}
				audioBuffer = Buffer.concat(chunks);
			} else {
				const gcOpts = {
					languageCode,
					voiceName: gcVoiceName,
					speakingRate: voiceSettings.speakingRate,
					pitch: voiceSettings.pitch
				};
				audioBuffer = await generateWithGoogleCloudTTS(line, gcOpts);
			}
			providerUsed = 'google-cloud-tts';
			console.log(`   ✅ [${index + 1}] Google Cloud TTS success`);
		} catch (error) {
			console.log(`   ❌ [${index + 1}] Google Cloud TTS failed: ${error.message}`);
		}
	}	// Try ElevenLabs if available
	if (!audioBuffer && provider !== 'google' && elevenlabsApiKey) {
		const quotaAvailable = hasQuotaAvailable(line.length);
		if (quotaAvailable) {
			try {
				const key = String(character).toUpperCase();
				const voiceName = mappingUpper[key] || (key === 'NARRATOR' ? 'john' : 'adam');
				const voice_id = getVoiceId(voiceName);
				console.log(`   🎤 [${index + 1}] Trying ElevenLabs (${voiceName})...`);
				chosenVoiceName = voiceName;
				audioBuffer = await generateWithElevenLabs(line, elevenlabsApiKey, { voice_id });
				providerUsed = 'elevenlabs';
				trackElevenLabsUsage(line.length, line);
				console.log(`   ✅ [${index + 1}] ElevenLabs success`);
			} catch (error) {
				console.log(`   ❌ [${index + 1}] ElevenLabs failed: ${error.message}`);
			}
		} else {
			console.log(`   ⚠️  [${index + 1}] ElevenLabs quota exhausted`);
		}
	}

	// Try Google Translate TTS if nothing else worked
	if (!audioBuffer && provider !== 'elevenlabs') {
		try {
			console.log(`   🌐 [${index + 1}] Trying Google Translate TTS...`);
			const maxLen = 200;
			let buffers = [];
			if (line.length > maxLen) {
				for (let start = 0; start < line.length; start += maxLen) {
					const chunk = line.substring(start, start + maxLen);
					const buf = await generateWithGoogleTTS(chunk, language);
					buffers.push(buf);
					await sleep(250);
				}
				audioBuffer = Buffer.concat(buffers);
			} else {
				audioBuffer = await generateWithGoogleTTS(line, language);
			}
			providerUsed = 'google';
			chosenVoiceName = `translate:${language}`;
			console.log(`   ✅ [${index + 1}] Google Translate TTS success`);
		} catch (error) {
			console.log(`   ❌ [${index + 1}] Google Translate TTS failed: ${error.message}`);
		}
	}

	// Save audio file
	if (audioBuffer) {
		const filename = `${String(order).padStart(3, '0')}_${character.replace(/\s+/g, '_')}.mp3`;
		const filepath = path.join(actDir, filename);
		fs.writeFileSync(filepath, audioBuffer);
		console.log(`   💾 [${index + 1}] Saved: ${filename}`);

		return {
			character,
			line,
			order,
			act,
			audioFile: filename,
			audioPath: filepath,
			audioUrl: `/api/generate-voice/audio/${actFolderName}/${filename}`,
			provider: providerUsed,
			voice: chosenVoiceName,
			success: true,
			sizeKB: (audioBuffer.length / 1024).toFixed(2)
		};
	} else {
		console.log(`   ⚠️  [${index + 1}] All TTS providers failed`);
		return {
			character,
			line,
			order,
			act,
			audioFile: null,
			provider: 'none',
			success: false,
			error: 'All TTS providers failed'
		};
	}
}

/**
 * Helper function to sleep
 */
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export { ELEVENLABS_VOICES };
