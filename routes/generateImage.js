/**
 * Generate Image Route
 * Endpoint for generating images from plot acts
 */

import express from 'express';
import { buildImagePrompts } from '../utils/promptBuilder.js';
import { generateActImages } from '../utils/imageEngine.js';

const router = express.Router();

/**
 * POST /api/generate-image
 * Generates 3 images (one per act) from a plot
 * 
 * Request body:
 * {
 *   "plot": "string - The full 3-act plot text",
 *   "style": "string (optional) - Image style description",
 *   "aspect": "string (optional) - Aspect ratio (default: 16:9)",
 *   "negative": "string (optional) - Negative prompt"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "images": [
 *     {
 *       "act": "I",
 *       "imageUrl": "string",
 *       "prompt": "string",
 *       "provider": "pollinations.ai | huggingface | fallback",
 *       "width": number,
 *       "height": number
 *     },
 *     ...
 *   ],
 *   "generatedAt": "timestamp"
 * }
 */
router.post('/', async (req, res) => {
    try {
        const { plot, style, aspect, negative } = req.body;

        // Validate input
        if (!plot || typeof plot !== 'string' || plot.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Plot is required and must be a non-empty string'
            });
        }

        console.log('\n=== Image Generation Request ===' );
        console.log('Plot length:', plot.length);
        console.log('Style:', style || 'default');
        console.log('Aspect:', aspect || '16:9');

        // Build image prompts from the plot
        const imagePrompts = buildImagePrompts(plot, {
            style,
            aspect,
            negative
        });

        console.log('Generated prompts for acts:', imagePrompts.map(p => p.act).join(', '));

        // Generate images using the prompts
        const images = await generateActImages(imagePrompts);

        console.log('Image generation completed');
        console.log('Results:', images.map(img => `Act ${img.act}: ${img.success ? img.provider : 'FAILED'}`).join(', '));

        // Return the generated images
        res.json({
            success: true,
            images,
            generatedAt: new Date().toISOString(),
            totalImages: images.length
        });

    } catch (error) {
        console.error('Error generating images:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate images',
            timestamp: new Date().toISOString()
        });
    }
});

export default router;
