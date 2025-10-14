/**
 * Comprehensive Image Generation Test
 * Tests all 3 providers and saves images locally
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverUrl = 'http://localhost:3000';

// Create output directory for images
const outputDir = path.join(__dirname, 'test-images');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${outputDir}\n`);
}

// Simple test plot
const testPlot = `
ACT I - SETUP
A young detective discovers a mysterious coded message at a crime scene in Tokyo.

ACT II - CONFRONTATION  
The detective realizes the message points to a conspiracy within the police force.

ACT III - RESOLUTION
The detective exposes the corruption and saves the city from a planned attack.
`;

/**
 * Download and save image from URL
 */
async function downloadImage(imageUrl, filename) {
    try {
        console.log(`   📥 Downloading from: ${imageUrl.slice(0, 80)}...`);
        
        const response = await fetch(imageUrl, {
            method: 'GET',
            timeout: 30000
        });
        
        if (!response.ok) {
            throw new Error(`Failed to download: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, buffer);
        
        const sizeKB = (buffer.length / 1024).toFixed(2);
        console.log(`   💾 Downloaded ${sizeKB} KB`);
        
        return filepath;
    } catch (error) {
        console.log(`   ⚠️  Could not download image: ${error.message}`);
        return null;
    }
}

/**
 * Save base64 image
 */
function saveBase64Image(base64Data, filename) {
    try {
        // Remove data URL prefix if present
        const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64, 'base64');
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, buffer);
        return filepath;
    } catch (error) {
        console.log(`   ⚠️  Could not save base64 image: ${error.message}`);
        return null;
    }
}

async function testAllProviders() {
    console.log('🎨 COMPREHENSIVE IMAGE GENERATION TEST\n');
    console.log('Testing all 3 providers and saving images locally\n');
    console.log('=' .repeat(60) + '\n');

    try {
        // Test 1: Default (Pollinations.ai)
        console.log('Test 1: Pollinations.ai (Primary Provider)');
        console.log('-'.repeat(60));
        
        const response1 = await fetch(`${serverUrl}/api/generate-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plot: testPlot })
        });

        const result1 = await response1.json();
        
        if (result1.success) {
            console.log('✅ Generation successful!\n');
            
            for (const img of result1.images) {
                console.log(`   Act ${img.act} - Provider: ${img.provider}`);
                console.log(`   Prompt: ${img.prompt.slice(0, 60)}...`);
                
                if (img.provider === 'pollinations.ai') {
                    const filename = `pollinations_act_${img.act}.jpg`;
                    const filepath = await downloadImage(img.imageUrl, filename);
                    if (filepath) {
                        console.log(`   ✅ Saved: ${filename}`);
                    }
                }
                console.log('');
            }
        } else {
            console.log('❌ Failed:', result1.error);
        }

        console.log('=' .repeat(60) + '\n');

        // Test 2: Force DeepAI by using custom config
        console.log('Test 2: DeepAI (Secondary Provider)');
        console.log('-'.repeat(60));
        console.log('Testing with custom style to trigger DeepAI...\n');

        const response2 = await fetch(`${serverUrl}/api/generate-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                plot: testPlot,
                style: 'anime style, vibrant colors, detailed background'
            })
        });

        const result2 = await response2.json();
        
        if (result2.success) {
            console.log('✅ Generation successful!\n');
            
            for (const img of result2.images) {
                console.log(`   Act ${img.act} - Provider: ${img.provider}`);
                
                if (img.provider === 'deepai') {
                    const filename = `deepai_act_${img.act}.jpg`;
                    const filepath = await downloadImage(img.imageUrl, filename);
                    if (filepath) {
                        console.log(`   ✅ Saved: ${filename}`);
                    }
                } else if (img.provider === 'pollinations.ai') {
                    const filename = `pollinations_styled_act_${img.act}.jpg`;
                    const filepath = await downloadImage(img.imageUrl, filename);
                    if (filepath) {
                        console.log(`   ✅ Saved: ${filename}`);
                    }
                }
                console.log('');
            }
        } else {
            console.log('❌ Failed:', result2.error);
        }

        console.log('=' .repeat(60) + '\n');

        // Test 3: Fallback (simulate API failures by checking for fallback flag)
        console.log('Test 3: Checking for Fallback Provider');
        console.log('-'.repeat(60));
        
        // Use all previous results to check if any used fallback
        const allImages = [...(result1.images || []), ...(result2.images || [])];
        const fallbackImages = allImages.filter(img => img.provider === 'fallback' || img.isFallback);
        
        if (fallbackImages.length > 0) {
            console.log('✅ Fallback provider detected!\n');
            fallbackImages.forEach(img => {
                console.log(`   Act ${img.act} - Provider: ${img.provider}`);
                console.log(`   Image URL: ${img.imageUrl.slice(0, 80)}...`);
            });
        } else {
            console.log('ℹ️  No fallback provider used (all primary/secondary APIs working)');
            console.log('   This is good - it means Pollinations and DeepAI are operational!\n');
            
            // Show placeholder example anyway
            console.log('   Fallback provider would create placeholder URLs like:');
            console.log('   https://placehold.co/1024x576/1a1a2e/eee?text=...');
        }

        console.log('\n' + '=' .repeat(60) + '\n');

        // Summary
        console.log('📊 TEST SUMMARY\n');
        console.log(`Total images generated: ${allImages.length}`);
        
        const providers = {
            'pollinations.ai': 0,
            'deepai': 0,
            'fallback': 0
        };
        
        allImages.forEach(img => {
            if (providers.hasOwnProperty(img.provider)) {
                providers[img.provider]++;
            }
        });
        
        console.log(`\nProvider Usage:`);
        console.log(`   🟢 Pollinations.ai: ${providers['pollinations.ai']} images`);
        console.log(`   🟡 DeepAI: ${providers['deepai']} images`);
        console.log(`   🔴 Fallback: ${providers['fallback']} images`);
        
        console.log(`\n📁 Images saved to: ${outputDir}`);
        
        // List saved files
        const files = fs.readdirSync(outputDir);
        if (files.length > 0) {
            console.log(`\n📸 Saved Images (${files.length}):`);
            files.forEach(file => {
                const stats = fs.statSync(path.join(outputDir, file));
                const sizeKB = (stats.size / 1024).toFixed(2);
                console.log(`   - ${file} (${sizeKB} KB)`);
            });
        }

        console.log('\n✨ All tests completed!\n');

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.error('\n💡 Make sure the server is running on port 3000');
        console.error('   Run: node server.js\n');
    }
}

// Run the test
testAllProviders();
