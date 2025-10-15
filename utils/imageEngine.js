/**
 * PlotTwist+ Image Generation Engine
 * Generates images for plot acts using free AI APIs with automatic fallback
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAPIConfig } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base directory for storing images
const IMAGE_BASE_DIR = path.join(__dirname, '..', 'data', 'pictures');

/**
 * Generates images for plot acts with automatic API fallback
 * Saves images to data/pictures/picture-act-{one|two|three}/
 * Tries multiple APIs: Pollinations.ai -> Hugging Face -> Placeholder fallback
 * @param {Array} imagePrompts - Array of prompt objects from buildImagePrompts
 *   Each object: { act, prompt, aspect, negative }
 * @param {Object} customConfig - Optional custom configuration
 * @returns {Promise<Array>} Array of image results with local file paths
 */
async function generateActImages(imagePrompts, customConfig = {}) {
	if (!imagePrompts || !Array.isArray(imagePrompts)) {
		throw new Error('imagePrompts must be an array');
	}

	if (imagePrompts.length === 0) {
		throw new Error('imagePrompts array cannot be empty');
	}

	// Ensure base directory exists
	if (!fs.existsSync(IMAGE_BASE_DIR)) {
		fs.mkdirSync(IMAGE_BASE_DIR, { recursive: true });
	}

	// Get config for API keys
	const defaultConfig = getAPIConfig();
	const config = { ...defaultConfig, ...customConfig };
	const { huggingfaceApiKey } = config;

	// Generate all images in PARALLEL for speed
	console.log(`Generating ${imagePrompts.length} images in parallel...`);
	const imagePromises = imagePrompts.map(promptData =>
		generateSingleImage(promptData, huggingfaceApiKey)
	);

	const results = await Promise.all(imagePromises);
	console.log(`All ${results.length} images generated!`);

	return results;
}

/**
 * Generate a single image (extracted for parallel processing)
 */
async function generateSingleImage(promptData, huggingfaceApiKey) {
	const { act, prompt, aspect = '16:9', negative = '' } = promptData;
	const dimensions = getAspectDimensions(aspect);

	// Determine folder based on act
	const actFolderMap = {
		'I': 'picture-act-one',
		'II': 'picture-act-two',
		'III': 'picture-act-three'
	};
	const actFolder = actFolderMap[act] || 'picture-act-one';
	const actPath = path.join(IMAGE_BASE_DIR, actFolder);

	// Create act folder if it doesn't exist
	if (!fs.existsSync(actPath)) {
		fs.mkdirSync(actPath, { recursive: true });
	}

	// Generate filename with timestamp to avoid conflicts
	const timestamp = Date.now();
	const filename = `${act}_${timestamp}.png`;
	const filepath = path.join(actPath, filename);

	let imageResult = null;
	let imageBuffer = null;

	// Try Pollinations.ai first (no API key needed, most reliable)
	try {
		console.log(`Act ${act}: Trying Pollinations.ai...`);
		imageBuffer = await generateWithPollinations(prompt, dimensions);
		if (imageBuffer && imageBuffer.length > 1024) {
			console.log(`Act ${act}: ✅ Successfully generated with Pollinations.ai`);
			imageResult = {
				provider: 'pollinations.ai',
				buffer: imageBuffer
			};
		}
	} catch (error) {
		console.log(`Act ${act}: ❌ Pollinations.ai failed - ${error.message}`);
	}

	// Try Hugging Face if API key is available
	if (huggingfaceApiKey && !imageResult) {
		try {
			console.log(`Act ${act}: Trying Hugging Face...`);
			imageBuffer = await generateWithHuggingFace(prompt, huggingfaceApiKey, dimensions);
			if (imageBuffer && imageBuffer.length > 1024) {
				console.log(`Act ${act}: ✅ Successfully generated with Hugging Face`);
				imageResult = {
					provider: 'huggingface',
					buffer: imageBuffer
				};
			}
		} catch (error) {
			console.log(`Act ${act}: ❌ Hugging Face failed - ${error.message}`);
		}
	}

	// Fallback: Use placeholder image service or if buffer too small/invalid
	if (!imageResult || !imageResult.buffer || imageResult.buffer.length <= 1024) {
		console.log(`Act ${act}: ⚠️  All APIs failed, using fallback placeholder`);
		imageBuffer = await generateFallbackImage(prompt, dimensions);
		imageResult = {
			provider: 'fallback',
			buffer: imageBuffer,
			isFallback: true
		};
	}

	// Save image to disk (validate buffer before writing)
	try {
		if (!imageResult.buffer || imageResult.buffer.length === 0) {
			throw new Error('Empty image buffer');
		}
		fs.writeFileSync(filepath, imageResult.buffer);
		console.log(`Act ${act}: 💾 Saved to ${filepath}`);

		// Return result with backend URL (not relative path)
		const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
		return {
			act,
			success: true,
			imageUrl: `${backendUrl}/api/images/${actFolder}/${filename}`,
			localPath: filepath,
			prompt,
			width: dimensions.width,
			height: dimensions.height,
			aspect,
			provider: imageResult.provider,
			isFallback: imageResult.isFallback || false
		};
	} catch (error) {
		console.error(`Act ${act}: ❌ Failed to save image - ${error.message}`);
		return {
			act,
			success: false,
			error: error.message,
			prompt
		};
	}
}

