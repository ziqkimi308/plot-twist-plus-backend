/**
 * Test Hugging Face Image Generation (FLUX.1-schnell)
 * Proves HF works for IMAGE generation (not text)
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

async function testHuggingFaceImage() {
    console.log('🎨 TESTING HUGGING FACE IMAGE GENERATION\n');
    console.log('Model: FLUX.1-schnell (Fast, High-Quality)\n');
    console.log('='.repeat(60) + '\n');

    if (!process.env.HUGGINGFACE_API_KEY) {
        console.log('❌ HUGGINGFACE_API_KEY not found in .env file\n');
        console.log('📝 To get a FREE Hugging Face API token:');
        console.log('   1. Go to: https://huggingface.co/settings/tokens');
        console.log('   2. Click "New token"');
        console.log('   3. Give it a name (e.g., "plot-twist-images")');
        console.log('   4. Select "Read" access');
        console.log('   5. Copy the token and add to .env file\n');
        console.log('   HUGGINGFACE_API_KEY=hf_your_token_here\n');
        return;
    }

    const testPrompts = [
        'A futuristic cyberpunk city at night with neon lights, cinematic, highly detailed',
        'A serene mountain landscape with a crystal clear lake, photorealistic, stunning',
    ];

    console.log('✅ API Key found! Testing with 2 different prompts...\n');

    for (let i = 0; i < testPrompts.length; i++) {
        const prompt = testPrompts[i];
        console.log(`Test ${i + 1}/${testPrompts.length}:`);
        console.log(`   Prompt: ${prompt.slice(0, 70)}...`);
        
        try {
            console.log(`   📡 Sending request to Hugging Face FLUX.1-schnell...`);
            
            const API_URL = 'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell';
            
            const startTime = Date.now();
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        num_inference_steps: 4,
                        guidance_scale: 0.0,
                        width: 1024,
                        height: 576
                    }
                })
            });

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);

            if (!response.ok) {
                const errorText = await response.text();
                console.log(`   ❌ Failed: HTTP ${response.status}`);
                console.log(`   Error: ${errorText.slice(0, 300)}`);
                
                if (response.status === 503) {
                    console.log(`   ℹ️  Model is loading (cold start), please wait and try again...`);
                } else if (response.status === 429) {
                    console.log(`   ℹ️  Rate limit reached, wait a moment and try again...`);
                } else if (response.status === 401) {
                    console.log(`   ℹ️  Check your API token - it may be invalid`);
                }
                continue;
            }

            console.log(`   ✅ Image generated in ${duration}s!`);
            
            // Get image bytes
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            // Save image
            const filename = `huggingface_test_${i + 1}.png`;
            const filepath = path.join(outputDir, filename);
            fs.writeFileSync(filepath, buffer);
            
            const sizeKB = (buffer.length / 1024).toFixed(2);
            console.log(`   💾 Saved: ${filename} (${sizeKB} KB)`);
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        console.log('');
        
        // Delay between requests to respect rate limits
        if (i < testPrompts.length - 1) {
            console.log('   ⏳ Waiting 3 seconds (rate limit courtesy)...\n');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    console.log('='.repeat(60) + '\n');
    
    // Show all HF images
    const files = fs.readdirSync(outputDir).filter(f => f.includes('huggingface'));
    if (files.length > 0) {
        console.log('✨ Hugging Face Image Generation SUCCESSFUL!\n');
        console.log(`📸 Generated Images (${files.length}):`);
        files.forEach(file => {
            const stats = fs.statSync(path.join(outputDir, file));
            const sizeKB = (stats.size / 1024).toFixed(2);
            console.log(`   ✅ ${file} - ${sizeKB} KB`);
        });
        console.log(`\n📁 Folder: ${outputDir}`);
        console.log('\n🎉 Hugging Face works perfectly for IMAGE generation!');
        console.log('   (This is different from text generation - uses FLUX model)\n');
    } else {
        console.log('❌ No images generated. Please check errors above.\n');
    }
}

testHuggingFaceImage();
