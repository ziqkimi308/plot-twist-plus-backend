/**
 * TTS Usage Tracker
 * Tracks character usage for ElevenLabs to avoid exceeding free tier
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USAGE_FILE = path.join(__dirname, '../data/tts-usage.json');
const ELEVENLABS_FREE_LIMIT = 10000; // characters per month

/**
 * Initialize usage tracking file
 */
function initUsageFile() {
    const dir = path.dirname(USAGE_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    if (!fs.existsSync(USAGE_FILE)) {
        const initialData = {
            elevenlabs: {
                currentMonth: getCurrentMonth(),
                charactersUsed: 0,
                requests: [],
                limit: ELEVENLABS_FREE_LIMIT
            }
        };
        fs.writeFileSync(USAGE_FILE, JSON.stringify(initialData, null, 2));
    }
}

/**
 * Get current month string (YYYY-MM)
 */
function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Load usage data
 */
function loadUsage() {
    initUsageFile();
    const data = fs.readFileSync(USAGE_FILE, 'utf8');
    return JSON.parse(data);
}

/**
 * Save usage data
 */
function saveUsage(data) {
    fs.writeFileSync(USAGE_FILE, JSON.stringify(data, null, 2));
}

/**
 * Reset monthly usage if new month
 */
function checkAndResetMonth(usage) {
    const currentMonth = getCurrentMonth();
    
    if (usage.elevenlabs.currentMonth !== currentMonth) {
        console.log(`\n🔄 New month detected! Resetting ElevenLabs usage counter.`);
        console.log(`   Previous month (${usage.elevenlabs.currentMonth}): ${usage.elevenlabs.charactersUsed} chars used`);
        
        usage.elevenlabs = {
            currentMonth,
            charactersUsed: 0,
            requests: [],
            limit: ELEVENLABS_FREE_LIMIT
        };
        saveUsage(usage);
    }
    
    return usage;
}

/**
 * Track ElevenLabs usage
 * @param {number} characters - Number of characters used
 * @param {string} text - The text converted (for logging)
 */
export function trackElevenLabsUsage(characters, text = '') {
    let usage = loadUsage();
    usage = checkAndResetMonth(usage);
    
    usage.elevenlabs.charactersUsed += characters;
    usage.elevenlabs.requests.push({
        timestamp: new Date().toISOString(),
        characters,
        textPreview: text.slice(0, 50)
    });
    
    // Keep only last 100 requests to avoid file bloat
    if (usage.elevenlabs.requests.length > 100) {
        usage.elevenlabs.requests = usage.elevenlabs.requests.slice(-100);
    }
    
    saveUsage(usage);
    
    // Log warning if approaching limit
    const remaining = usage.elevenlabs.limit - usage.elevenlabs.charactersUsed;
    const percentUsed = (usage.elevenlabs.charactersUsed / usage.elevenlabs.limit * 100).toFixed(1);
    
    if (percentUsed >= 90) {
        console.log(`\n⚠️  WARNING: ElevenLabs quota at ${percentUsed}%! Only ${remaining} chars left.`);
        console.log(`   Fallback to Google TTS will activate when quota exhausted.\n`);
    } else if (percentUsed >= 75) {
        console.log(`\n⚠️  ElevenLabs quota at ${percentUsed}%. ${remaining} chars remaining.\n`);
    }
}

/**
 * Get current usage statistics
 */
export function getUsageStats() {
    let usage = loadUsage();
    usage = checkAndResetMonth(usage);
    
    const { charactersUsed, limit, currentMonth } = usage.elevenlabs;
    const remaining = limit - charactersUsed;
    const percentUsed = (charactersUsed / limit * 100).toFixed(1);
    const estimatedMinutes = Math.floor(remaining / 600); // ~600 chars per minute of audio
    
    return {
        month: currentMonth,
        used: charactersUsed,
        limit,
        remaining,
        percentUsed: parseFloat(percentUsed),
        estimatedMinutesLeft: estimatedMinutes,
        willFallback: charactersUsed >= limit
    };
}

/**
 * Check if ElevenLabs quota is available
 * @param {number} characters - Number of characters to check
 * @returns {boolean} True if within quota
 */
export function hasQuotaAvailable(characters = 0) {
    let usage = loadUsage();
    usage = checkAndResetMonth(usage);
    
    const { charactersUsed, limit } = usage.elevenlabs;
    return (charactersUsed + characters) <= limit;
}

/**
 * Display usage summary
 */
export function displayUsageSummary() {
    const stats = getUsageStats();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 ELEVENLABS TTS USAGE SUMMARY');
    console.log('='.repeat(60));
    console.log(`\n📅 Month: ${stats.month}`);
    console.log(`\n📈 Usage:`);
    console.log(`   Used:      ${stats.used.toLocaleString()} / ${stats.limit.toLocaleString()} chars`);
    console.log(`   Remaining: ${stats.remaining.toLocaleString()} chars`);
    console.log(`   Percentage: ${stats.percentUsed}%`);
    console.log(`\n🎙️  Estimated remaining audio: ~${stats.estimatedMinutesLeft} minutes`);
    
    // Progress bar
    const barLength = 40;
    const filled = Math.round((stats.percentUsed / 100) * barLength);
    const empty = barLength - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    
    let color = '🟢';
    if (stats.percentUsed >= 90) color = '🔴';
    else if (stats.percentUsed >= 75) color = '🟡';
    
    console.log(`\n${color} [${bar}] ${stats.percentUsed}%`);
    
    if (stats.percentUsed >= 90) {
        console.log(`\n⚠️  WARNING: Approaching quota limit!`);
        console.log(`   Google TTS fallback will activate when exhausted.`);
    } else if (stats.percentUsed >= 75) {
        console.log(`\n💡 TIP: Consider optimizing usage (see tips below)`);
    } else {
        console.log(`\n✅ Plenty of quota available!`);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Get estimated characters for text
 */
export function estimateCharacters(script) {
    if (!script) return 0;
    // Simple estimation: count actual characters in dialogue
    return script.length;
}
