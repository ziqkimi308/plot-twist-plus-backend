/**
 * Demo: Google Cloud TTS with Different Character Voices
 * Shows how different characters get different voices with pitch control
 */

import { generateScriptVoices } from './utils/ttsEngine.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test script with multiple characters
const testScript = `
NARRATOR
Interior. A dimly lit detective's office at night. Rain hammers against the windows. Detective Sarah Chen sits alone at her desk, reviewing case files.

SARAH CHEN
Something doesn't add up here. The timeline is completely wrong.

NARRATOR
The door suddenly bursts open. Detective Marcus Reed rushes in, out of breath, holding a folder.

MARCUS REED
Sarah! I found something. You need to see this right now.

SARAH CHEN
What is it?

NARRATOR
Marcus places the folder on her desk. His hands are shaking slightly.

MARCUS REED
The security footage from that night. It shows someone we never suspected.

SARAH CHEN
Who?

MARCUS REED
The mayor's daughter. She was there the whole time.

NARRATOR
Sarah's eyes widen as she flips through the photos. The pieces finally start falling into place.

SARAH CHEN
This changes everything. We need to bring her in for questioning.

MARCUS REED
Already ahead of you. She's waiting in interrogation room two.
`;

async function testGoogleCloudVoices() {
    console.log('🎙️  GOOGLE CLOUD TTS - DIFFERENT VOICES DEMO\n');
    console.log('='.repeat(70));
    console.log('\n✨ Testing Character-Specific Voices with Pitch Control!\n');
    console.log('='.repeat(70));

    console.log('\n🎭 Character Voice Assignments:\n');
    console.log('   NARRATOR:');
    console.log('   • Voice: en-US-Neural2-J (Deep male)');
    console.log('   • Pitch: -5.0 (deeper narrator voice)');
    console.log('   • Speed: 0.9 (slower, authoritative)\n');
    
    console.log('   SARAH CHEN (Female Lead):');
    console.log('   • Voice: en-US-Neural2-F (Calm female)');
    console.log('   • Pitch: 0 (normal)');
    console.log('   • Speed: 1.0 (normal)\n');
    
    console.log('   MARCUS REED (Young Male):');
    console.log('   • Voice: en-US-Neural2-D (Standard male)');
    console.log('   • Pitch: +2.0 (younger sound)');
    console.log('   • Speed: 1.1 (faster, energetic)\n');

    console.log('='.repeat(70));

    const outputDir = path.join(__dirname, 'voice-googlecloud-test');

    try {
        console.log('\n🎬 Generating audio with Google Cloud TTS...\n');
        console.log('   Using character-specific voice configs\n');

        // Force Google Cloud TTS provider to test it
        const results = await generateScriptVoices(testScript, {
            provider: 'googlecloud',    // Force Google Cloud TTS
            outputDir: outputDir,
            includeNarration: true,
            narratorVoice: 'john',      // Deep narrator (maps to Neural2-J)
            voiceMapping: {
                'NARRATOR': 'john',     // Deep male voice
                'SARAH CHEN': 'rachel', // Calm female voice
                'MARCUS REED': 'josh'   // Young energetic voice
            }
        });

        console.log('\n='.repeat(70));
        
        const successFiles = results.filter(r => r.success);
        
        if (successFiles.length > 0) {
            console.log('\n✅ GOOGLE CLOUD TTS VOICE DEMO COMPLETE!\n');
            console.log(`📊 Generated ${successFiles.length} audio files with DIFFERENT voices:\n`);

            // Group by character to show variety
            const byCharacter = {};
            successFiles.forEach(r => {
                if (!byCharacter[r.character]) {
                    byCharacter[r.character] = [];
                }
                byCharacter[r.character].push(r);
            });

            Object.keys(byCharacter).forEach(character => {
                const files = byCharacter[character];
                console.log(`   🎙️  ${character} (${files.length} lines):`);
                console.log(`      Voice configured with unique pitch/speed`);
                console.log(`      Files: ${files.map(f => f.audioFile).join(', ')}`);
                console.log('');
            });

            console.log('='.repeat(70));
            console.log(`\n📂 Location: ${outputDir}\n`);
            console.log('🎧 LISTEN to hear how each character sounds DIFFERENT!\n');
            console.log('='.repeat(70));
            
            console.log('\n✨ What Makes This Better:\n');
            console.log('   Before (basic Google TTS):');
            console.log('   ❌ All characters sounded the same');
            console.log('   ❌ Robotic, monotone voice');
            console.log('   ❌ No way to distinguish speakers\n');
            
            console.log('   Now (Google Cloud TTS):');
            console.log('   ✅ NARRATOR: Deep, authoritative (Neural2-J, pitch -5)');
            console.log('   ✅ SARAH: Calm female voice (Neural2-F, normal)');
            console.log('   ✅ MARCUS: Young, energetic (Neural2-D, pitch +2)');
            console.log('   ✅ Each character sounds UNIQUE!');
            console.log('   ✅ Professional audiobook quality\n');

            console.log('💡 Your 3-Tier Fallback System:\n');
            console.log('   1️⃣  ElevenLabs (10k chars/mo)');
            console.log('      → Custom voices, best quality');
            console.log('   2️⃣  Google Cloud TTS (4M chars/mo) ⭐ THIS DEMO');
            console.log('      → 220+ voices, pitch control, VARIETY');
            console.log('   3️⃣  Basic Google TTS (unlimited)');
            console.log('      → Simple fallback\n');

            console.log('🎉 Your project now has professional voice variety!\n');

            // Open folder
            console.log('🚀 Opening folder...\n');
            exec(`explorer "${outputDir}"`, () => {});
        } else {
            console.log('\n❌ No files generated. Possible issues:\n');
            console.log('   • GOOGLE_CLOUD_TTS_API_KEY not set in .env');
            console.log('   • Invalid API key');
            console.log('   • Google Cloud TTS API not enabled');
            console.log('   • Network connection issue\n');
            console.log('💡 Setup instructions:\n');
            console.log('   1. Go to: https://console.cloud.google.com/');
            console.log('   2. Enable Text-to-Speech API');
            console.log('   3. Create API key');
            console.log('   4. Add to .env: GOOGLE_CLOUD_TTS_API_KEY=your_key\n');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\nTroubleshooting:');
        console.error('   • Make sure GOOGLE_CLOUD_TTS_API_KEY is in .env');
        console.error('   • Enable Text-to-Speech API in Google Cloud Console');
        console.error('   • Check API key permissions\n');
    }
}

console.log('\n');
testGoogleCloudVoices().catch(console.error);
