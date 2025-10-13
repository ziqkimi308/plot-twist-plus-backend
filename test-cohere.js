/**
 * Test Cohere API
 */

import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.COHERE_API_KEY;

console.log('🔍 Testing Cohere API...');
console.log(`API Key: ${apiKey ? 'Present' : 'Missing'}`);
console.log(`API Key length: ${apiKey ? apiKey.length : 0}`);

if (!apiKey) {
    console.log('❌ No Cohere API key found');
    console.log('Please get a free API key from: https://dashboard.cohere.ai/');
    console.log('Then add COHERE_API_KEY to your .env file');
    process.exit(1);
}

// Test with a simple prompt
async function testCohere() {
    try {
        console.log('\n🧪 Testing with Cohere...');
        const response = await fetch('https://api.cohere.ai/v1/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'command-r-08-2024',
                message: 'Write a short story about a detective in 3 sentences.',
                max_tokens: 100,
                temperature: 0.7
            })
        });

        console.log(`Status: ${response.status}`);
        console.log(`Status Text: ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Success!');
            console.log('Response:', data.text);
        } else {
            const errorText = await response.text();
            console.log('❌ Error:');
            console.log(errorText);
        }
    } catch (error) {
        console.log('❌ Network error:', error.message);
    }
}

testCohere();
