/**
 * Demo: Full Audiobook Experience with Narrator
 * Shows narration + dialogue (like movies/audiobooks)
 */

import dotenv from 'dotenv';
import { generateScriptVoices } from './utils/ttsEngine.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample script with action lines and dialogue
const fullScript = `
FADE IN:

INT. DETECTIVE'S OFFICE - NIGHT

A dimly lit office. Detective SARAH CHEN sits at her desk, examining case files. Rain patters against the window.

SARAH CHEN
Something doesn't add up here. The timeline is all wrong.

The door bursts open. Detective MARCUS REED enters, out of breath, holding a folder.

MARCUS REED
Sarah! I found something. You need to see this right now.

SARAH CHEN
What is it?

Marcus places the folder on her desk. His hands are shaking.

MARCUS REED
The security footage from that night. It shows someone we never suspected.

SARAH CHEN
Who?

MARCUS REED
You're not going to believe this... It's the mayor's daughter.

Sarah's eyes widen in shock. She leans back in her chair.

SARAH CHEN
That's impossible. She was out of town that weekend.

MARCUS REED
That's what everyone thought. But the footage doesn't lie.

Sarah stands up and paces the room, thinking.

SARAH CHEN
This changes everything. If we're right about this, we need to move carefully.

MARCUS REED
Agreed. One wrong step and this whole case falls apart.

FADE OUT.
`;

async function runNarratorDemo() {
    console.log('📖 FULL AUDIOBOOK EXPERIENCE DEMO\n');
    console.log('='.repeat(70));
    console.log('\n🎙️  Mode: WITH NARRATOR (Narration + Dialogue)\n');
    console.log('   Like professional audiobooks or radio dramas!\n');
    console.log('='.repeat(70));

    if (!process.env.ELEVENLABS_API_KEY) {
        console.log('\n❌ ElevenLabs API key not found!');
        console.log('   Add ELEVENLABS_API_KEY to .env file.\n');
        return;
    }

    console.log('\n✅ ElevenLabs API key found!\n');
    console.log('='.repeat(70));
    console.log('\n🎭 Voice Assignment:\n');
    console.log('   NARRATOR           → arnold  (Deep, authoritative male)');
    console.log('   SARAH CHEN         → rachel  (Calm female detective)');
    console.log('   MARCUS REED        → josh    (Young energetic male)\n');
    console.log('='.repeat(70));

    // Voice mapping with narrator
    const voiceMapping = {
        'NARRATOR': 'arnold',      // Deep male for narration
        'SARAH CHEN': 'rachel',    // Female detective
        'MARCUS REED': 'josh'      // Male detective
    };

    const outputDir = path.join(__dirname, 'voice-with-narrator');

    try {
        console.log('\n🎬 Generating FULL audiobook with narration...\n');
        console.log('   📝 This includes:');
        console.log('      • Scene descriptions (NARRATOR)');
        console.log('      • Action lines (NARRATOR)');
        console.log('      • Character dialogue (Characters)\n');

        const results = await generateScriptVoices(fullScript, {
            provider: 'auto',
            language: 'en',
            outputDir: outputDir,
            voiceMapping: voiceMapping,
            includeNarration: true,        // ← Enable narration!
            narratorVoice: 'arnold'        // ← Deep male voice
        });

        console.log('\n='.repeat(70));
        console.log('\n✅ FULL AUDIOBOOK GENERATION COMPLETE!\n');
        console.log(`📊 Summary:`);
        console.log(`   Total audio files: ${results.filter(r => r.success).length}`);
        
        // Count by type
        const narrationCount = results.filter(r => r.character === 'NARRATOR').length;
        const dialogueCount = results.filter(r => r.character !== 'NARRATOR').length;
        
        console.log(`   Narration pieces: ${narrationCount}`);
        console.log(`   Dialogue pieces: ${dialogueCount}\n`);

        // Group by character
        const byCharacter = {};
        results.filter(r => r.success).forEach(r => {
            if (!byCharacter[r.character]) {
                byCharacter[r.character] = [];
            }
            byCharacter[r.character].push(r);
        });

        console.log('🎭 Generated Audio Files:\n');
        
        // Show narrator first
        if (byCharacter['NARRATOR']) {
            const voice = voiceMapping['NARRATOR'] || 'arnold';
            console.log(`   NARRATOR (Voice: ${voice} - Deep male for action)`);
            byCharacter['NARRATOR'].forEach(f => {
                const preview = f.line.substring(0, 50);
                console.log(`      📖 ${f.audioFile} - "${preview}..."`);
            });
            console.log('');
        }

        // Show other characters
        Object.entries(byCharacter).forEach(([character, files]) => {
            if (character === 'NARRATOR') return; // Already shown
            
            const voice = voiceMapping[character] || 'adam';
            console.log(`   ${character} (Voice: ${voice})`);
            files.forEach(f => {
                const preview = f.line.substring(0, 50);
                console.log(`      💬 ${f.audioFile} - "${preview}..."`);
            });
            console.log('');
        });

        console.log('='.repeat(70));
        console.log(`\n📂 Audio files saved to:\n   ${outputDir}\n`);
        console.log('🎧 Play in order to hear the full story with narration!\n');
        console.log('='.repeat(70));
        console.log('\n💡 How It Works:\n');
        console.log('   1. Set includeNarration: true');
        console.log('   2. Set narratorVoice: "arnold" (or any voice)');
        console.log('   3. Action lines become NARRATOR audio');
        console.log('   4. Dialogue remains as character audio\n');
        
        console.log('📝 Example Code:\n');
        console.log(`
   const results = await generateScriptVoices(script, {
       includeNarration: true,         // ← Add this!
       narratorVoice: 'arnold',        // ← Deep voice
       voiceMapping: {
           'NARRATOR': 'arnold',
           'SARAH': 'rachel',
           'MIKE': 'josh'
       }
   });
        `);

        console.log('\n🎬 Result: Complete audiobook experience!\n');
        console.log('   Like listening to:');
        console.log('   • Audible audiobooks');
        console.log('   • Movie narration');
        console.log('   • Radio dramas\n');

        // Open folder
        console.log('🚀 Opening folder...\n');
        exec(`explorer "${outputDir}"`, (error) => {
            if (error) {
                console.log('   (Could not auto-open folder, please open manually)');
            }
        });

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\nStack:', error.stack);
    }
}

console.log('\n');
runNarratorDemo().catch(console.error);
