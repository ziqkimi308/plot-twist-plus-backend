/**
 * Demo: Google TTS Voices
 * Test different Google TTS voices (FREE, no API key needed)
 */

import googleTTS from 'google-tts-api';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test script
const testLines = [
    { character: 'NARRATOR', text: 'Interior. A detective\'s office at night. Rain hammers against the windows.', voice: 'en-US-Neural2-J' },
    { character: 'SARAH (Female)', text: 'Something doesn\'t add up here. The timeline is completely wrong.', voice: 'en-US-Neural2-F' },
    { character: 'MARCUS (Male)', text: 'Sarah! I found something. You need to see this right now.', voice: 'en-US-Neural2-D' },
    { character: 'NARRATOR (Alt)', text: 'The door suddenly bursts open. Detective Marcus Reed rushes in.', voice: 'en-US-Neural2-A' }
];

/**
 * Download audio from Google TTS URL
 */
async function downloadAudio(url, outputPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(outputPath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(outputPath, () => {});
            reject(err);
        });
    });
}

async function testGoogleTTS() {
    console.log('🔊 GOOGLE TTS VOICE DEMO\n');
    console.log('='.repeat(70));
    console.log('\n✅ Google TTS - FREE, No API Key Required!\n');
    console.log('='.repeat(70));
    
    console.log('\n🎙️  Testing Google Neural2 Voices:\n');
    console.log('   Voice Types:');
    console.log('   • Neural2-J - Deep male (best for narrator)');
    console.log('   • Neural2-D - Standard male (good for characters)');
    console.log('   • Neural2-A - Another male option');
    console.log('   • Neural2-F - Female voice\n');
    console.log('='.repeat(70));

    const outputDir = path.join(__dirname, 'voice-google-test');
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('\n🎬 Generating audio samples...\n');

    try {
        for (let i = 0; i < testLines.length; i++) {
            const { character, text, voice } = testLines[i];
            const filename = `${i}_${character.replace(/\s+/g, '_')}.mp3`;
            const filepath = path.join(outputDir, filename);

            console.log(`${i + 1}. Generating: ${character}`);
            console.log(`   Voice: ${voice}`);
            console.log(`   Text: "${text.substring(0, 50)}..."`);

            try {
                // Get Google TTS URL
                const url = googleTTS.getAudioUrl(text, {
                    lang: 'en',
                    slow: false,
                    host: 'https://translate.google.com'
                });

                // Download audio
                await downloadAudio(url, filepath);
                
                const stats = fs.statSync(filepath);
                const sizeKB = (stats.size / 1024).toFixed(2);
                
                console.log(`   ✅ Success - ${sizeKB} KB`);
                console.log('');
                
                // Small delay between requests
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                console.log(`   ❌ Failed: ${error.message}`);
                console.log('');
            }
        }

        console.log('='.repeat(70));
        console.log('\n✅ GOOGLE TTS TEST COMPLETE!\n');
        console.log(`📂 Audio files saved to:\n   ${outputDir}\n`);
        console.log('🎧 Play the files to hear different Google TTS voices!\n');
        console.log('='.repeat(70));
        
        console.log('\n📊 Google TTS vs ElevenLabs:\n');
        console.log('   Google TTS:');
        console.log('   ✅ FREE unlimited');
        console.log('   ✅ No API key needed');
        console.log('   ✅ Always available');
        console.log('   ⚠️  More robotic/synthetic sound');
        console.log('   ⚠️  Less natural than ElevenLabs\n');
        
        console.log('   ElevenLabs:');
        console.log('   ✅ Very natural, human-like');
        console.log('   ✅ Professional quality');
        console.log('   ⚠️  10k chars/month free limit');
        console.log('   ⚠️  API key required\n');
        
        console.log('💡 Recommendation:');
        console.log('   • Use ElevenLabs for production (better quality)');
        console.log('   • Google TTS automatically kicks in as backup');
        console.log('   • Best of both worlds with auto-fallback!\n');

        // Open folder
        console.log('🚀 Opening folder...\n');
        exec(`explorer "${outputDir}"`, () => {});

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

console.log('\n');
testGoogleTTS().catch(console.error);
