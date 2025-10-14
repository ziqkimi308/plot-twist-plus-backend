/**
 * Debug Fish Audio API
 */

import dotenv from 'dotenv';
import { getAPIConfig } from './utils/config.js';
import fetch from 'node-fetch';

dotenv.config();

async function testFishAudioDirect() {
    console.log('🐟 FISH AUDIO DEBUG TEST\n');
    console.log('='.repeat(70));
    
    // Check API key
    const config = getAPIConfig();
    const apiKey = config.fishaudioApiKey;
    
    console.log('\n1. Checking API Key:');
    if (apiKey) {
        console.log(`   ✅ API key found: ${apiKey.substring(0, 10)}...`);
    } else {
        console.log('   ❌ API key NOT found in .env');
        console.log('   Make sure you have: FISHAUDIO_API_KEY=your_key\n');
        return;
    }
    
    console.log('\n2. Testing Fish Audio API directly...\n');
    
    const text = "Hello from Fish Audio. This is a test.";
    const url = 'https://api.fish.audio/v1/tts';
    
    try {
        console.log(`   URL: ${url}`);
        console.log(`   Text: "${text}"`);
        console.log(`   Sending request...\n`);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                format: 'mp3'
            })
        });
        
        console.log(`   Response status: ${response.status}`);
        console.log(`   Response headers:`, response.headers.raw());
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log(`\n   ❌ API Error: ${errorText}`);
        } else {
            const arrayBuffer = await response.arrayBuffer();
            console.log(`\n   ✅ Success! Got ${arrayBuffer.byteLength} bytes of audio data`);
        }
        
    } catch (error) {
        console.log(`\n   ❌ Error: ${error.message}`);
        console.log(`   Stack: ${error.stack}`);
    }
    
    console.log('\n' + '='.repeat(70));
}

testFishAudioDirect().catch(console.error);
