/**
 * Test DeepAI Image Generation
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, 'test-images-direct');

async function testDeepAI() {
    console.log('🎨 TESTING DEEPAI IMAGE GENERATION\n');
    console.log('='.repeat(60) + '\n');

    if (!process.env.DEEPAI_API_KEY) {
        console.log('❌ DEEPAI_API_KEY not found in .env file');
        return;
    }

    const testPrompts = [
        'A cyberpunk detective in neon-lit Tokyo, cinematic, highly detailed, dramatic lighting',
        'A space station orbiting Mars, sci-fi, photorealistic, stunning vista',
        'An ancient wizard casting spells in a mystical forest, fantasy art, magical atmosphere'
    ];

    console.log('API Key found! Testing with 3 different prompts...\n');

    for (let i = 0; i < testPrompts.length; i++) {
        const prompt = testPrompts[i];
        console.log(`Test ${i + 1}/3:`);
        console.log(`   Prompt: ${prompt.slice(0, 60)}...`);
        
        try {
            console.log(`   📡 Sending request to DeepAI...`);
            
            const response = await fetch('https://api.deepai.org/api/text2img', {
                method: 'POST',
                headers: {
                    'api-key': process.env.DEEPAI_API_KEY
                },
                body: new URLSearchParams({
                    text: prompt
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.log(`   ❌ Failed: HTTP ${response.status}`);
                console.log(`   Error: ${errorText.slice(0, 200)}`);
                continue;
            }

            const data = await response.json();
            
            if (!data.output_url) {
                console.log(`   ❌ No output_url in response`);
                console.log(`   Response:`, JSON.stringify(data).slice(0, 200));
                continue;
            }

            console.log(`   ✅ Image generated!`);
            console.log(`   🌐 URL: ${data.output_url.slice(0, 80)}...`);
            
            // Download image
            console.log(`   📥 Downloading...`);
            const imgResponse = await fetch(data.output_url);
            const arrayBuffer = await imgResponse.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            const filename = `deepai_test_${i + 1}.jpg`;
            const filepath = path.join(outputDir, filename);
            fs.writeFileSync(filepath, buffer);
            
            const sizeKB = (buffer.length / 1024).toFixed(2);
            console.log(`   💾 Saved: ${filename} (${sizeKB} KB)`);
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        console.log('');
        
        // Delay between requests
        if (i < testPrompts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    console.log('='.repeat(60) + '\n');
    console.log('✨ DeepAI test completed!\n');
    
    // Show all images
    const files = fs.readdirSync(outputDir).filter(f => f.includes('deepai'));
    if (files.length > 0) {
        console.log(`📸 DeepAI Images (${files.length}):`);
        files.forEach(file => {
            const stats = fs.statSync(path.join(outputDir, file));
            const sizeKB = (stats.size / 1024).toFixed(2);
            console.log(`   ✅ ${file} - ${sizeKB} KB`);
        });
    }

    console.log(`\n📁 Folder: ${outputDir}\n`);
}

testDeepAI();
