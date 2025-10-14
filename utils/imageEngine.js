/**
 * PlotTwist+ Image Generation Engine
 * Generates images for plot acts using free AI APIs with automatic fallback
 */

import fetch from 'node-fetch';
import { getAPIConfig } from './config.js';

/**
 * Generates images for plot acts with automatic API fallback
 * Tries multiple APIs: Pollinations.ai -> Hugging Face -> Placeholder fallback
 * @param {Array} imagePrompts - Array of prompt objects from buildImagePrompts
 *   Each object: { act, prompt, aspect, negative }
 * @param {Object} customConfig - Optional custom configuration
 * @returns {Promise<Array>} Array of image results with URLs and metadata
 */
async function generateActImages(imagePrompts, customConfig = {}) {
    if (!imagePrompts || !Array.isArray(imagePrompts)) {
        throw new Error('imagePrompts must be an array');
    }

    if (imagePrompts.length === 0) {
        throw new Error('imagePrompts array cannot be empty');
    }

    // Get config for API keys
    const defaultConfig = getAPIConfig();
    const config = { ...defaultConfig, ...customConfig };
    const { huggingfaceApiKey } = config;

    const results = [];

    for (const promptData of imagePrompts) {
        const { act, prompt, aspect = '16:9', negative = '' } = promptData;
        const dimensions = getAspectDimensions(aspect);
        
        let imageResult = null;

        // Try Pollinations.ai first (no API key needed, most reliable)
        try {
            console.log(`Act ${act}: Trying Pollinations.ai...`);
            imageResult = await generateWithPollinations(prompt, dimensions);
            if (imageResult) {
                console.log(`Act ${act}: Successfully generated with Pollinations.ai`);
                results.push({
                    act,
                    success: true,
                    imageUrl: imageResult,
                    prompt,
                    width: dimensions.width,
                    height: dimensions.height,
                    aspect,
                    provider: 'pollinations.ai'
                });
                await sleep(500);
                continue;
            }
        } catch (error) {
            console.log(`Act ${act}: Pollinations.ai failed - ${error.message}`);
        }

        // Try Hugging Face if API key is available
        if (huggingfaceApiKey && !imageResult) {
            try {
                console.log(`Act ${act}: Trying Hugging Face...`);
                imageResult = await generateWithHuggingFace(prompt, huggingfaceApiKey, dimensions);
                if (imageResult) {
                    console.log(`Act ${act}: Successfully generated with Hugging Face`);
                    results.push({
                        act,
                        success: true,
                        imageUrl: imageResult,
                        prompt,
                        width: dimensions.width,
                        height: dimensions.height,
                        aspect,
                        provider: 'huggingface'
                    });
                    await sleep(2000); // Longer delay for rate limiting
                    continue;
                }
            } catch (error) {
                console.log(`Act ${act}: Hugging Face failed - ${error.message}`);
            }
        }

        // Fallback: Use placeholder image service
        if (!imageResult) {
            console.log(`Act ${act}: All APIs failed, using fallback placeholder`);
            imageResult = generateFallbackImage(prompt, dimensions);
            results.push({
                act,
                success: true,
                imageUrl: imageResult,
                prompt,
                width: dimensions.width,
                height: dimensions.height,
                aspect,
                provider: 'fallback',
                isFallback: true
            });
        }
    }

    return results;
}

/**
 * Generate image using Pollinations.ai (free, no API key)
 * @param {string} prompt - Image generation prompt
 * @param {Object} dimensions - Width and height
 * @returns {Promise<string>} Image URL
 */
async function generateWithPollinations(prompt, dimensions) {
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dimensions.width}&height=${dimensions.height}&nologo=true&enhance=true&model=flux`;
    
    // Test the URL with a HEAD request
    const response = await fetch(imageUrl, { method: 'HEAD', timeout: 10000 });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return imageUrl;
}

/**
 * Generate image using Hugging Face Inference API (FLUX.1-schnell)
 * @param {string} prompt - Image generation prompt
 * @param {string} apiKey - Hugging Face API key
 * @param {Object} dimensions - Width and height
 * @returns {Promise<string>} Base64 image data URL
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
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    
    return `data:image/png;base64,${base64}`;
}

/**
 * Generate fallback placeholder image
 * @param {string} prompt - Image prompt (for text overlay)
 * @param {Object} dimensions - Width and height
 * @returns {string} Placeholder image URL
 */
function generateFallbackImage(prompt, dimensions) {
    // Use a reliable placeholder service with text
    const text = encodeURIComponent(`Act Image: ${prompt.slice(0, 50)}...`);
    return `https://placehold.co/${dimensions.width}x${dimensions.height}/1a1a2e/eee?text=${text}`;
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
