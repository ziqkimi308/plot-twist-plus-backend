/**
 * Test Groq API
 */

import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GROQ_API_KEY;

console.log('🔍 Testing Groq API...');
console.log(`API Key: ${apiKey ? 'Present' : 'Missing'}`);
console.log(`API Key length: ${apiKey ? apiKey.length : 0}`);

if (!apiKey) {
    console.log('❌ No Groq API key found');
    console.log('Please get a free API key from: https://console.groq.com/');
    console.log('Then add GROQ_API_KEY to your .env file');
    process.exit(1);
}

// Test with a simple prompt
async function testGroq() {
    try {
        console.log('\n🧪 Testing with Groq...');
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'user',
                        content: 'Write a short story about a detective in 3 sentences.'
                    }
                ],
                max_tokens: 100,
                temperature: 0.7
            })
        });

        console.log(`Status: ${response.status}`);
        console.log(`Status Text: ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Success!');
            console.log('Response:', data.choices[0].message.content);
        } else {
            const errorText = await response.text();
            console.log('❌ Error:');
            console.log(errorText);
        }
    } catch (error) {
        console.log('❌ Network error:', error.message);
    }
}

testGroq();
