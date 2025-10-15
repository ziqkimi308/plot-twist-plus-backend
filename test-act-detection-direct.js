/**
 * Direct test of act detection - calls the function directly without server
 */

import { generateScriptVoices } from './utils/ttsEngine.js';

console.log('Testing act detection directly...\n');

try {
	const results = await generateScriptVoices({
		includeNarration: true,
		narratorVoice: 'john',
		voiceMapping: {},
		provider: 'google'
	});

	console.log('\n=== Voice Generation Complete ===');
	console.log(`Total voices generated: ${results.voices.length}`);
	console.log(`Successful: ${results.metadata.successfulGenerations}`);
	console.log(`Failed: ${results.metadata.failedGenerations}`);

} catch (error) {
	console.error('Error:', error.message);
	console.error(error.stack);
}
