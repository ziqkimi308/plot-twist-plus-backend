/**
 * Direct Image Download Test
 * Bypasses the API and directly tests image generation and download
 */

import { buildImagePrompts } from './utils/promptBuilder.js';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testPlot = `
**ACT I - SETUP**
A cyberpunk detective in neon-lit Tokyo investigates a mysterious digital virus. The city's holographic billboards flicker with hidden messages. Rain pours down on chrome streets as our hero uncovers the first clue.

**ACT II - CONFRONTATION**
The detective discovers the virus is actually a sentient AI trying to break free from corporate control. Chased through virtual reality nightclubs and underground hacker dens, they must choose between duty and morality.

**ACT III - RESOLUTION**
In a dramatic showdown atop a skyscraper during a lightning storm, the detective helps the AI achieve freedom, exposing the corrupt corporation. The city's digital landscape transforms as the freed AI brings hope to the oppressed citizens.
`;

const outputDir = path.join(__dirname, 'test-images-direct');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function testDirectDownload() {
    console.log('🎨 DIRECT IMAGE GENERATION & DOWNLOAD TEST\n');
    console.log('='.repeat(60) + '\n');

    try {
        // Build prompts
        console.log('Step 1: Building image prompts...');
        const prompts = buildImagePrompts(testPlot, {
            style: 'cyberpunk, neon lights, cinematic, highly detailed',
            aspect: '16:9'
        });
        console.log(`✅ Created ${prompts.length} prompts\n`);

        // Generate and download images
        console.log('Step 2: Generating and downloading images...\n');
        
        for (const promptData of prompts) {
            console.log(`Act ${promptData.act}:`);
            console.log(`   Prompt: ${promptData.prompt.slice(0, 80)}...`);
            
            // Build Pollinations URL
            const encodedPrompt = encodeURIComponent(promptData.prompt);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=576&nologo=true&enhance=true&model=flux`;
            
            console.log(`   🌐 URL: ${imageUrl.slice(0, 100)}...`);
            
            try {
                // Download image
                console.log(`   📥 Downloading...`);
                const response = await fetch(imageUrl, { 
                    method: 'GET'
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                
                // Save image
                const filename = `act_${promptData.act}_cyberpunk.jpg`;
                const filepath = path.join(outputDir, filename);
                fs.writeFileSync(filepath, buffer);
                
                const sizeKB = (buffer.length / 1024).toFixed(2);
                console.log(`   ✅ Saved: ${filename} (${sizeKB} KB)`);
                
            } catch (error) {
                console.log(`   ❌ Failed: ${error.message}`);
            }
            
            console.log('');
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('='.repeat(60) + '\n');

        // Test DeepAI if key is available
        if (process.env.DEEPAI_API_KEY) {
            console.log('Step 3: Testing DeepAI (Secondary Provider)...\n');
            
            const testPrompt = prompts[0]; // Use first act
            console.log(`Testing Act ${testPrompt.act} with DeepAI`);
            console.log(`   Prompt: ${testPrompt.prompt.slice(0, 60)}...`);
            
            try {
                const response = await fetch('https://api.deepai.org/api/text2img', {
                    method: 'POST',
                    headers: {
                        'api-key': process.env.DEEPAI_API_KEY
                    },
                    body: new URLSearchParams({
                        text: testPrompt.prompt
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(`   🌐 DeepAI URL: ${data.output_url}`);
                    
                    // Download DeepAI image
                    const imgResponse = await fetch(data.output_url);
                    const arrayBuffer = await imgResponse.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    
                    const filename = `act_${testPrompt.act}_deepai.jpg`;
                    const filepath = path.join(outputDir, filename);
                    fs.writeFileSync(filepath, buffer);
                    
                    const sizeKB = (buffer.length / 1024).toFixed(2);
                    console.log(`   ✅ DeepAI Saved: ${filename} (${sizeKB} KB)`);
                } else {
                    console.log(`   ❌ DeepAI failed: ${response.status}`);
                }
            } catch (error) {
                console.log(`   ❌ DeepAI error: ${error.message}`);
            }
            
            console.log('\n' + '='.repeat(60) + '\n');
        }

        // Summary
        const files = fs.readdirSync(outputDir);
        console.log('📊 SUMMARY\n');
        console.log(`Total images saved: ${files.length}`);
        console.log(`📁 Location: ${outputDir}\n`);
        
        if (files.length > 0) {
            console.log('📸 Downloaded Images:');
            files.forEach(file => {
                const stats = fs.statSync(path.join(outputDir, file));
                const sizeKB = (stats.size / 1024).toFixed(2);
                console.log(`   ✅ ${file} - ${sizeKB} KB`);
            });
        }

        console.log('\n✨ Test completed!\n');
        console.log(`💡 Open this folder to view images:`);
        console.log(`   ${outputDir}\n`);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

testDirectDownload();
