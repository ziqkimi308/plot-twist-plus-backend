/**
 * Test script for PlotTwist+ Backend
 * Tests the generate plot functionality
 */

import { buildPlotPrompt } from './utils/promptBuilder.js';
import { generateText } from './utils/aiTextGenerator.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testGeneratePlot() {
    console.log('🎭 Testing PlotTwist+ Generate Plot...\n');
    
    try {
        // Test parameters
        const genre = "thriller";
        const characters = "A detective with a dark past and a serial killer who leaves cryptic clues";
        const setting = "A rainy city in the 1980s";
        
        console.log('📝 Test Parameters:');
        console.log(`Genre: ${genre}`);
        console.log(`Characters: ${characters}`);
        console.log(`Setting: ${setting}\n`);
        
        // Build the prompt
        console.log('🔨 Building plot prompt...');
        const prompt = buildPlotPrompt(genre, characters, setting);
        console.log('✅ Prompt built successfully!\n');
        
        // Generate the plot
        console.log('🤖 Generating plot with AI...');
        console.log('Trying APIs in order: Groq → Cohere → Fallback');
        const plot = await generateText(prompt);
        
        console.log('🎉 Plot generated successfully!\n');
        console.log('📖 Generated Plot:');
        console.log('=' .repeat(50));
        console.log(plot);
        console.log('=' .repeat(50));
        
    } catch (error) {
        console.error('❌ Error testing generate plot:', error.message);
        console.error('Full error:', error);
    }
}

// Run the test
testGeneratePlot();
