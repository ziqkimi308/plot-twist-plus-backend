/**
 * Generate Plot Route
 * Endpoint for generating 3-act plot twists from user prompts
 */

import express from 'express';
import { generatePlotTwist } from '../utils/plotGenerator.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

/**
 * POST /api/generate-plot
 * Generates a 3-act plot with plot twists based on user input
 * 
 * Request body:
 * {
 *   "genre": "string - Movie genre (e.g., thriller, horror, sci-fi)",
 *   "characters": "string - Main characters description",
 *   "setting": "string - Story setting/location"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "plot": "string - Full 3-act plot with twists",
 *   "acts": {
 *     "actI": "string - Act I content",
 *     "actII": "string - Act II content",
 *     "actIII": "string - Act III content"
 *   },
 *   "metadata": {
 *     "genre": "string",
 *     "theme": "string",
 *     "provider": "groq | cohere | huggingface",
 *     "generatedAt": "timestamp"
 *   }
 * }
 */
router.post('/', async (req, res) => {
    try {
        const { genre, characters, setting } = req.body;

        // Validate required fields
        if (!genre || typeof genre !== 'string' || genre.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Genre is required and must be a non-empty string'
            });
        }

        if (!characters || typeof characters !== 'string' || characters.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Characters is required and must be a non-empty string'
            });
        }

        if (!setting || typeof setting !== 'string' || setting.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Setting is required and must be a non-empty string'
            });
        }

        console.log('\n=== Plot Generation Request ===');
        console.log('Genre:', genre);
        console.log('Characters:', characters);
        console.log('Setting:', setting);

        // Generate the plot
        const result = await generatePlotTwist({
            genre: genre.trim(),
            characters: characters.trim(),
            setting: setting.trim()
        });

        console.log('Plot generation completed');
        console.log('Provider:', result.provider);
        console.log('Plot length:', result.plot.length, 'characters');

        // Save plot to data/plot folder with separate act files
        const plotDir = path.join(process.cwd(), 'data', 'plot');
        if (!fs.existsSync(plotDir)) {
            fs.mkdirSync(plotDir, { recursive: true });
        }
        
        // Save individual act files
        fs.writeFileSync(path.join(plotDir, 'plot-act-one.txt'), result.acts.actI || '');
        fs.writeFileSync(path.join(plotDir, 'plot-act-two.txt'), result.acts.actII || '');
        fs.writeFileSync(path.join(plotDir, 'plot-act-three.txt'), result.acts.actIII || '');
        
        // Also save complete plot
        fs.writeFileSync(path.join(plotDir, 'plot-complete.txt'), result.plot);
        console.log('Plot saved to:', plotDir);

        // Return the generated plot
        res.json({
            success: true,
            plot: result.plot,
            acts: result.acts,
            metadata: {
                genre: genre.trim(),
                characters: characters.trim(),
                setting: setting.trim(),
                provider: result.provider,
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error generating plot:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate plot',
            timestamp: new Date().toISOString()
        });
    }
});

export default router;
