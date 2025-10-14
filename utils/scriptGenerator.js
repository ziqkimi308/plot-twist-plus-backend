/**
 * Script Generator
 * Converts 3-act plots into screenplay format
 */

import { buildScriptPrompt } from './promptBuilder.js';
import { generateText } from './aiTextGenerator.js';
import { extractDialogue, extractScriptWithNarration } from './ttsEngine.js';
import fs from 'fs';
import path from 'path';

/**
 * Convert a plot into a properly formatted screenplay
 * @param {string} plot - The 3-act plot to convert
 * @param {Object} options - Optional parameters
 * @param {string} options.title - Script title
 * @param {string} options.style - Writing style (concise, detailed, etc.)
 * @returns {Promise<Object>} Script data with metadata
 */
export async function convertPlotToScreenplay(options = {}) {
	const { title, style } = options;
	// Load complete plot from data/plot folder
	const plotDir = path.join(process.cwd(), 'data', 'plot');
	if (!fs.existsSync(plotDir)) {
		throw new Error('Plot folder does not exist');
	}
	const plotFile = path.join(plotDir, 'plot-complete.txt');
	if (!fs.existsSync(plotFile)) {
		throw new Error('No plot file found in data/plot folder');
	}
	const plot = fs.readFileSync(plotFile, 'utf-8');

	console.log('Building screenplay prompt...');
	// Build the prompt using promptBuilder (only takes plot parameter)
	const prompt = buildScriptPrompt(plot);

	console.log('Converting plot to screenplay with AI...');
	// Generate the screenplay using AI
	const scriptText = await generateText(prompt);

	// Save script to data/script folder with separate act files
	const scriptDir = path.join(process.cwd(), 'data', 'script');
	if (!fs.existsSync(scriptDir)) {
		fs.mkdirSync(scriptDir, { recursive: true });
	}
	
	// Split script by acts
	const actMatches = scriptText.split(/(?=ACT\s+(?:I+|II|III|ONE|TWO|THREE))/i);
	let actI = '', actII = '', actIII = '';
	
	for (const section of actMatches) {
		if (/ACT\s+(?:I+|ONE)/i.test(section)) {
			actI = section;
		} else if (/ACT\s+(?:II|TWO)/i.test(section)) {
			actII = section;
		} else if (/ACT\s+(?:III|THREE)/i.test(section)) {
			actIII = section;
		}
	}
	
	// Save individual act files
	fs.writeFileSync(path.join(scriptDir, 'script-act-one.txt'), actI);
	fs.writeFileSync(path.join(scriptDir, 'script-act-two.txt'), actII);
	fs.writeFileSync(path.join(scriptDir, 'script-act-three.txt'), actIII);
	
	// Also save complete script
	fs.writeFileSync(path.join(scriptDir, 'script-complete.txt'), scriptText);
	console.log('Script saved to:', scriptDir);

	// Extract scenes (scene headings) and characters from the script
	const scriptElements = extractScriptWithNarration(scriptText);
	// Scenes: all elements of type 'scene-heading'
	const scenes = scriptElements.filter(e => e.type === 'scene-heading').map(e => e.line);
	// Characters: all unique character names from dialogue
	const dialogue = extractDialogue(scriptText);
	const characters = [...new Set(dialogue.map(d => d.character))];

	// Determine which provider was used
	const provider = 'groq'; // Default assumption

	return {
		script: scriptText,
		provider,
		scenes,
		characters
	};
}

