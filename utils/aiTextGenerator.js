/**
 * AI Text Generation Utility
 * Single function that auto-switches between available APIs (Claude, OpenAI, Hugging Face)
 */

import fetch from 'node-fetch';
import { getAPIConfig } from './config.js';
import { generateFallbackPlot, generateFallbackScript } from './fallbackGenerator.js';

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
    const { groqApiKey, cohereApiKey } = config;

    // Try Groq API first (very generous free tier)
    if (groqApiKey) {
        try {
            console.log('Using Groq API...');
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${groqApiKey}`
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 2000,
                    temperature: 0.7
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.choices[0].message.content;
            } else {
                console.log(`Groq API error: ${response.status} ${response.statusText}`);
                const errorData = await response.text();
                console.log('Groq API error details:', errorData);
            }
        } catch (error) {
            console.log('Groq API failed, trying alternatives...');
            console.log('Groq API error details:', error.message);
        }
    }

    // Try Cohere API (free tier available)
    if (cohereApiKey) {
        try {
            console.log('Using Cohere API...');
            const response = await fetch('https://api.cohere.ai/v1/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cohereApiKey}`
                },
                body: JSON.stringify({
                    model: 'command-r-08-2024',
                    message: prompt,
                    max_tokens: 2000,
                    temperature: 0.7
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.text;
            } else {
                console.log(`Cohere API error: ${response.status} ${response.statusText}`);
                const errorData = await response.text();
                console.log('Cohere API error details:', errorData);
            }
        } catch (error) {
            console.log('Cohere API failed, trying alternatives...');
            console.log('Cohere API error details:', error.message);
        }
    }


    // If all APIs fail, use fallback generator
    console.log('Groq and Cohere APIs failed, using fallback generator for testing...');
    
    // Try to detect if this is a plot or script generation based on prompt content
    if (prompt.includes('3-act plot') || prompt.includes('ACT I') || prompt.includes('plot structure')) {
        // Extract genre, characters, and setting from the prompt
        const genreMatch = prompt.match(/GENRE:\s*(.+)/);
        const charactersMatch = prompt.match(/CHARACTERS:\s*(.+)/);
        const settingMatch = prompt.match(/SETTING:\s*(.+)/);
        
        const genre = genreMatch ? genreMatch[1].trim() : 'drama';
        const characters = charactersMatch ? charactersMatch[1].trim() : 'a protagonist';
        const setting = settingMatch ? settingMatch[1].trim() : 'a mysterious location';
        
        return generateFallbackPlot(genre, characters, setting);
    } else {
        // For script generation, use a basic fallback
        return generateFallbackScript(prompt);
    }
}

