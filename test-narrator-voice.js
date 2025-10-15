/**
 * Quick test to verify Google Cloud TTS narrator voice
 * Tests en-US-Wavenet-D with deep pitch settings
 */

import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new TextToSpeechClient();

const testText = "The night was dark and full of mysteries. Detective Marcus stepped into the abandoned warehouse.";

async function testNarratorVoice() {
	console.log('=' .repeat(70));
	console.log('Testing Google Cloud TTS Narrator Voice');
	console.log('=' .repeat(70));
	console.log(`Test text: "${testText}"`);
	console.log();

	// Test the exact narrator settings
	const voiceName = 'en-US-Wavenet-D';
	const pitch = -10.0;
	const speakingRate = 0.82;

	console.log(`Voice: ${voiceName}`);
	console.log(`Pitch: ${pitch} (very deep)`);
	console.log(`Speaking Rate: ${speakingRate} (slow)`);
	console.log();

	try {
		const request = {
			input: { text: testText },
			voice: {
				languageCode: 'en-US',
				name: voiceName
			},
			audioConfig: {
				audioEncoding: 'MP3',
				pitch: pitch,
				speakingRate: speakingRate
			}
		};

		console.log('Generating audio...');
		const [response] = await client.synthesizeSpeech(request);

		// Save to test file
		const outputPath = path.join(__dirname, 'data', 'voice-tests');
		if (!fs.existsSync(outputPath)) {
			fs.mkdirSync(outputPath, { recursive: true });
		}

		const filename = `narrator_test_wavenet_d_pitch${pitch}_rate${speakingRate}.mp3`;
		const filepath = path.join(outputPath, filename);

		fs.writeFileSync(filepath, response.audioContent, 'binary');

		console.log(`✅ Success!`);
		console.log(`📁 Saved to: ${filepath}`);
		console.log();
		console.log('=' .repeat(70));
		console.log('🎧 Listen to this file to verify the narrator voice');
		console.log('   It should be a VERY DEEP male voice');
		console.log('=' .repeat(70));

	} catch (error) {
		console.error('❌ Error:', error.message);
		console.error();
		console.error('Make sure GOOGLE_APPLICATION_CREDENTIALS is set:');
		console.error('  export GOOGLE_APPLICATION_CREDENTIALS="path/to/credentials.json"');
		process.exit(1);
	}
}

testNarratorVoice()
	.then(() => {
		console.log('\n✅ Test complete!');
		process.exit(0);
	})
	.catch(error => {
		console.error('\n❌ Test failed:', error);
		process.exit(1);
	});
