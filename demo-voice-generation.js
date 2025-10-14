/**
 * Demo Voice Generation with Sample Script
 * Generates audio files that you can play locally
 */

import dotenv from 'dotenv';
import { generateScriptVoices, extractDialogue } from './utils/ttsEngine.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample screenplay script
const sampleScript = `
FADE IN:

INT. DETECTIVE'S OFFICE - NIGHT

A dimly lit office. Detective SARAH CHEN sits at her desk, examining case files.

SARAH CHEN
Something doesn't add up here. The timeline is all wrong.

The door bursts open. Detective MARCUS REED enters, out of breath.

MARCUS REED
Sarah! I found something. You need to see this right now.

SARAH CHEN
What is it?

MARCUS REED
The security footage from that night. It shows someone we never suspected.

SARAH CHEN
Who?

MARCUS REED
You're not going to believe this... It's the mayor's daughter.

SARAH CHEN
That's impossible. She was out of town that weekend.

MARCUS REED
That's what everyone thought. But the footage doesn't lie.

SARAH CHEN
This changes everything. If we're right about this, we need to move carefully.

MARCUS REED
Agreed. One wrong step and this whole case falls apart.

FADE OUT.
`;

async function runDemo() {
    console.log('🎙️  PLOTTWIST+ VOICE GENERATION DEMO\n');
    console.log('='.repeat(70));
    console.log('\n📝 Sample Script Preview:\n');
    console.log(sampleScript.substring(0, 300) + '...\n');
    console.log('='.repeat(70));

    // Step 1: Extract dialogue
    console.log('\n📋 STEP 1: Extracting dialogue from script...\n');
    const dialogue = extractDialogue(sampleScript);
    console.log(`✅ Found ${dialogue.length} dialogue lines:\n`);
    
    dialogue.forEach((d, i) => {
        console.log(`   ${i + 1}. ${d.character}: "${d.line.substring(0, 50)}${d.line.length > 50 ? '...' : ''}"`);
    });

    // Check API keys
    console.log('\n='.repeat(70));
    console.log('\n🔑 STEP 2: Checking TTS providers...\n');
    
    if (process.env.ELEVENLABS_API_KEY) {
        console.log('   ✅ ElevenLabs API key found - Will use high-quality voices');
    } else {
        console.log('   ⚠️  No ElevenLabs API key - Will use Google TTS (free unlimited)');
        console.log('   💡 To get better quality voices:');
        console.log('      1. Sign up at: https://elevenlabs.io/sign-up');
        console.log('      2. Get your free API key (10k chars/month)');
        console.log('      3. Add to .env: ELEVENLABS_API_KEY=your_key_here\n');
    }

    console.log('='.repeat(70));
    console.log('\n🎬 STEP 3: Generating audio files...\n');

    // Output directory
    const outputDir = path.join(__dirname, 'voice-demo-output');

    try {
        // Generate voices
        const results = await generateScriptVoices(sampleScript, {
            provider: 'auto',  // Try ElevenLabs, fallback to Google
            language: 'en',
            outputDir: outputDir
        });

        console.log('\n='.repeat(70));
        console.log('\n✅ VOICE GENERATION COMPLETE!\n');
        console.log(`📊 Summary:`);
        console.log(`   Total dialogue lines: ${dialogue.length}`);
        console.log(`   Audio files created: ${results.filter(r => r.success).length}`);
        console.log(`   Failed: ${results.filter(r => !r.success).length}\n`);

        // Show results
        console.log('📁 Generated Audio Files:\n');
        const successfulResults = results.filter(r => r.success);
        
        if (successfulResults.length > 0) {
            successfulResults.forEach((result, index) => {
                const providerIcon = result.provider === 'elevenlabs' ? '⭐' : '🔊';
                console.log(`   ${providerIcon} ${result.audioFile}`);
                console.log(`      Character: ${result.character}`);
                console.log(`      Provider: ${result.provider}`);
                console.log(`      Size: ${result.sizeKB} KB`);
                console.log(`      Line: "${result.line.substring(0, 60)}${result.line.length > 60 ? '...' : ''}"`);
                console.log('');
            });

            console.log('='.repeat(70));
            console.log(`\n📂 Audio files saved to:\n   ${outputDir}\n`);
            console.log('🎧 You can now play these MP3 files in any audio player!\n');
            console.log('='.repeat(70));
            console.log('\n💡 Next Steps:');
            console.log('   1. Open the folder above to see your audio files');
            console.log('   2. Play them in order: 000_*.mp3, 001_*.mp3, etc.');
            console.log('   3. Use these files in your application\n');

            // Open folder automatically (Windows)
            console.log('🚀 Opening folder...\n');
            exec(`explorer "${outputDir}"`, (error) => {
                if (error) {
                    console.log('   (Could not auto-open folder, please open manually)');
                }
            });
        } else {
            console.log('❌ No audio files were generated. Check errors above.\n');
        }

    } catch (error) {
        console.error('\n❌ Error during voice generation:', error.message);
        console.error('\nStack trace:', error.stack);
    }
}

// Run the demo
console.log('\n');
runDemo().catch(console.error);
