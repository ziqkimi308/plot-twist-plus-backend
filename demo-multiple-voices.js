/**
 * Demo Multiple Voice Actors
 * Shows how to assign different voices to different characters
 */

import dotenv from 'dotenv';
import { generateScriptVoices, ELEVENLABS_VOICES } from './utils/ttsEngine.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample script with male and female characters
const multiVoiceScript = `
FADE IN:

INT. TECH STARTUP OFFICE - DAY

CEO JENNIFER STONE stands at the whiteboard, presenting to the team.

JENNIFER STONE
This is our opportunity to revolutionize the industry.

DEVELOPER MIKE CHEN leans back in his chair, skeptical.

MIKE CHEN
That's ambitious. What's the timeline?

JENNIFER STONE
Six months. I know it's aggressive, but we can do this.

INVESTOR SARAH WILLIAMS walks in, holding a tablet.

SARAH WILLIAMS
I just reviewed the projections. This could actually work.

MIKE CHEN
What about the budget constraints?

SARAH WILLIAMS
We can secure additional funding if the prototype shows promise.

JENNIFER STONE
Then let's make it happen. Mike, can you lead the development?

MIKE CHEN
Alright, I'm in. But we need more resources.

JENNIFER STONE
Done. Sarah, coordinate with finance.

SARAH WILLIAMS
On it. This is going to be exciting.

FADE OUT.
`;

async function runMultiVoiceDemo() {
    console.log('🎭 MULTIPLE VOICE ACTORS DEMO\n');
    console.log('='.repeat(70));
    
    // Show available voices
    console.log('\n🎙️  Available ElevenLabs Voices:\n');
    console.log('   MALE VOICES:');
    console.log('   • adam     - Deep, mature male (default)');
    console.log('   • antoni   - Well-rounded male');
    console.log('   • arnold   - Crisp, resonant male');
    console.log('   • josh     - Young, energetic male');
    console.log('   • sam      - Raspy, dynamic male\n');
    
    console.log('   FEMALE VOICES:');
    console.log('   • bella    - Soft, well-rounded female');
    console.log('   • elli     - Emotional, expressive female');
    console.log('   • rachel   - Calm, articulate female');
    console.log('   • domi     - Strong, confident female');
    console.log('   • dorothy  - Pleasant, conversational female\n');
    
    console.log('='.repeat(70));

    if (!process.env.ELEVENLABS_API_KEY) {
        console.log('\n❌ ElevenLabs API key not found!');
        console.log('   Add ELEVENLABS_API_KEY to .env file to use different voices.\n');
        return;
    }

    console.log('\n✅ ElevenLabs API key found!\n');
    console.log('='.repeat(70));
    console.log('\n🎬 Character Voice Mapping:\n');
    console.log('   JENNIFER STONE (CEO, Female)    → rachel  (Calm, articulate)');
    console.log('   MIKE CHEN (Developer, Male)     → josh    (Young, energetic)');
    console.log('   SARAH WILLIAMS (Investor, Female) → domi    (Strong, confident)\n');
    console.log('='.repeat(70));

    // Define voice mapping for each character
    const voiceMapping = {
        'JENNIFER STONE': 'rachel',   // Female CEO - Calm, articulate
        'MIKE CHEN': 'josh',          // Male Developer - Young, energetic  
        'SARAH WILLIAMS': 'domi'      // Female Investor - Strong, confident
    };

    const outputDir = path.join(__dirname, 'voice-multiple-actors');

    try {
        console.log('\n🎙️  Generating audio with different voices...\n');

        const results = await generateScriptVoices(multiVoiceScript, {
            provider: 'auto',
            language: 'en',
            outputDir: outputDir,
            voiceMapping: voiceMapping  // Pass voice mapping
        });

        console.log('\n='.repeat(70));
        console.log('\n✅ MULTI-VOICE GENERATION COMPLETE!\n');
        console.log(`📊 Summary:`);
        console.log(`   Total audio files: ${results.filter(r => r.success).length}`);
        console.log(`   Characters: ${new Set(results.map(r => r.character)).size}\n`);

        // Group by character
        const byCharacter = {};
        results.filter(r => r.success).forEach(r => {
            if (!byCharacter[r.character]) {
                byCharacter[r.character] = [];
            }
            byCharacter[r.character].push(r);
        });

        console.log('🎭 Generated Audio Files by Character:\n');
        Object.entries(byCharacter).forEach(([character, files]) => {
            const voice = voiceMapping[character] || 'adam';
            console.log(`   ${character} (Voice: ${voice})`);
            files.forEach(f => {
                console.log(`      ⭐ ${f.audioFile} (${f.sizeKB} KB)`);
            });
            console.log('');
        });

        console.log('='.repeat(70));
        console.log(`\n📂 Audio files saved to:\n   ${outputDir}\n`);
        console.log('🎧 Listen to hear the different voice actors!\n');
        console.log('='.repeat(70));
        console.log('\n💡 How It Works:');
        console.log('   1. Define voiceMapping object with character → voice');
        console.log('   2. Pass voiceMapping in options');
        console.log('   3. Each character gets their assigned voice\n');
        console.log('📝 Example Code:');
        console.log(`
   const voiceMapping = {
       'CHARACTER NAME': 'rachel',  // Female voice
       'ANOTHER CHARACTER': 'josh'  // Male voice
   };

   const results = await generateScriptVoices(script, {
       voiceMapping: voiceMapping
   });
        `);

        // Open folder
        console.log('\n🚀 Opening folder...\n');
        exec(`explorer "${outputDir}"`, (error) => {
            if (error) {
                console.log('   (Could not auto-open folder, please open manually)');
            }
        });

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

console.log('\n');
runMultiVoiceDemo().catch(console.error);
