/**
 * Demo: Nigel Graves as Narrator
 * Testing the professional narrator voice
 */

import dotenv from 'dotenv';
import { generateScriptVoices } from './utils/ttsEngine.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testScript = `
NARRATOR
Interior. A detective's office at night. Rain hammers against the windows. Detective Sarah Chen sits alone at her desk, surrounded by case files.

SARAH CHEN
Something doesn't add up here. The timeline is all wrong.

NARRATOR
The door suddenly bursts open. Detective Marcus Reed rushes in, out of breath, clutching a folder.

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

NARRATOR
Marcus takes a deep breath before answering.

MARCUS REED
The mayor's daughter.

NARRATOR
Sarah's eyes widen in shock. She leans back in her chair.

SARAH CHEN
That's impossible. She was out of town that weekend.

MARCUS REED
That's what everyone thought. But the footage doesn't lie.
`;

async function runNigelDemo() {
    console.log('🎙️  NIGEL GRAVES NARRATOR DEMO\n');
    console.log('='.repeat(70));

    if (!process.env.ELEVENLABS_API_KEY) {
        console.log('\n❌ ElevenLabs API key required!\n');
        return;
    }

    console.log('\n✅ ElevenLabs API key found!\n');
    console.log('='.repeat(70));
    console.log('\n🎭 NEW Voice Assignment:\n');
    console.log('   NARRATOR (Nigel Graves) → nigel   (Professional narrator) ⭐');
    console.log('   SARAH CHEN              → rachel  (Calm female detective)');
    console.log('   MARCUS REED             → josh    (Young energetic male) [NEW!]\n');
    console.log('   Previous: Marcus used "sam" (raspy) - Changed to "josh"\n');
    console.log('='.repeat(70));

    const voiceMapping = {
        'NARRATOR': 'nigel',       // ← Nigel Graves - Professional narrator
        'SARAH CHEN': 'rachel',
        'MARCUS REED': 'josh'      // ← Changed from 'sam' to 'josh'
    };

    const outputDir = path.join(__dirname, 'voice-nigel-narrator');

    try {
        console.log('\n🎬 Generating audio with Nigel Graves narrator...\n');

        const results = await generateScriptVoices(testScript, {
            provider: 'auto',
            outputDir: outputDir,
            voiceMapping: voiceMapping,
            includeNarration: true,
            narratorVoice: 'nigel'  // ← Nigel Graves
        });

        console.log('\n='.repeat(70));
        console.log('\n✅ GENERATION COMPLETE!\n');
        
        const narratorFiles = results.filter(r => r.character === 'NARRATOR');
        const dialogueFiles = results.filter(r => r.character !== 'NARRATOR' && r.success);
        
        console.log(`📊 Summary:`);
        console.log(`   Narrator (Nigel): ${narratorFiles.length} files`);
        console.log(`   Dialogue: ${dialogueFiles.length} files`);
        console.log(`   Total: ${results.filter(r => r.success).length} audio files\n`);

        console.log('🎭 Generated Files:\n');
        
        // Show narrator files
        console.log('   📖 NARRATOR (Nigel Graves):');
        narratorFiles.slice(0, 3).forEach(f => {
            const preview = f.line.substring(0, 50);
            console.log(`      ${f.audioFile} - "${preview}..."`);
        });
        console.log('');

        // Show Sarah
        const sarahFiles = results.filter(r => r.character === 'SARAH CHEN' && r.success);
        console.log('   💬 SARAH CHEN (Rachel):');
        sarahFiles.slice(0, 2).forEach(f => {
            const preview = f.line.substring(0, 50);
            console.log(`      ${f.audioFile} - "${preview}..."`);
        });
        console.log('');

        // Show Marcus
        const marcusFiles = results.filter(r => r.character === 'MARCUS REED' && r.success);
        console.log('   💬 MARCUS REED (Josh - NEW!):');
        marcusFiles.slice(0, 2).forEach(f => {
            const preview = f.line.substring(0, 50);
            console.log(`      ${f.audioFile} - "${preview}..."`);
        });
        console.log('');

        console.log('='.repeat(70));
        console.log(`\n📂 Location: ${outputDir}\n`);
        console.log('🎧 Listen to hear Nigel Graves professional narration!\n');
        console.log('   Nigel is a professional narrator voice - perfect for audiobooks.\n');
        console.log('='.repeat(70));
        console.log('\n💡 Marcus Voice Changed:');
        console.log('   Old: "sam" (raspy, mysterious)');
        console.log('   New: "josh" (young, energetic)\n');
        console.log('   Other options for Marcus:');
        console.log('   • antoni - Well-rounded, balanced');
        console.log('   • arnold - Powerful, authoritative');
        console.log('   • adam - Deep, mature\n');

        exec(`explorer "${outputDir}"`, () => {});

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

console.log('\n');
runNigelDemo().catch(console.error);
