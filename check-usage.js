/**
 * Check TTS Usage Command
 * Quick tool to check ElevenLabs quota usage
 */

import { displayUsageSummary } from './utils/usageTracker.js';

console.log('\n🎙️  TTS USAGE CHECKER\n');

displayUsageSummary();

console.log('💡 USAGE OPTIMIZATION TIPS:\n');
console.log('   1. Test with short scripts first');
console.log('   2. Use selective narration (not full action lines)');
console.log('   3. Preview character count before generating');
console.log('   4. Google TTS automatically activates when quota exhausted\n');
console.log('📝 Your quota resets automatically at the start of each month!\n');
