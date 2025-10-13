/**
 * Test script for PlotTwist+ Backend
 * Tests the generate script functionality
 */

import { buildScriptPrompt } from './utils/promptBuilder.js';
import { generateText } from './utils/aiTextGenerator.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testGenerateScript() {
    console.log('🎬 Testing PlotTwist+ Generate Script...\n');
    
    try {
        // Use the plot we generated earlier
        const plot = `**ACT I - SETUP**

In the rain-soaked city of 1980s Chicago, Detective James "Jim" Thompson is a man haunted by his past. A former homicide detective with a dark record for using unorthodox methods to solve cases, Jim's reputation precedes him. He's now a loner, working as a consultant on a string of gruesome murders that have left the city's police department baffled.

The latest victim, a young woman named Sarah, was found brutally murdered in an abandoned warehouse on the outskirts of town. The killer left behind a cryptic clue - a small, handmade puzzle box with a note that reads: "The answer lies with the ones who have been silenced."

As Jim begins to investigate, he meets his new partner, Emma Taylor, a bright and ambitious rookie detective. Emma is eager to prove herself, but Jim's reluctance to share his expertise and his troubled past create tension between them.

**MIDPOINT TWIST:** Jim's investigation takes a personal turn when he realizes that his wife's killer is one of the victims on the list. The killer, it turns out, was not a lone serial killer, but a member of a secret society within the police department.

**FINAL TWIST:** The society's true leader is revealed to be none other than Jim's own brother, thought to be dead. The brother was the mastermind behind the corruption scandal and the killings.`;

        console.log('📝 Plot to convert:');
        console.log(plot.substring(0, 200) + '...\n');
        
        // Build the script prompt
        console.log('🔨 Building script prompt...');
        const prompt = buildScriptPrompt(plot);
        console.log('✅ Script prompt built successfully!\n');
        
        // Generate the script
        console.log('🤖 Generating script with AI...');
        console.log('Trying APIs in order: Groq → Cohere → Fallback');
        const script = await generateText(prompt);
        
        console.log('🎉 Script generated successfully!\n');
        console.log('📖 Generated Script:');
        console.log('=' .repeat(50));
        console.log(script);
        console.log('=' .repeat(50));
        
    } catch (error) {
        console.error('❌ Error testing generate script:', error.message);
        console.error('Full error:', error);
    }
}

// Run the test
testGenerateScript();
