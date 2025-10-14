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
 * Extract dialogue from script (DIALOGUE ONLY - no narration)
 * @param {string} script - Full screenplay script
 * @returns {Array} Array of dialogue objects with character, line, and order
 */
function extractDialogue(script) {
	if (!script || typeof script !== 'string') {
		throw new Error('Script must be a non-empty string');
	}

	const lines = script.split('\n');
	const dialogue = [];
	let currentCharacter = null;
	let currentLine = '';
	let lineNumber = 0;

	for (const line of lines) {
		const trimmed = line.trim();

		// Check if line is a character name (ALL CAPS, potentially with parenthetical)
		const characterMatch = trimmed.match(/^([A-Z][A-Z\s]+?)(\s*\(.*?\))?:?\s*$/);

		if (characterMatch && trimmed.length > 0 && trimmed.length < 50) {
			// Save previous dialogue if exists
			if (currentCharacter && currentLine) {
				dialogue.push({
					character: currentCharacter,
					line: currentLine.trim(),
					order: lineNumber++
				});
			}
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
			order: lineNumber++
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
function extractScriptWithNarration(script, options = {}) {
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

	const isSceneHeading = (line) => /^(INT\.|EXT\.|FADE|CUT TO|DISSOLVE)/i.test(line);
	const isTransition = (line) => /^(FADE IN|FADE OUT|CUT TO|DISSOLVE TO)/i.test(line);
	const isCharacterName = (line) => {
		const match = line.match(/^([A-Z][A-Z\s]+?)(\s*\(.*?\))?:?\s*$/);
		return match && line.length > 0 && line.length < 50;
	};

	for (let i = 0; i < lines.length; i++) {
		const trimmed = lines[i].trim();

		if (!trimmed) continue; // Skip empty lines

		// Check for character name
		const characterMatch = trimmed.match(/^([A-Z][A-Z\s]+?)(\s*\(.*?\))?:?\s*$/);

		if (characterMatch && trimmed.length > 0 && trimmed.length < 50) {
			// Save previous narration if exists
			if (currentNarration) {
				scriptElements.push({
					character: narratorName,
					line: currentNarration.trim(),
					order: lineNumber++,
					type: 'narration'
				});
				currentNarration = '';
			}

			// Save previous dialogue if exists
			if (currentCharacter && currentDialogue) {
				scriptElements.push({
					character: currentCharacter,
					line: currentDialogue.trim(),
					order: lineNumber++,
					type: 'dialogue'
				});
			}

			currentCharacter = characterMatch[1].trim();
			currentDialogue = '';
		}
		// Dialogue line (after character name)
		else if (currentCharacter && trimmed.length > 0) {
			// Skip parentheticals
			if (!trimmed.match(/^\(.*\)$/)) {
				const cleanLine = trimmed.replace(/^["']|["']$/g, '');
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
					type: 'dialogue'
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
							type: 'narration'
						});
						currentNarration = '';
					}
					scriptElements.push({
						character: narratorName,
						line: trimmed,
						order: lineNumber++,
						type: 'scene-heading'
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
			type: 'narration'
		});
	}

	// Save final dialogue
	if (currentCharacter && currentDialogue) {
		scriptElements.push({
			character: currentCharacter,
			line: currentDialogue.trim(),
			order: lineNumber++,
			type: 'dialogue'
		});
	}

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
 * Generate audio for all dialogue in script with fallback
 * @param {string} script - Full screenplay script
 * @param {Object} options - Generation options
 * @returns {Promise<Array>} Array of audio results with character, audio buffer, and metadata
 */
async function generateScriptVoices(script, options = {}) {
	if (!script || typeof script !== 'string') {
		throw new Error('Script must be a non-empty string');
	}

	const {
		provider = 'auto', // 'auto', 'elevenlabs', 'google'
		language = 'en',
		outputDir = path.join(__dirname, '../voice-output'),
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
		if (!voiceMapping['NARRATOR']) {
			voiceMapping['NARRATOR'] = narratorVoice;
		}
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

	const results = [];


	for (let i = 0; i < dialogue.length; i++) {
		const { character, line, order } = dialogue[i];
		console.log(`\nGenerating audio ${i + 1}/${dialogue.length}: ${character}`);
		console.log(`   Text: ${line.slice(0, 60)}${line.length > 60 ? '...' : ''}`);

		let audioBuffer = null;
		let providerUsed = null;

		// Try ElevenLabs first if available and not explicitly set to google
		if (provider !== 'google' && elevenlabsApiKey) {
			const quotaAvailable = hasQuotaAvailable(line.length);
			if (quotaAvailable) {
				try {
					const voiceName = voiceMapping[character] || 'adam';
					const voice_id = getVoiceId(voiceName);
					console.log(`   Trying ElevenLabs (voice: ${voiceName})...`);
					audioBuffer = await generateWithElevenLabs(line, elevenlabsApiKey, { voice_id });
					providerUsed = 'elevenlabs';
					trackElevenLabsUsage(line.length, line);
					console.log(`   ✅ ElevenLabs success`);
					await sleep(1000);
				} catch (error) {
					console.log(`   ❌ ElevenLabs failed: ${error.message}`);
				}
			} else {
				console.log(`   ⚠️  ElevenLabs quota exhausted - skipping to fallback`);
			}
		}

		// Try Google TTS if ElevenLabs failed or not available
		if (!audioBuffer && provider !== 'elevenlabs') {
			try {
				console.log('   Trying Google TTS...');
				// Split long lines into chunks of 200 chars for Google TTS
				const maxLen = 200;
				let buffers = [];
				if (line.length > maxLen) {
					for (let start = 0; start < line.length; start += maxLen) {
						const chunk = line.substring(start, start + maxLen);
						const buf = await generateWithGoogleTTS(chunk, language);
						buffers.push(buf);
						await sleep(250); // Small delay between chunks
					}
					audioBuffer = Buffer.concat(buffers);
				} else {
					audioBuffer = await generateWithGoogleTTS(line, language);
				}
				providerUsed = 'google';
				console.log('   ✅ Google TTS success');
				await sleep(500);
			} catch (error) {
				console.log(`   ❌ Google TTS failed: ${error.message}`);
			}
		}

		// Save audio file
		if (audioBuffer) {
			const filename = `${String(order).padStart(3, '0')}_${character.replace(/\s+/g, '_')}.mp3`;
			const filepath = path.join(outputDir, filename);
			fs.writeFileSync(filepath, audioBuffer);

			results.push({
				character,
				line,
				order,
				audioFile: filename,
				audioPath: filepath,
				audioUrl: `/api/generate-voice/audio/${filename}`,
				provider: providerUsed,
				success: true,
				sizeKB: (audioBuffer.length / 1024).toFixed(2)
			});
		} else {
			console.log('   ⚠️  All TTS providers failed, skipping...');
			results.push({
				character,
				line,
				order,
				audioFile: null,
				provider: 'none',
				success: true,
				error: 'All TTS providers failed'
			});
		}
	}

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
 * Helper function to sleep
 */
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export { extractDialogue, extractScriptWithNarration, generateScriptVoices, ELEVENLABS_VOICES };
