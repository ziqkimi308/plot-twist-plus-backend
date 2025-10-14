/**
 * Script Generator
 * Converts 3-act plots into screenplay format
 */

import { buildScriptPrompt } from './promptBuilder.js';
import { generateText } from './aiTextGenerator.js';

/**
 * Convert a plot into a properly formatted screenplay
 * @param {string} plot - The 3-act plot to convert
 * @param {Object} options - Optional parameters
 * @param {string} options.title - Script title
 * @param {string} options.style - Writing style (concise, detailed, etc.)
 * @returns {Promise<Object>} Script data with metadata
 */
export async function convertPlotToScreenplay(plot, options = {}) {
    const { title, style } = options;
    
    // Validate input
    if (!plot || typeof plot !== 'string' || plot.trim().length === 0) {
        throw new Error('Plot is required and must be a non-empty string');
    }

    console.log('Building screenplay prompt...');
    
    // Build the prompt using promptBuilder (only takes plot parameter)
    const prompt = buildScriptPrompt(plot);
    
    console.log('Converting plot to screenplay with AI...');
    
    // Generate the screenplay using AI
    const scriptText = await generateText(prompt);
    
    // Determine which provider was used
    const provider = 'groq'; // Default assumption
    
    return {
        script: scriptText,
        provider
    };
}
