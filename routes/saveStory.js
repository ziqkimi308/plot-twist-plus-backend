/**
 * Save Story Route
 * Endpoint for saving generated stories and their components
 */

import express from 'express';

const router = express.Router();

/**
 * POST /api/save-story
 * Saves a complete story with all its components
 * 
 * Request body:
 * {
 *   "title": "string",
 *   "plot": "string",
 *   "script": "string", 
 *   "images": "array",
 *   "audioFiles": "array",
 *   "slideshow": "object"
 * }
 */
router.post('/', async (req, res) => {
	try {
		const { title, plot, script, images, audioFiles, slideshow } = req.body;

		console.log('\n=== Save Story Request ===');
		console.log('Title:', title);
		console.log('Plot length:', plot?.length || 0);
		console.log('Script length:', script?.length || 0);
		console.log('Images count:', images?.length || 0);
		console.log('Audio files count:', audioFiles?.length || 0);

		// For now, just return a success response
		// In a real implementation, this would save to a database
		const storyData = {
			id: `story_${Date.now()}`,
			title: title || 'Untitled Story',
			plot,
			script,
			images,
			audioFiles,
			slideshow,
			savedAt: new Date().toISOString()
		};

		res.json({
			success: true,
			message: 'Story saved successfully',
			story: storyData
		});

	} catch (error) {
		console.error('Error saving story:', error);
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to save story',
			timestamp: new Date().toISOString()
		});
	}
});

/**
 * GET /api/save-story
 * Returns list of saved stories (placeholder)
 */
router.get('/', async (req, res) => {
	try {
		// In a real implementation, this would fetch from a database
		res.json({
			success: true,
			stories: [],
			message: 'No saved stories yet - database not implemented'
		});
	} catch (error) {
		console.error('Error retrieving stories:', error);
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to retrieve stories'
		});
	}
});

export default router;
