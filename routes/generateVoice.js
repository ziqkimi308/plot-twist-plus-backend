/**
 * Generate Voice Route
 * Endpoint for generating voice audio from screenplay scripts
 */

import express from 'express';
import { generateScriptVoices } from '../utils/ttsEngine.js';
import { getUsageStats } from '../utils/usageTracker.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Helper to get latest session folder
function getLatestSessionDir(voiceOutputDir) {
	const sessions = fs.readdirSync(voiceOutputDir)
		.filter((d) => fs.statSync(path.join(voiceOutputDir, d)).isDirectory())
		.sort();
	return sessions.length > 0 ? path.join(voiceOutputDir, sessions[sessions.length - 1]) : null;
}

// Clear previous session folders before generating new voices
function clearVoiceSessions(voiceOutputDir) {
	const sessions = fs.readdirSync(voiceOutputDir)
		.filter((d) => fs.statSync(path.join(voiceOutputDir, d)).isDirectory());
	for (const session of sessions) {
		const sessionPath = path.join(voiceOutputDir, session);
		fs.rmSync(sessionPath, { recursive: true, force: true });
	}
}

/**
 * POST /api/generate-voice
 * Generates voice audio files from a screenplay script
 * 
 * Request body:
 * {
 *   "script": "string - Formatted screenplay text",
 *   "includeNarration": boolean (optional) - Include action lines as narration (default: false),
 *   "narratorVoice": "string (optional) - Voice for narrator (default: 'john')",
 *   "voiceMapping": object (optional) - Map character names to voice names
 *     {
 *       "CHARACTER_NAME": "voiceName" // e.g., { "SARAH": "rachel", "MARCUS": "josh" }
 *     }
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "audio": [
 *     {
 *       "character": "string",
 *       "line": "string",
 *       "order": number,
 *       "audioFile": "string - filename",
 *       "audioPath": "string - full path",
 *       "provider": "elevenlabs | google",
 *       "success": boolean
 *     },
 *     ...
 *   ],
 *   "metadata": {
 *     "totalLines": number,
 *     "successfulGenerations": number,
 *     "failedGenerations": number,
 *     "providers": {
 *       "elevenlabs": number,
 *       "google": number
 *     },
 *     "usage": {
 *       "used": number,
 *       "limit": number,
 *       "remaining": number,
 *       "percentUsed": number
 *     },
 *     "generatedAt": "timestamp"
 *   }
 * }
 */
router.post('/', async (req, res) => {
	try {
		const {
			script,
			includeNarration = false,
			narratorVoice = 'john',
			voiceMapping = {}
		} = req.body;

		// Note: script parameter is optional - generateScriptVoices loads from disk
		// Keeping it for backward compatibility but not validating it

		console.log('\n=== Voice Generation Request ===');
		console.log('Include narration:', includeNarration);
		console.log('Narrator voice:', narratorVoice);
		console.log('Voice mapping:', Object.keys(voiceMapping).length, 'characters');

		// Check current usage before generation
		const usageBeforeStats = getUsageStats();
		console.log(`\nCurrent ElevenLabs usage: ${usageBeforeStats.used} / ${usageBeforeStats.limit} chars (${usageBeforeStats.percentUsed}%)`);

		// Clear previous voice data
		const voiceDir = path.join(process.cwd(), 'data', 'voice');
		if (fs.existsSync(voiceDir)) {
			fs.rmSync(voiceDir, { recursive: true, force: true });
		}

		// Generate voice audio (loads script from data/script folder)
		// TEMPORARILY USING GOOGLE TTS TO SAVE API CALLS
		const results = await generateScriptVoices({
			includeNarration,
			narratorVoice,
			voiceMapping,
			provider: 'google'  // Force Google TTS (free, unlimited)
		});

		// Get usage stats after generation
		const usageAfterStats = getUsageStats();

		// Calculate statistics
		const successfulGenerations = results.filter(r => r.success).length;
		const failedGenerations = results.filter(r => !r.success).length;
		const providerCounts = results.reduce((acc, r) => {
			if (r.success && r.provider) {
				acc[r.provider] = (acc[r.provider] || 0) + 1;
			}
			return acc;
		}, {});

		console.log('\nVoice generation completed');
		console.log('Total lines:', results.length);
		console.log('Successful:', successfulGenerations);
		console.log('Failed:', failedGenerations);
		console.log('Providers used:', JSON.stringify(providerCounts));
		console.log(`ElevenLabs usage after: ${usageAfterStats.used} / ${usageAfterStats.limit} chars (${usageAfterStats.percentUsed}%)`);

		// Return the generated audio data
		res.json({
			success: true,
			audio: results,
			metadata: {
				totalLines: results.length,
				successfulGenerations,
				failedGenerations,
				providers: providerCounts,
				usage: {
					used: usageAfterStats.used,
					limit: usageAfterStats.limit,
					remaining: usageAfterStats.remaining,
					percentUsed: usageAfterStats.percentUsed
				},
				generatedAt: new Date().toISOString()
			}
		});

	} catch (error) {
		console.error('Error generating voice:', error);
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to generate voice audio',
			timestamp: new Date().toISOString()
		});
	}
});

/**
 * GET /api/generate-voice/usage
 * Returns current ElevenLabs TTS usage statistics
 */
router.get('/usage', (req, res) => {
	try {
		const stats = getUsageStats();

		res.json({
			success: true,
			usage: stats
		});
	} catch (error) {
		console.error('Error getting usage stats:', error);
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to get usage statistics'
		});
	}
});

/**
 * GET /api/generate-voice/audio/:filename
 * Serves generated audio files
 */
router.get('/audio/:filename', (req, res) => {
	try {
		const { filename } = req.params;

		// Security: prevent directory traversal
		if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
			return res.status(400).json({
				success: false,
				error: 'Invalid filename'
			});
		}

		// Search in data directory
		const voiceOutputDir = path.join(process.cwd(), 'data');
		const latestSession = getLatestSessionDir(voiceOutputDir);
		if (latestSession) {
			const filePath = path.join(latestSession, filename);
			if (fs.existsSync(filePath)) {
				res.type('audio/mpeg');
				return res.sendFile(filePath);
			}
		}

		// File not found
		res.status(404).json({
			success: false,
			error: 'Audio file not found'
		});

	} catch (error) {
		console.error('Error serving audio file:', error);
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to serve audio file'
		});
	}
});

/**
 * GET /api/generate-voice/audio/:actFolder/:filename
 * Serves generated audio files from per-act folders
 */
router.get('/audio/:actFolder/:filename', (req, res) => {
	try {
		const { actFolder, filename } = req.params;
		if (filename.includes('..') || filename.includes('/') || filename.includes('\\') || actFolder.includes('..')) {
			return res.status(400).json({ success: false, error: 'Invalid filename or folder' });
		}
		const voiceDir = path.join(process.cwd(), 'data', 'voice', actFolder);
		const filePath = path.join(voiceDir, filename);
		if (fs.existsSync(filePath)) {
			res.type('audio/mpeg');
			return res.sendFile(filePath);
		}
		res.status(404).json({ success: false, error: 'Audio file not found' });
	} catch (error) {
		console.error('Error serving audio file:', error);
		res.status(500).json({ success: false, error: error.message || 'Failed to serve audio file' });
	}
});

export default router;
