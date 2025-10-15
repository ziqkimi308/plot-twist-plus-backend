/**
 * Save Story Route
 * Endpoint for saving generated stories and their components
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORIES_DIR = path.join(__dirname, '..', 'data', 'stories');

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


		// Ensure storage directory exists
		if (!fs.existsSync(STORIES_DIR)) {
			fs.mkdirSync(STORIES_DIR, { recursive: true });
		}

		// Create and persist story file
		const id = `story_${Date.now()}`;
		const storyData = {
			id,
			title: title || 'Untitled Story',
			plot,
			script,
			images,
			audioFiles,
			slideshow,
			savedAt: new Date().toISOString()
		};
		const filePath = path.join(STORIES_DIR, `${id}.json`);
		fs.writeFileSync(filePath, JSON.stringify(storyData, null, 2), 'utf-8');

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
		if (!fs.existsSync(STORIES_DIR)) {
			return res.json({ success: true, stories: [] });
		}
		const files = fs.readdirSync(STORIES_DIR).filter(f => f.endsWith('.json'));
		const stories = files.map(f => {
			try {
				const raw = fs.readFileSync(path.join(STORIES_DIR, f), 'utf-8');
				const { id, title, savedAt } = JSON.parse(raw);
				return { id, title, savedAt };
			} catch {
				return null;
			}
		}).filter(Boolean);
		res.json({ success: true, stories });
	} catch (error) {
		console.error('Error retrieving stories:', error);
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to retrieve stories'
		});
	}
});

/**
 * GET /api/save-story/:id
 * Returns a saved story by id
 */
router.get('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		if (!id || id.includes('..') || id.includes('/') || id.includes('\\')) {
			return res.status(400).json({ success: false, error: 'Invalid id' });
		}
		const filePath = path.join(STORIES_DIR, `${id}.json`);
		if (!fs.existsSync(filePath)) {
			return res.status(404).json({ success: false, error: 'Story not found' });
		}
		const raw = fs.readFileSync(filePath, 'utf-8');
		const story = JSON.parse(raw);
		return res.json({ success: true, story });
	} catch (error) {
		console.error('Error retrieving story:', error);
		res.status(500).json({ success: false, error: error.message || 'Failed to retrieve story' });
	}
});

export default router;
