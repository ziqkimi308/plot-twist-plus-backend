/**
 * Generate Product Route
 * Endpoint for assembling the final product with script, images, and voice
 */

import express from 'express';
import {
	assembleProduct,
	generatePlaybackInstructions,
	exportProduct,
	generateSubtitles
} from '../utils/productAssembler.js';

const router = express.Router();

/**
 * POST /api/generate-product
 * Assembles the final product with script, images, and voice audio
 * 
 * Request body:
 * {
 *   "script": "string - Full screenplay text",
 *   "images": [
 *     {
 *       "act": "I",
 *       "imageUrl": "string",
 *       "prompt": "string",
 *       "provider": "string"
 *     },
 *     ... (3 images total)
 *   ],
 *   "audioFiles": [
 *     {
 *       "character": "string",
 *       "line": "string",
 *       "order": number,
 *       "audioFile": "string",
 *       "audioPath": "string",
 *       "provider": "string"
 *     },
 *     ...
 *   ]
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "product": {
 *     "plot": "string",
 *     "script": "string", 
 *     "images": [...],
 *     "audioFiles": [...],
 *     "metadata": {
 *       "totalFiles": number,
 *       "generatedAt": "timestamp"
 *     }
 *   }
 * }
 */
router.post('/', async (req, res) => {
	try {
		const { script, images, audioFiles } = req.body;

		// Validate inputs
		if (!script || typeof script !== 'string' || script.trim().length === 0) {
			return res.status(400).json({
				success: false,
				error: 'Script is required and must be a non-empty string'
			});
		}

		if (!Array.isArray(images) || images.length !== 3) {
			return res.status(400).json({
				success: false,
				error: 'Exactly 3 images are required (one per act)'
			});
		}

		if (!Array.isArray(audioFiles)) {
			return res.status(400).json({
				success: false,
				error: 'Audio files must be an array (can be empty for testing)'
			});
		}

		console.log('\n=== Product Assembly Request ===');
		console.log('Script length:', script.length);
		console.log('Images count:', images.length);
		console.log('Audio files count:', audioFiles.length);

		// Assemble product data
		const productData = {
			plot: script,
			script: script,
			images: images,
			audioFiles: audioFiles,
			metadata: {
				totalFiles: images.length + audioFiles.length + 2,
				generatedAt: new Date().toISOString()
			}
		};

		// Generate playback instructions for frontend
		const playback = {
			instructions: {
				totalFiles: productData.metadata.totalFiles,
				format: "presentation"
			},
			metadata: productData.metadata
		};

		// Generate subtitles
		const subtitles = {
			subtitles: [],
			format: 'srt',
			language: 'en',
			generatedAt: new Date().toISOString()
		};

		// Export complete product structure
		const exportedProduct = {
			format: 'json',
			data: productData,
			filename: `product_${Date.now()}.json`
		};

		console.log('Product assembly completed');
		console.log('Total files:', productData.metadata.totalFiles);

		// Return the product data
		res.json({
			success: true,
			product: productData,
			playback,
			subtitles,
			export: exportedProduct,
			metadata: {
				totalFiles: productData.metadata.totalFiles,
				generatedAt: productData.metadata.generatedAt
			}
		});

	} catch (error) {
		console.error('Error assembling product:', error);
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to assemble product',
			timestamp: new Date().toISOString()
		});
	}
});

/**
 * POST /api/generate-product/complete
 * Complete workflow: Takes only genre/characters/setting and generates everything
 * This is a convenience endpoint that chains all generation steps
 * 
 * Request body:
 * {
 *   "genre": "string",
 *   "characters": "string",
 *   "setting": "string"
 * }
 */
router.post('/complete', async (req, res) => {
	try {
		const { genre, characters, setting } = req.body;

		// Validate inputs
		if (!genre || !characters || !setting) {
			return res.status(400).json({
				success: false,
				error: 'Genre, characters, and setting are all required'
			});
		}

		console.log('\n=== Complete Product Generation Request ===');
		console.log('This will generate: Plot → Script → Images → Voice → Product');
		console.log('Genre:', genre);
		console.log('Characters:', characters);
		console.log('Setting:', setting);

		// Note: This endpoint would need to call all other generation endpoints
		// For now, return instructions
		res.json({
			success: true,
			message: 'Complete generation workflow',
			instructions: {
				step1: 'Call POST /api/generate-plot with { genre, characters, setting }',
				step2: 'Call POST /api/generate-script with { plot }',
				step3: 'Call POST /api/generate-image with { plot }',
				step4: 'Call POST /api/generate-voice with { script }',
				step5: 'Call POST /api/generate-product with { script, images, audioFiles }'
			},
			note: 'Frontend should chain these calls, or we can implement server-side chaining'
		});

	} catch (error) {
		console.error('Error in complete generation:', error);
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to generate complete product'
		});
	}
});

export default router;
