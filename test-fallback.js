/**
 * Test fallback generator directly
 */

import { generateFallbackPlot, generateFallbackScript } from './utils/fallbackGenerator.js';

console.log('🔍 Testing Fallback Generator...\n');

// Test fallback plot
console.log('📝 Testing Fallback Plot Generation:');
console.log('=' .repeat(50));

const fallbackPlot = generateFallbackPlot(
    "thriller",
    "A detective with a dark past and a serial killer who leaves cryptic clues",
    "A rainy city in the 1980s"
);

console.log(fallbackPlot);
console.log('=' .repeat(50));

console.log('\n🎬 Testing Fallback Script Generation:');
console.log('=' .repeat(50));

const fallbackScript = generateFallbackScript(fallbackPlot);
console.log(fallbackScript);
console.log('=' .repeat(50));
