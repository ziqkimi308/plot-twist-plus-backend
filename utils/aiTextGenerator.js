/**
 * AI Text Generation Utility
 * Single function that auto-switches between available APIs (Claude, OpenAI, Hugging Face)
 */

import fetch from 'node-fetch';
import { getAPIConfig } from './config.js';

/**
 * Generate text using the best available API
 * Auto-switches between Claude, OpenAI, and Hugging Face
 * @param {string} prompt - The prompt to send
 * @param {Object} customConfig - Optional custom configuration (overrides default)
 * @returns {Promise<string>} The generated text response
 */
export async function generateText(prompt, customConfig = {}) {
    // Get default config and merge with custom config
    const defaultConfig = getAPIConfig();
    const config = { ...defaultConfig, ...customConfig };
    const { claudeApiKey, openaiApiKey, huggingfaceApiKey } = config;

    // Try Claude API first (best quality)
    if (claudeApiKey) {
        try {
            console.log('Using Claude API...');
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': claudeApiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-sonnet-20240229',
                    max_tokens: 2000,
                    messages: [{ role: 'user', content: prompt }]
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.content[0].text;
            }
        } catch (error) {
            console.log('Claude API failed, trying alternatives...');
        }
    }

    // Try OpenAI API second
    if (openaiApiKey) {
        try {
            console.log('Using OpenAI API...');
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiApiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 2000,
                    temperature: 0.7
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.choices[0].message.content;
            }
        } catch (error) {
            console.log('OpenAI API failed, trying alternatives...');
        }
    }

    // Try Hugging Face as fallback (free)
    try {
        console.log('Using Hugging Face API (free)...');
        const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(huggingfaceApiKey && { 'Authorization': `Bearer ${huggingfaceApiKey}` })
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_length: 1000,
                    temperature: 0.7,
                    do_sample: true
                }
            })
        });

        if (response.ok) {
            const data = await response.json();
            return data[0]?.generated_text || data[0]?.text || 'No response generated';
        }
    } catch (error) {
        console.log('Hugging Face API failed...');
    }

    // If all APIs fail
    throw new Error('All text generation APIs failed. Please check your API keys and internet connection.');
}
