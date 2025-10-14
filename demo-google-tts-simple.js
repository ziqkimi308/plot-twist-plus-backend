/**
 * Demo: Google TTS Test
 * Test Google TTS voices (FREE, no API key needed)
 */

import { generateScriptVoices } from './utils/ttsEngine.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple test script
const testScript = `
NARRATOR
Interior. A detective's office at night. Rain hammers against the windows. Detective Sarah Chen sits alone at her desk.

SARAH CHEN
Something doesn't add up here. The timeline is completely wrong.

NARRATOR
The door suddenly bursts open. Detective Marcus Reed rushes in, out of breath.

MARCUS REED
Sarah! I found something. You need to see this right now.

SARAH CHEN
What is it?

NARRATOR
Marcus places a folder on her desk. His hands are shaking slightly.

MARCUS REED
The security footage from that night. It shows someone we never suspected.

SARAH CHEN
Who?

MARCUS REED
The mayor's daughter.
`;

async function testGoogleTTS() {
    console.log('🔊 GOOGLE TTS DEMO\n');
    console.log('='.repeat(70));
    console.log('\n✅ Google TTS - FREE & Unlimited!\n');
    console.log('   • No API key required');
    console.log('   • Always available as backup');
    console.log('   • Good quality (slightly robotic)\n');
    console.log('='.repeat(70));

    const outputDir = path.join(__dirname, 'voice-google-test');

    try {
        console.log('\n🎬 Generating audio with Google TTS...\n');
        console.log('   This will use Google TTS instead of ElevenLabs\n');

        // Force Google TTS by setting provider to 'google'
        const results = await generateScriptVoices(testScript, {
            provider: 'google',           // ← Force Google TTS
            language: 'en',
            outputDir: outputDir,
            includeNarration: true,
            voiceMapping: {
                'NARRATOR': 'google',
                'SARAH CHEN': 'google',
                'MARCUS REED': 'google'
            }
        });

        console.log('\n='.repeat(70));
        console.log('\n✅ GOOGLE TTS TEST COMPLETE!\n');
        
        const successFiles = results.filter(r => r.success);
        console.log(`📊 Generated ${successFiles.length} audio files:\n`);

        // Show files
        successFiles.slice(0, 5).forEach(r => {
            const preview = r.line.substring(0, 50);
            console.log(`   🔊 ${r.audioFile}`);
            console.log(`      ${r.character}: "${preview}..."`);
            console.log(`      Provider: ${r.provider}, Size: ${r.sizeKB} KB`);
            console.log('');
        });

        console.log('='.repeat(70));
        console.log(`\n📂 Location: ${outputDir}\n`);
        console.log('🎧 Listen to hear Google TTS quality!\n');
        console.log('='.repeat(70));
        
        console.log('\n📊 Comparison:\n');
        console.log('   Google TTS (These files):');
        console.log('   ✅ FREE unlimited');
        console.log('   ✅ No API key needed');
        console.log('   ✅ Very fast generation');
        console.log('   ⚠️  Robotic/synthetic sound');
        console.log('   ⚠️  All characters sound similar\n');
        
        console.log('   ElevenLabs (With API key):');
        console.log('   ✅ Natural, human-like voices');
        console.log('   ✅ Different voices per character');
        console.log('   ✅ Professional audiobook quality');
        console.log('   ⚠️  10,000 chars/month limit\n');
        
        console.log('💡 Your Current Setup:');
        console.log('   • ElevenLabs as PRIMARY (when API key exists)');
        console.log('   • Google TTS as BACKUP (always available)');
        console.log('   • Automatic fallback if ElevenLabs fails\n');
        console.log('   Best of both worlds! 🎉\n');

        // Open folder
        console.log('🚀 Opening folder...\n');
        exec(`explorer "${outputDir}"`, () => {});

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error.stack);
    }
}

console.log('\n');
testGoogleTTS().catch(console.error);
