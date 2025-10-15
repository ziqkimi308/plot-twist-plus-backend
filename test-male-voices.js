/**
 * Test different Google Cloud TTS male voices to find the deepest one
 */

import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new TextToSpeechClient();

const testText = "The city was shrouded in darkness as Detective Thompson stepped out of his car.";

// List of male voices to test - focusing on DEEP male voices
const voicesToTest = [
	// Studio voices (premium quality)
	{ name: 'en-US-Studio-M', pitch: -6.0, rate: 0.88, label: 'Studio-M (deep male)' },
	{ name: 'en-US-Studio-Q', pitch: -6.0, rate: 0.88, label: 'Studio-Q (deep male)' },

	// Neural2 voices (high quality) - DEEP settings
	{ name: 'en-US-Neural2-D', pitch: -8.0, rate: 0.85, label: 'Neural2-D (very deep)' },
	{ name: 'en-US-Neural2-A', pitch: -7.0, rate: 0.87, label: 'Neural2-A (deep)' },
	{ name: 'en-US-Neural2-I', pitch: -6.0, rate: 0.88, label: 'Neural2-I (deep)' },
	{ name: 'en-US-Neural2-J', pitch: -7.0, rate: 0.87, label: 'Neural2-J (deep)' },

	// Wavenet voices (standard quality) - DEEP settings
	{ name: 'en-US-Wavenet-D', pitch: -8.0, rate: 0.85, label: 'Wavenet-D (very deep)' },
	{ name: 'en-US-Wavenet-A', pitch: -7.0, rate: 0.87, label: 'Wavenet-A (deep)' },
	{ name: 'en-US-Wavenet-B', pitch: -7.0, rate: 0.87, label: 'Wavenet-B (deep)' },

	// Journey voices (latest, natural)
	{ name: 'en-US-Journey-D', pitch: -6.0, rate: 0.88, label: 'Journey-D (deep male)' },
];

async function testVoice(voiceConfig) {
	try {
		console.log(`\nTesting: ${voiceConfig.label}`);
		console.log(`  Voice: ${voiceConfig.name}`);
		console.log(`  Pitch: ${voiceConfig.pitch}, Rate: ${voiceConfig.rate}`);

		const request = {
			input: { text: testText },
			voice: {
				languageCode: 'en-US',
				name: voiceConfig.name
			},
			audioConfig: {
				audioEncoding: 'MP3',
				pitch: voiceConfig.pitch,
				speakingRate: voiceConfig.rate
			}
		};

		const [response] = await client.synthesizeSpeech(request);

		// Save to test folder
		const outputDir = path.join(__dirname, 'data', 'voice-tests');
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		const filename = `test_${voiceConfig.name.replace(/[^a-zA-Z0-9]/g, '_')}_pitch${voiceConfig.pitch}_rate${voiceConfig.rate}.mp3`;
		const filepath = path.join(outputDir, filename);

		fs.writeFileSync(filepath, response.audioContent, 'binary');
		console.log(`  ✅ Success! Saved to: ${filename}`);

		return { success: true, voice: voiceConfig };
	} catch (error) {
		console.log(`  ❌ Failed: ${error.message}`);
		return { success: false, voice: voiceConfig, error: error.message };
	}
}

async function testAllVoices() {
	console.log('='.repeat(70));
	console.log('Testing Google Cloud TTS Male Voices for Deep Narrator');
	console.log('='.repeat(70));
	console.log(`Test text: "${testText}"`);

	const results = [];

	for (const voiceConfig of voicesToTest) {
		const result = await testVoice(voiceConfig);
		results.push(result);
		await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between calls
	}

	console.log('\n' + '='.repeat(70));
	console.log('RESULTS SUMMARY');
	console.log('='.repeat(70));

	const successful = results.filter(r => r.success);
	const failed = results.filter(r => !r.success);

	console.log(`\n✅ Successful: ${successful.length}`);
	successful.forEach(r => {
		console.log(`   - ${r.voice.label} (${r.voice.name})`);
	});

	if (failed.length > 0) {
		console.log(`\n❌ Failed: ${failed.length}`);
		failed.forEach(r => {
			console.log(`   - ${r.voice.label}: ${r.error}`);
		});
	}

	console.log('\n' + '='.repeat(70));
	console.log('Listen to the test files in backend/data/voice-tests/');
	console.log('Pick the deepest male voice you like and update ttsEngine.js');
	console.log('='.repeat(70));

	console.log('\n📝 RECOMMENDED VOICES FOR DEEP MALE NARRATOR:');
	console.log('   1. en-US-Neural2-D with pitch -8.0, rate 0.85 (VERY DEEP)');
	console.log('   2. en-US-Wavenet-D with pitch -8.0, rate 0.85 (VERY DEEP)');
	console.log('   3. en-US-Studio-M with pitch -6.0, rate 0.88 (DEEP)');
	console.log('   4. en-US-Journey-D with pitch -6.0, rate 0.88 (NATURAL DEEP)');
}

testAllVoices()
	.then(() => {
		console.log('\n✅ Voice testing complete!');
		process.exit(0);
	})
	.catch(error => {
		console.error('\n❌ Error:', error);
		process.exit(1);
	});
