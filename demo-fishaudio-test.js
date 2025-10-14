/**
 * MINIMAL Fish Audio Test
 * Just ONE line per character to save API quota
 */

import { generateScriptVoices } from './utils/ttsEngine.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MINIMAL test - just 3 lines to save quota
const minimalScript = `
NARRATOR
A detective's office at night. Rain hammers against the windows.

SARAH CHEN
Something doesn't add up here.

MARCUS REED
I found evidence you need to see.
`;

async function testFishAudio() {
    console.log('🐟 FISH AUDIO MINIMAL TEST\n');
    console.log('='.repeat(70));
    console.log('\n⚠️  Testing with just 3 lines to save API quota!\n');
    console.log('='.repeat(70));

    const outputDir = path.join(__dirname, 'voice-fishaudio-test');

    try {
        console.log('\n🎬 Generating with Fish Audio...\n');

        // Force Fish Audio provider
        const results = await generateScriptVoices(minimalScript, {
            provider: 'fishaudio',       // ← Force Fish Audio only
            outputDir: outputDir,
            includeNarration: true
        });

        console.log('\n='.repeat(70));
        
        const successFiles = results.filter(r => r.success);
        
        if (successFiles.length > 0) {
            console.log('\n✅ FISH AUDIO TEST COMPLETE!\n');
            console.log(`📊 Generated ${successFiles.length} audio files:\n`);

            successFiles.forEach(r => {
                const preview = r.line.substring(0, 50);
                console.log(`   🐟 ${r.audioFile}`);
                console.log(`      ${r.character}: "${preview}..."`);
                console.log(`      Size: ${r.sizeKB} KB\n`);
            });

            console.log('='.repeat(70));
            console.log(`\n📂 Location: ${outputDir}\n`);
            console.log('🎧 Listen to hear Fish Audio quality!\n');
            console.log('='.repeat(70));
            
            console.log('\n📝 Note about Fish Audio:');
            console.log('   • Fish Audio uses default model "s1"');
            console.log('   • Voice is natural and professional');
            console.log('   • No voice selection like ElevenLabs');
            console.log('   • All characters use same voice');
            console.log('   • Great as backup/fallback option\n');

            // Open folder
            console.log('🚀 Opening folder...\n');
            exec(`explorer "${outputDir}"`, () => {});
        } else {
            console.log('\n❌ No files generated. Check errors above.\n');
            console.log('Make sure FISHAUDIO_API_KEY is set in .env file\n');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\nPossible issues:');
        console.error('   • FISHAUDIO_API_KEY not set in .env');
        console.error('   • Invalid API key');
        console.error('   • Network connection issue');
        console.error('   • API quota exceeded\n');
    }
}

console.log('\n');
testFishAudio().catch(console.error);
