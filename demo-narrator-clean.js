/**
 * Demo: Clean Narration + Dialogue Separation
 * Shows proper audiobook format
 */

import dotenv from 'dotenv';
import { extractScriptWithNarration, generateScriptVoices } from './utils/ttsEngine.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Well-structured script for audiobook
const audiobookScript = `
FADE IN:

INT. ABANDONED WAREHOUSE - NIGHT

Rain hammers against the broken windows. Detective SARAH CHEN moves cautiously through the darkness, flashlight in hand.

SARAH CHEN
Police! Show yourself!

A figure emerges from the shadows. It's MARCUS REED, her former partner.

MARCUS REED
Hello, Sarah. It's been a while.

Sarah's hand moves to her weapon. Her face shows shock and betrayal.

SARAH CHEN
Marcus? They said you were dead.

MARCUS REED
They were wrong.

Marcus steps into the light. A scar runs down his left cheek.

SARAH CHEN
What happened to you?

MARCUS REED
The same people who are after you now.

Thunder crashes outside. Sarah lowers her weapon slightly.

SARAH CHEN
Why should I trust you?

MARCUS REED
Because we're both targets. And I know who's behind it.

Sarah studies his face, searching for deception.

SARAH CHEN
Who?

Marcus glances toward the entrance nervously.

MARCUS REED
Not here. Follow me.

He disappears into the darkness. Sarah hesitates, then follows.

FADE OUT.
`;

async function runCleanDemo() {
    console.log('📖 PROFESSIONAL AUDIOBOOK DEMO\n');
    console.log('='.repeat(70));

    if (!process.env.ELEVENLABS_API_KEY) {
        console.log('\n❌ ElevenLabs API key required!\n');
        return;
    }

    // First, show what will be extracted
    console.log('\n📋 EXTRACTING SCRIPT ELEMENTS...\n');
    const elements = extractScriptWithNarration(audiobookScript);
    
    console.log(`Found ${elements.length} elements:\n`);
    
    let narrationCount = 0;
    let dialogueCount = 0;
    
    elements.forEach((el, i) => {
        const type = el.type || 'dialogue';
        const icon = el.character === 'NARRATOR' ? '📖' : '💬';
        const preview = el.line.substring(0, 60);
        
        if (el.character === 'NARRATOR') {
            narrationCount++;
            console.log(`${i + 1}. ${icon} [NARRATOR]: "${preview}..."`);
        } else {
            dialogueCount++;
            console.log(`${i + 1}. ${icon} [${el.character}]: "${preview}..."`);
        }
    });
    
    console.log(`\n📊 Breakdown:`);
    console.log(`   Narration pieces: ${narrationCount}`);
    console.log(`   Dialogue pieces: ${dialogueCount}\n`);
    console.log('='.repeat(70));

    console.log('\n🎙️  Voice Assignment:\n');
    console.log('   NARRATOR (Action)  → arnold  (Deep, authoritative)');
    console.log('   SARAH CHEN         → rachel  (Female detective)');
    console.log('   MARCUS REED        → sam     (Raspy, mysterious)\n');
    console.log('='.repeat(70));

    const voiceMapping = {
        'NARRATOR': 'arnold',
        'SARAH CHEN': 'rachel',
        'MARCUS REED': 'sam'
    };

    const outputDir = path.join(__dirname, 'voice-audiobook-clean');

    try {
        console.log('\n🎬 Generating audiobook with narration...\n');

        const results = await generateScriptVoices(audiobookScript, {
            provider: 'auto',
            outputDir: outputDir,
            voiceMapping: voiceMapping,
            includeNarration: true,
            narratorVoice: 'arnold'
        });

        console.log('\n='.repeat(70));
        console.log('\n✅ AUDIOBOOK COMPLETE!\n');
        
        const narratorFiles = results.filter(r => r.character === 'NARRATOR');
        const dialogueFiles = results.filter(r => r.character !== 'NARRATOR' && r.success);
        
        console.log(`📊 Generated:`);
        console.log(`   Narrator pieces: ${narratorFiles.length}`);
        console.log(`   Dialogue pieces: ${dialogueFiles.length}`);
        console.log(`   Total: ${results.filter(r => r.success).length} audio files\n`);

        // Show sample files
        console.log('🎭 Sample Output:\n');
        results.slice(0, 6).forEach((r, i) => {
            const icon = r.character === 'NARRATOR' ? '📖' : '💬';
            const preview = r.line.substring(0, 50);
            console.log(`   ${icon} ${r.audioFile}`);
            console.log(`      ${r.character}: "${preview}..."`);
            console.log('');
        });

        console.log('='.repeat(70));
        console.log(`\n📂 Location: ${outputDir}\n`);
        console.log('🎧 Play in order (000, 001, 002...) for full story!\n');
        console.log('='.repeat(70));
        console.log('\n💡 Usage in Your Code:\n');
        console.log(`
   await generateScriptVoices(script, {
       includeNarration: true,      // ← Include action lines
       narratorVoice: 'arnold',     // ← Deep voice for narration
       voiceMapping: {
           'NARRATOR': 'arnold',    // ← Narrator voice
           'CHARACTER': 'rachel'    // ← Character voices
       }
   });
        `);

        console.log('\n🎬 Result: Complete story with context!\n');

        exec(`explorer "${outputDir}"`, () => {});

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

console.log('\n');
runCleanDemo().catch(console.error);
