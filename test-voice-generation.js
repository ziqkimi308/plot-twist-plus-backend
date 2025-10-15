const http = require('http');
const fs = require('fs');
const path = require('path');

function testVoiceGeneration() {
	return new Promise((resolve, reject) => {
		const data = JSON.stringify({ includeNarration: true });

		const options = {
			hostname: 'localhost',
			port: 3000,
			path: '/api/generate-voice',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': data.length
			},
			timeout: 120000 // 2 minutes
		};

		console.log('Testing voice generation...');
		const req = http.request(options, (res) => {
			let body = '';
			res.on('data', (chunk) => body += chunk);
			res.on('end', () => {
				if (res.statusCode === 200) {
					const result = JSON.parse(body);
					console.log('\n✓ Voice generation successful!');
					console.log('Total lines:', result.metadata.totalLines);
					console.log('Successful:', result.metadata.successfulGenerations);
					console.log('Failed:', result.metadata.failedGenerations);

					// Check voice folders
					const voiceDir = path.join(__dirname, 'data', 'voice');
					const folders = fs.readdirSync(voiceDir);
					console.log('\nVoice folders created:', folders);

					folders.forEach(folder => {
						const folderPath = path.join(voiceDir, folder);
						if (fs.statSync(folderPath).isDirectory()) {
							const files = fs.readdirSync(folderPath);
							console.log(`  ${folder}: ${files.length} files`);
						}
					});

					resolve(result);
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
	.then(() => {
		console.log('\n=== Test Complete ===');
		process.exit(0);
	})
	.catch((err) => {
		console.error('\n=== Test Failed ===');
		console.error(err);
		process.exit(1);
	});
