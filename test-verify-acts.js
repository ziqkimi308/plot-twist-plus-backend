/**
 * Verify act distribution by checking actual files
 */

import fs from 'fs';
import path from 'path';

const voiceDir = path.join(process.cwd(), 'data', 'voice');
const actDirs = ['voice-act-one', 'voice-act-two', 'voice-act-three'];

console.log('=== Voice File Distribution ===\n');

let totalFiles = 0;
for (const actDir of actDirs) {
	const actPath = path.join(voiceDir, actDir);
	if (fs.existsSync(actPath)) {
		const files = fs.readdirSync(actPath).sort();
		console.log(`${actDir}:`);
		console.log(`  Total files: ${files.length}`);

		// Extract order numbers from filenames (format: 000_CHARACTER.mp3)
		const orders = files
			.map(f => {
				const match = f.match(/^(\d+)_/);
				return match ? parseInt(match[1]) : null;
			})
			.filter(o => o !== null)
			.sort((a, b) => a - b);

		if (orders.length > 0) {
			console.log(`  Orders: ${orders.join(', ')}`);
			totalFiles += files.length;
		}
		console.log();
	} else {
		console.log(`${actDir}: (not found)\n`);
	}
}

console.log(`Total voice files generated: ${totalFiles}`);
