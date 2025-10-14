/**
 * Plot Generator
 * Generates 3-act plots with plot twists using AI
 */

import { buildPlotPrompt } from './promptBuilder.js';
import { generateText } from './aiTextGenerator.js';

/**
 * Generate a 3-act plot with plot twists
 * @param {Object} params - Plot parameters
 * @param {string} params.genre - Movie genre (e.g., thriller, horror, sci-fi)
 * @param {string} params.characters - Main characters description
 * @param {string} params.setting - Story setting/location
 * @returns {Promise<Object>} Plot data with acts and metadata
 */
export async function generatePlotTwist({ genre, characters, setting }) {
    // Validate inputs
    if (!genre || !characters || !setting) {
        throw new Error('Genre, characters, and setting are all required');
    }

    console.log('Building plot prompt...');
    
    // Build the prompt using promptBuilder
    const prompt = buildPlotPrompt(genre, characters, setting);
    
    console.log('Generating plot with AI...');
    
    // Generate the plot using AI
    const plotText = await generateText(prompt);
    
    // Parse the plot into acts
    const acts = parseActsFromPlot(plotText);
    
    // Determine which provider was used (check the console logs from generateText)
    const provider = detectProvider(plotText);
    
    return {
        plot: plotText,
        acts,
        provider
    };
}

/**
 * Parse the generated plot text into separate acts
 * @param {string} plotText - Full plot text
 * @returns {Object} Object with actI, actII, actIII
 */
function parseActsFromPlot(plotText) {
    const acts = {
        actI: '',
        actII: '',
        actIII: ''
    };
    
    // Try to split by ACT headers
    const actIMatch = plotText.match(/\*\*ACT I[:\s-]+SETUP.*?\*\*\n([\s\S]*?)(?=\*\*ACT II|\*\*ACT 2|$)/i);
    const actIIMatch = plotText.match(/\*\*ACT II[:\s-]+CONFRONTATION.*?\*\*\n([\s\S]*?)(?=\*\*ACT III|\*\*ACT 3|$)/i);
    const actIIIMatch = plotText.match(/\*\*ACT III[:\s-]+RESOLUTION.*?\*\*\n([\s\S]*?)$/i);
    
    if (actIMatch) acts.actI = actIMatch[1].trim();
    if (actIIMatch) acts.actII = actIIMatch[1].trim();
    if (actIIIMatch) acts.actIII = actIIIMatch[1].trim();
    
    // Fallback: if no matches, try simpler patterns
    if (!acts.actI && !acts.actII && !acts.actIII) {
        const simpleActI = plotText.match(/ACT I[\s\S]*?(?=ACT II|ACT 2|$)/i);
        const simpleActII = plotText.match(/ACT II[\s\S]*?(?=ACT III|ACT 3|$)/i);
        const simpleActIII = plotText.match(/ACT III[\s\S]*$/i);
        
        if (simpleActI) acts.actI = simpleActI[0].trim();
        if (simpleActII) acts.actII = simpleActII[0].trim();
        if (simpleActIII) acts.actIII = simpleActIII[0].trim();
    }
    
    return acts;
}

/**
 * Detect which AI provider was used based on plot characteristics
 * @param {string} plotText - Generated plot text
 * @returns {string} Provider name
 */
function detectProvider(plotText) {
    // This is a simple heuristic - in production you'd track this differently
    // For now, we return 'groq' as default since it's the primary provider
    return 'groq';
}
