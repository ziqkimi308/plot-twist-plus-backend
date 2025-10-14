/**
 * Generate Script Route
 * Endpoint for converting plots into screenplay format
 */

import express from 'express';
import { convertPlotToScreenplay } from '../utils/scriptGenerator.js';

const router = express.Router();

/**
 * POST /api/generate-script
 * Converts a 3-act plot into a properly formatted screenplay
 * 
 * Request body:
 * {
 *   "plot": "string - The full 3-act plot to convert",
 *   "title": "string (optional) - Script title",
 *   "style": "string (optional) - Writing style (concise, detailed, etc.)"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "script": "string - Formatted screenplay text",
 *   "metadata": {
 *     "title": "string",
 *     "format": "screenplay",
 *     "pages": number,
 *     "scenes": number,
 *     "characters": ["string"],
 *     "provider": "groq | cohere | huggingface",
 *     "generatedAt": "timestamp"
 *   }
 * }
 */
router.post('/', async (req, res) => {
	try {
		const { title, style } = req.body;

		console.log('\n=== Script Generation Request ===');
		console.log('Title:', title || 'untitled');
		console.log('Style:', style || 'default');

		// Convert plot to screenplay (loads plot from data folder)
		const result = await convertPlotToScreenplay({
			title: title?.trim(),
			style: style?.trim()
		});

		// Extract metadata from script
		const scenes = (result.script.match(/INT\.|EXT\./g) || []).length;
		const characterMatches = result.script.match(/^[A-Z][A-Z\s]+$/gm) || [];
		const uniqueCharacters = [...new Set(characterMatches.map(c => c.trim()))];
		const pages = Math.ceil(result.script.length / 3000); // ~3000 chars per page

		console.log('Script generation completed');
		console.log('Provider:', result.provider);
		console.log('Script length:', result.script.length, 'characters');
		console.log('Scenes:', scenes);
		console.log('Characters:', uniqueCharacters.length);

		// Return the generated script
		res.json({
			success: true,
			script: result.script,
			metadata: {
				title: title?.trim() || 'Untitled',
				format: 'screenplay',
				pages,
				scenes,
				characters: uniqueCharacters,
				provider: result.provider,
				generatedAt: new Date().toISOString()
			}
		});

	} catch (error) {
		console.error('Error generating script:', error);
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to generate script',
			timestamp: new Date().toISOString()
		});
	}
});

export default router;
