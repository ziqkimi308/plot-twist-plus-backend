/**
 * Generate Slideshow Route
 * Endpoint for combining script, images, and voice into synchronized slideshow
 */

import express from 'express';
import {
	generateSlideshowData,
	generatePlaybackInstructions,
	exportSlideshow,
	generateSubtitles
} from '../utils/slideshowGenerator.js';

const router = express.Router();

/**
 * POST /api/generate-slideshow
 * Combines script text, act images, and voice audio into a synchronized slideshow
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
 *   "slideshow": {
 *     "slides": [
 *       {
 *         "act": "I",
 *         "actName": "ACT I - SETUP",
 *         "image": { ... },
 *         "lines": [ ... ],
 *         "audio": [ ... ],
 *         "timings": [
 *           {
 *             "character": "string",
 *             "text": "string",
 *             "startTime": number,
 *             "duration": number,
 *             "audioFile": "string"
 *           },
 *           ...
 *         ]
 *       },
 *       ... (3 slides total)
 *     ],
 *     "metadata": {
 *       "totalSlides": 3,
 *       "totalDuration": number,
 *       "totalLines": number,
 *       "generatedAt": "timestamp"
 *     }
 *   },
 *   "playback": [ ... ],
 *   "subtitles": "string - SRT format"
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

		if (!Array.isArray(audioFiles) || audioFiles.length === 0) {
			return res.status(400).json({
				success: false,
				error: 'Audio files array is required and must not be empty'
			});
		}

		console.log('\n=== Slideshow Generation Request ===');
		console.log('Script length:', script.length);
		console.log('Images count:', images.length);
		console.log('Audio files count:', audioFiles.length);

		// Generate slideshow data
		const slideshowData = generateSlideshowData({
			script,
			images,
			audioFiles
		});

		// Generate playback instructions for frontend
		const playback = generatePlaybackInstructions(slideshowData);

		// Generate subtitles (SRT format)
		const subtitles = generateSubtitles(slideshowData);

		// Export complete slideshow structure
		const exportedSlideshow = exportSlideshow(slideshowData, {
			includeRawData: false
		});

		console.log('Slideshow generation completed');
		console.log('Total slides:', slideshowData.metadata.totalSlides);
		console.log('Total duration:', Math.round(slideshowData.metadata.totalDuration), 'seconds');
		console.log('Total lines:', slideshowData.metadata.totalLines);

		// Return the slideshow data
		res.json({
			success: true,
			slideshow: slideshowData,
			playback,
			subtitles,
			export: exportedSlideshow,
			metadata: {
				totalSlides: slideshowData.metadata.totalSlides,
				totalDuration: slideshowData.metadata.totalDuration,
				totalLines: slideshowData.metadata.totalLines,
				generatedAt: slideshowData.metadata.generatedAt
			}
		});

	} catch (error) {
		console.error('Error generating slideshow:', error);
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to generate slideshow',
			timestamp: new Date().toISOString()
		});
	}
});

/**
 * POST /api/generate-slideshow/complete
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

		console.log('\n=== Complete Slideshow Generation Request ===');
		console.log('This will generate: Plot → Script → Images → Voice → Slideshow');
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
				step5: 'Call POST /api/generate-slideshow with { script, images, audioFiles }'
			},
			note: 'Frontend should chain these calls, or we can implement server-side chaining'
		});

	} catch (error) {
		console.error('Error in complete generation:', error);
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to generate complete slideshow'
		});
	}
});

export default router;
