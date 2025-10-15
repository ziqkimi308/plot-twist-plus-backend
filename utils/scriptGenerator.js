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
	// Load all three plot act files and concatenate with clear act markers
	const plotDir = path.join(process.cwd(), 'data', 'plot');
	if (!fs.existsSync(plotDir)) {
		throw new Error('Plot folder does not exist');
	}
	const actOneFile = path.join(plotDir, 'plot-act-one.txt');
	const actTwoFile = path.join(plotDir, 'plot-act-two.txt');
	const actThreeFile = path.join(plotDir, 'plot-act-three.txt');
	if (!fs.existsSync(actOneFile) || !fs.existsSync(actTwoFile) || !fs.existsSync(actThreeFile)) {
		throw new Error('One or more act plot files missing in data/plot folder');
	}
	const actOnePlot = fs.readFileSync(actOneFile, 'utf-8');
	const actTwoPlot = fs.readFileSync(actTwoFile, 'utf-8');
	const actThreePlot = fs.readFileSync(actThreeFile, 'utf-8');

	// Reconstruct the full plot with clear act markers to help AI understand structure
	const fullPlot = `**ACT ONE - SETUP**
${actOnePlot}

**ACT TWO - CONFRONTATION**
${actTwoPlot}

**ACT THREE - RESOLUTION**
${actThreePlot}`;

	console.log('Building screenplay prompt...');
	console.log('--- ACT I PLOT ---\n', actOnePlot.substring(0, 200));
	console.log('--- ACT II PLOT ---\n', actTwoPlot.substring(0, 200));
	console.log('--- ACT III PLOT ---\n', actThreePlot.substring(0, 200));
	// Build the prompt using promptBuilder (only takes plot parameter)
	const prompt = buildScriptPrompt(fullPlot);

	console.log('Screenplay prompt sent to AI:');
	console.log(prompt);

	console.log('Converting plot to screenplay with AI...');
	// Generate the screenplay using AI
	const scriptText = await generateText(prompt);

	// Save script to data/script folder with separate act files
	const scriptDir = path.join(process.cwd(), 'data', 'script');
	if (!fs.existsSync(scriptDir)) {
		fs.mkdirSync(scriptDir, { recursive: true });
	}

	// Split script by acts - match only standalone act headers, not embedded in other text
	console.log('Full script text length:', scriptText.length);
	console.log('Script preview:', scriptText.substring(0, 200));

	// Split using newline + act marker pattern to avoid matching "ACT ONE CONCLUSION"
	const actMatches = scriptText.split(/((?:^|\n)\*\*ACT\s*(?:ONE|TWO|THREE)\*\*)/gim);
	console.log('Act matches count:', actMatches.length);
	console.log('Act matches:', actMatches.map((m, i) => `[${i}]: ${m.substring(0, 50)}`));

	let actI = '', actII = '', actIII = '';

	// Reconstruct acts by pairing headers with their content
	for (let i = 0; i < actMatches.length; i++) {
		const section = actMatches[i];

		// Check if this is an act header
		if (/^\*\*ACT\s*ONE\*\*/i.test(section.trim())) {
			// Get the content (next element in array)
			actI = section + (actMatches[i + 1] || '');
			console.log('Found ACT ONE, length:', actI.length);
		} else if (/^\*\*ACT\s*TWO\*\*/i.test(section.trim())) {
			actII = section + (actMatches[i + 1] || '');
			console.log('Found ACT TWO, length:', actII.length);
		} else if (/^\*\*ACT\s*THREE\*\*/i.test(section.trim())) {
			actIII = section + (actMatches[i + 1] || '');
			console.log('Found ACT THREE, length:', actIII.length);
		}
	}

	console.log('Final ACT ONE length:', actI.length);
	console.log('Final ACT TWO length:', actII.length);
	console.log('Final ACT THREE length:', actIII.length);

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

