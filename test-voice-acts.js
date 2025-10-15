#!/usr/bin/env node

// Test voice generation fix
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testVoiceGeneration() {
	const data = JSON.stringify({ includeNarration: true });

	return new Promise((resolve, reject) => {
		const options = {
			hostname: 'localhost',
			port: 3000,
			path: '/api/generate-voice',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': data.length
			},
			timeout: 120000
		};

		console.log('Testing voice generation...\n');
		const req = http.request(options, (res) => {
			let body = '';
			res.on('data', (chunk) => body += chunk);
			res.on('end', () => {
				if (res.statusCode === 200) {
					const result = JSON.parse(body);
					console.log('✓ Voice generation successful!\n');
					console.log('Total lines:', result.metadata.totalLines);
					console.log('Successful:', result.metadata.successfulGenerations);
					console.log('Failed:', result.metadata.failedGenerations);

					// Analyze act distribution
					const actCounts = { ONE: 0, TWO: 0, THREE: 0 };
					result.audio.forEach(item => {
						if (actCounts.hasOwnProperty(item.act)) {
							actCounts[item.act]++;
						}
					});

					console.log('\n=== Act Distribution ===');
					console.log('ACT ONE:', actCounts.ONE, 'files');
					console.log('ACT TWO:', actCounts.TWO, 'files');
					console.log('ACT THREE:', actCounts.THREE, 'files');

					// Check voice folders
					const voiceDir = path.join(__dirname, 'data', 'voice');
					if (fs.existsSync(voiceDir)) {
						const folders = fs.readdirSync(voiceDir);
						console.log('\n=== Voice Folders Created ===');
						folders.forEach(folder => {
							const folderPath = path.join(voiceDir, folder);
							if (fs.statSync(folderPath).isDirectory()) {
								const files = fs.readdirSync(folderPath);
								console.log(`${folder}: ${files.length} files`);
							}
						});
					}

					// Verify all three act folders exist
					const actOneExists = fs.existsSync(path.join(voiceDir, 'voice-act-one'));
					const actTwoExists = fs.existsSync(path.join(voiceDir, 'voice-act-two'));
					const actThreeExists = fs.existsSync(path.join(voiceDir, 'voice-act-three'));

					console.log('\n=== Verification ===');
					console.log('voice-act-one exists:', actOneExists ? '✓' : '✗');
					console.log('voice-act-two exists:', actTwoExists ? '✓' : '✗');
					console.log('voice-act-three exists:', actThreeExists ? '✓' : '✗');

					if (actOneExists && actTwoExists && actThreeExists && actCounts.THREE > 0) {
						console.log('\n🎉 SUCCESS: All three act folders created with content!');
						resolve(true);
					} else {
						console.log('\n❌ FAILURE: Not all act folders created or ACT THREE has no content');
						resolve(false);
					}
				} else {
					console.error('Error:', res.statusCode, body);
					reject(new Error(body));
				}
			});
		});

		req.on('error', (e) => {
			console.error('Request error:', e.message);
			reject(e);
		});

		req.on('timeout', () => {
			console.error('Request timeout');
			req.destroy();
			reject(new Error('Timeout'));
		});

		req.write(data);
		req.end();
	});
}

// Run test
testVoiceGeneration()
	.then((success) => {
		console.log('\n=== Test Complete ===');
		process.exit(success ? 0 : 1);
	})
	.catch((err) => {
		console.error('\n=== Test Failed ===');
		console.error(err);
		process.exit(1);
	});