/**
 * Generate image using Pollinations.ai (free, no API key)
 * @param {string} prompt - Image generation prompt
 * @param {Object} dimensions - Width and height
 * @returns {Promise<Buffer>} Image buffer
 */
async function generateWithPollinations(prompt, dimensions) {
	const encodedPrompt = encodeURIComponent(prompt);
	const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dimensions.width}&height=${dimensions.height}&nologo=true&enhance=true&model=flux`;

	// Fetch the image - increased timeout for complex prompts
	const response = await fetch(imageUrl, { timeout: 45000 }); // Increased from 15000 to 45000 (45 seconds)

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}: ${response.statusText}`);
	}

	// Return image as buffer
	const arrayBuffer = await response.arrayBuffer();
	return Buffer.from(arrayBuffer);
}

/**
 * Generate image using Hugging Face Inference API (FLUX.1-schnell)
 * @param {string} prompt - Image generation prompt
 * @param {string} apiKey - Hugging Face API key
 * @param {Object} dimensions - Width and height
 * @returns {Promise<Buffer>} Image buffer
 */
async function generateWithHuggingFace(prompt, apiKey, dimensions) {
	const API_URL = 'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell';

	const response = await fetch(API_URL, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			inputs: prompt,
			parameters: {
				num_inference_steps: 4, // Schnell is optimized for 4 steps
				guidance_scale: 0.0,    // Schnell doesn't use guidance
				width: dimensions.width,
				height: dimensions.height
			}
		}),
		timeout: 60000 // Longer timeout for HF
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`HTTP ${response.status}: ${errorText.slice(0, 200)}`);
	}

	// HuggingFace returns raw image bytes
	const arrayBuffer = await response.arrayBuffer();
	return Buffer.from(arrayBuffer);
}

/**
 * Generate fallback placeholder image
 * @param {string} prompt - Image prompt (for text overlay)
 * @param {Object} dimensions - Width and height
 * @returns {Promise<Buffer>} Placeholder image buffer
 */
async function generateFallbackImage(prompt, dimensions) {
	// Use a reliable placeholder service with text
	const text = encodeURIComponent(`Act Image: ${prompt.slice(0, 50)}...`);
	const placeholderUrl = `https://placehold.co/${dimensions.width}x${dimensions.height}/1a1a2e/eee?text=${text}`;

	try {
		const response = await fetch(placeholderUrl, { timeout: 10000 });
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}
		const arrayBuffer = await response.arrayBuffer();
		return Buffer.from(arrayBuffer);
	} catch (error) {
		// If placeholder fails, create a simple colored buffer
		// For now, throw error - in production, could generate a simple PNG
		throw new Error(`Fallback image generation failed: ${error.message}`);
	}
}

/**
 * Converts aspect ratio to pixel dimensions
 * @param {string} aspect - Aspect ratio (e.g., "16:9", "1:1", "4:3")
 * @returns {Object} Width and height in pixels
 */
function getAspectDimensions(aspect) {
	const aspectMap = {
		'16:9': { width: 1024, height: 576 },
		'9:16': { width: 576, height: 1024 },
		'1:1': { width: 768, height: 768 },
		'4:3': { width: 1024, height: 768 },
		'3:4': { width: 768, height: 1024 },
		'21:9': { width: 1344, height: 576 }
	};

	return aspectMap[aspect] || aspectMap['16:9'];
}

/**
 * Sleep utility for rate limiting
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Downloads image as base64 (optional, for saving locally)
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<string>} Base64 encoded image
 */
async function downloadImageAsBase64(imageUrl) {
	try {
		const response = await fetch(imageUrl);
		if (!response.ok) {
			throw new Error(`Failed to download image: ${response.status}`);
		}
		const buffer = await response.buffer();
		return buffer.toString('base64');
	} catch (error) {
		console.error('Error downloading image:', error.message);
		throw error;
	}
}

export { generateActImages, downloadImageAsBase64, getAspectDimensions };
