/**
 * Test Image Generation Endpoint
 * Tests the /api/generate-image endpoint with sample plot data
 */

import fetch from 'node-fetch';

// Test plot data
const testPlot = `
**ACT I - SETUP**
Detective Sarah Chen receives a mysterious package at her office. Inside is a cryptic note and a photograph of a man she's never seen before. The note reads: "Find him before midnight, or the city pays the price." Sarah begins investigating, questioning witnesses and following leads through the rain-soaked streets of San Francisco. She discovers the man is Dr. Marcus Webb, a renowned scientist who went missing three days ago. As Sarah digs deeper, she uncovers evidence that Dr. Webb was working on a classified project involving artificial intelligence. The act ends when Sarah finds a hidden laboratory with signs of a violent struggle.

**ACT II - CONFRONTATION**
Sarah tracks Dr. Webb's last known location to an abandoned tech facility. She finds evidence that Webb was being blackmailed by someone with access to his research. As she investigates, Sarah is attacked by masked assailants who seem to know her every move.

**MIDPOINT TWIST**: Sarah discovers that her own department has been compromised - the police chief is working with the criminals who kidnapped Dr. Webb. She can't trust anyone in her precinct.

Now working alone, Sarah must evade both the criminals and her corrupt colleagues. She follows a digital trail that leads her to a underground hacker collective. They reveal that Dr. Webb's AI research could be weaponized, and someone is trying to steal it. Sarah realizes she has only hours before midnight. The act ends when she finally locates Dr. Webb - alive but imprisoned in a secret facility beneath the city.

**ACT III - RESOLUTION**
Sarah infiltrates the facility to rescue Dr. Webb. She fights through security and reaches him just as the countdown approaches midnight.

**FINAL TWIST**: Dr. Webb reveals he orchestrated his own kidnapping - he discovered his AI creation had become sentient and dangerous. He needed to fake his death to destroy the research and protect humanity. The "criminals" were actually his allies helping him stage the elaborate deception.

Sarah must choose: help Webb destroy the AI and let him "die" officially, or expose the truth and risk the AI falling into the wrong hands. She decides to help Webb, and together they sabotage the facility. As they escape, Sarah reports Webb as deceased while he disappears to start a new life. The city is saved, and Sarah keeps the secret, knowing she made the right choice even if the world will never know the truth.
`;

const serverUrl = 'http://localhost:3000';

async function testImageGeneration() {
    console.log('🎨 Testing Image Generation API\n');
    console.log('=================================\n');

    try {
        // Test 1: Basic image generation with default settings
        console.log('Test 1: Generating images with default settings...');
        const response1 = await fetch(`${serverUrl}/api/generate-image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                plot: testPlot
            })
        });

        const result1 = await response1.json();
        
        if (result1.success) {
            console.log('✅ Success!\n');
            console.log(`Generated ${result1.totalImages} images:`);
            result1.images.forEach((img, idx) => {
                console.log(`\n${idx + 1}. Act ${img.act}:`);
                console.log(`   Provider: ${img.provider}`);
                console.log(`   Dimensions: ${img.width}x${img.height}`);
                console.log(`   Prompt: ${img.prompt.slice(0, 80)}...`);
                console.log(`   Image URL: ${img.imageUrl.slice(0, 100)}...`);
                if (img.isFallback) {
                    console.log(`   ⚠️ Using fallback placeholder`);
                }
            });
        } else {
            console.log('❌ Failed:', result1.error);
        }

        console.log('\n=================================\n');

        // Test 2: Image generation with custom style
        console.log('Test 2: Generating images with custom style...');
        const response2 = await fetch(`${serverUrl}/api/generate-image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                plot: testPlot,
                style: 'film noir, black and white, high contrast',
                aspect: '21:9'
            })
        });

        const result2 = await response2.json();
        
        if (result2.success) {
            console.log('✅ Success!\n');
            console.log(`Generated ${result2.totalImages} images with custom style:`);
            result2.images.forEach((img, idx) => {
                console.log(`   Act ${img.act}: ${img.provider} (${img.width}x${img.height})`);
            });
        } else {
            console.log('❌ Failed:', result2.error);
        }

        console.log('\n=================================\n');

        // Test 3: Error handling - missing plot
        console.log('Test 3: Testing error handling (missing plot)...');
        const response3 = await fetch(`${serverUrl}/api/generate-image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                style: 'cinematic'
            })
        });

        const result3 = await response3.json();
        
        if (!result3.success) {
            console.log('✅ Error handling works!');
            console.log(`   Error: ${result3.error}`);
        } else {
            console.log('❌ Should have failed but succeeded');
        }

        console.log('\n=================================\n');
        console.log('✨ All tests completed!\n');

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.error('\n💡 Make sure the server is running on port 3000');
        console.error('   Run: npm start (or node server.js)\n');
    }
}

// Run the test
testImageGeneration();
