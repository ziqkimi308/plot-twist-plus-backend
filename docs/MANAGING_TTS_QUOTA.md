# 📊 Managing ElevenLabs TTS Quota

## ✅ **Your System Already Handles Exhaustion!**

Don't worry - your TTS system **automatically switches to Google TTS** when ElevenLabs quota runs out!

---

## 🎯 **How Quota Management Works:**

### **1. Automatic Tracking**
```
Every time you generate audio:
✅ Checks remaining quota BEFORE calling API
✅ Tracks characters used
✅ Displays usage percentage
✅ Warns when approaching limit
✅ Auto-switches to Google TTS when exhausted
```

### **2. Automatic Fallback**
```
If ElevenLabs quota exhausted:
   ↓
System automatically uses Google TTS
   ↓
Audio ALWAYS generates (no failures!)
```

### **3. Automatic Reset**
```
Every month (automatically):
✅ Quota resets to 10,000 chars
✅ Usage counter resets to 0
✅ Full quota available again
```

---

## 📊 **Check Your Usage:**

### **Quick Check:**
```bash
node check-usage.js
```

**Output:**
```
📊 ELEVENLABS TTS USAGE SUMMARY
========================================================

📅 Month: 2025-01

📈 Usage:
   Used:      2,450 / 10,000 chars
   Remaining: 7,550 chars
   Percentage: 24.5%

🎙️  Estimated remaining audio: ~12 minutes

🟢 [██████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 24.5%

✅ Plenty of quota available!
```

---

## 💡 **Optimization Strategies:**

### **1. Preview Character Count First**
```javascript
import { extractDialogue, extractScriptWithNarration } from './utils/ttsEngine.js';

const script = "...your screenplay...";

// Count dialogue only
const dialogue = extractDialogue(script);
const charCount = dialogue.reduce((sum, d) => sum + d.line.length, 0);
console.log(`This will use ~${charCount} characters`);

// Count with narration
const withNarration = extractScriptWithNarration(script);
const totalCount = withNarration.reduce((sum, d) => sum + d.line.length, 0);
console.log(`With narration: ~${totalCount} characters`);
```

### **2. Use Selective Narration**
```javascript
// Option A: Dialogue only (saves quota)
await generateScriptVoices(script, {
    includeNarration: false,  // No narration = less chars
    voiceMapping: { ... }
});

// Option B: Smart narration (scene headings only)
await generateScriptVoices(script, {
    includeNarration: true,
    skipActionLines: true,  // Skip detailed actions
    voiceMapping: { ... }
});
```

### **3. Test with Short Scripts**
```javascript
// Test first 3 scenes only
const testScript = fullScript.split('INT.').slice(0, 3).join('INT.');
await generateScriptVoices(testScript, { ... });
```

---

## 📈 **What Happens When Quota Exhausted:**

### **Scenario: You've used 10,000/10,000 chars**

```
Generating audio 1/10: NARRATOR
   ⚠️  ElevenLabs quota exhausted - skipping to fallback
   Trying Google TTS...
   ✅ Google TTS success

Generating audio 2/10: SARAH
   ⚠️  ElevenLabs quota exhausted - skipping to fallback
   Trying Google TTS...
   ✅ Google TTS success

... continues with Google TTS ...
```

**Result:**
- ✅ Audio STILL generates
- ✅ All characters STILL get audio
- ⚠️ Quality drops to basic Google TTS
- ✅ Unlimited Google TTS ensures completion

---

## 🎯 **Smart Usage Examples:**

### **Example 1: Check Before Generating**
```javascript
import { getUsageStats } from './utils/usageTracker.js';
import { extractScriptWithNarration } from './utils/ttsEngine.js';

// Check current usage
const stats = getUsageStats();
console.log(`Quota remaining: ${stats.remaining} chars`);

// Estimate script size
const dialogue = extractScriptWithNarration(script);
const scriptChars = dialogue.reduce((sum, d) => sum + d.line.length, 0);
console.log(`Script needs: ${scriptChars} chars`);

if (scriptChars > stats.remaining) {
    console.log(`⚠️  This script will exceed quota!`);
    console.log(`   Will use ElevenLabs: ${stats.remaining} chars`);
    console.log(`   Will use Google TTS: ${scriptChars - stats.remaining} chars`);
}

// Generate anyway - system handles it!
await generateScriptVoices(script, { ... });
```

### **Example 2: High-Priority First**
```javascript
// Generate important characters with ElevenLabs first
await generateScriptVoices(script, {
    includeNarration: true,
    narratorVoice: 'john',
    voiceMapping: {
        'NARRATOR': 'john',
        'MAIN_CHARACTER': 'rachel',
        'VILLAIN': 'josh'
    }
});

// Check if quota remains
const stats = getUsageStats();
if (stats.remaining > 0) {
    // Generate side characters if quota allows
    await generateScriptVoices(sideCharacterScript, { ... });
}
```

---

## 📊 **Understanding Character Counts:**

### **Average Estimates:**
```
Dialogue line:        ~50-100 chars
Action description:   ~100-200 chars
Scene heading:        ~30-50 chars

1 minute of audio:    ~600-700 chars
5 minutes of audio:   ~3,000-3,500 chars
10 minutes of audio:  ~6,000-7,000 chars
```

### **Your Free Tier (10,000 chars):**
```
≈ 15-20 minutes of audio per month
≈ 100-150 dialogue lines
≈ 10-15 scenes with full narration
≈ 5-10 pages of screenplay
```

---

## ⚠️ **Quota Warnings:**

System automatically warns you:

### **75% Used:**
```
⚠️  ElevenLabs quota at 75%. 2,500 chars remaining.
```

### **90% Used:**
```
⚠️  WARNING: ElevenLabs quota at 90%! Only 1,000 chars left.
   Fallback to Google TTS will activate when quota exhausted.
```

### **100% Used:**
```
⚠️  ElevenLabs quota exhausted - skipping to fallback
```

---

## 🎯 **Best Practices:**

### **1. Monthly Planning**
```
Week 1: Test and demo (use ~2,000 chars)
Week 2: Main project (use ~4,000 chars)
Week 3: Refinements (use ~2,000 chars)
Week 4: Buffer (save ~2,000 chars)
```

### **2. Development Workflow**
```
1. Write script
2. Check character count (node check-usage.js)
3. Test with dialogue only first
4. Add narration if quota allows
5. Let system handle fallback if needed
```

### **3. Production Strategy**
```
For important demos:
- Save ~5,000 chars for final version
- Use Google TTS for testing/development
- Switch to ElevenLabs for presentation
```

---

## ✅ **What You Don't Need to Worry About:**

❌ **Running out unexpectedly**
   → System tracks usage in real-time

❌ **Audio failing to generate**
   → Google TTS fallback always works

❌ **Manual quota management**
   → Automatic tracking & warnings

❌ **Remembering when quota resets**
   → Auto-resets monthly

❌ **Complex monitoring**
   → Simple `node check-usage.js` command

---

## 🔧 **Advanced: Usage Data Location**

Usage data stored in:
```
backend/data/tts-usage.json
```

**Format:**
```json
{
  "elevenlabs": {
    "currentMonth": "2025-01",
    "charactersUsed": 2450,
    "requests": [
      {
        "timestamp": "2025-01-14T13:45:00Z",
        "characters": 85,
        "textPreview": "Interior. A detective's office..."
      }
    ],
    "limit": 10000
  }
}
```

You can manually reset if needed:
```javascript
// Reset usage (use carefully!)
import fs from 'fs';
const resetData = {
    elevenlabs: {
        currentMonth: getCurrentMonth(),
        charactersUsed: 0,
        requests: [],
        limit: 10000
    }
};
fs.writeFileSync('./data/tts-usage.json', JSON.stringify(resetData, null, 2));
```

---

## 📱 **Integration with Your App:**

### **Display Usage in UI:**
```javascript
import { getUsageStats } from './utils/usageTracker.js';

// In your API endpoint
app.get('/api/tts/usage', (req, res) => {
    const stats = getUsageStats();
    res.json(stats);
});

// Frontend can display:
// "ElevenLabs: 2,450 / 10,000 chars (24.5%)"
// Progress bar
// "~12 minutes remaining"
```

### **Pre-generation Check:**
```javascript
app.post('/api/generate-audio', async (req, res) => {
    const { script } = req.body;
    
    // Estimate characters
    const dialogue = extractDialogue(script);
    const estimatedChars = dialogue.reduce((sum, d) => sum + d.line.length, 0);
    
    // Check quota
    const stats = getUsageStats();
    
    if (estimatedChars > stats.remaining) {
        // Warn user but still proceed
        res.json({
            warning: 'Will use Google TTS fallback for some lines',
            estimated: estimatedChars,
            remaining: stats.remaining
        });
    }
    
    // Generate anyway - system handles it
    const results = await generateScriptVoices(script, { ... });
    res.json({ results });
});
```

---

## ✅ **Summary:**

### **Your System:**
✅ **Automatic tracking** - No manual monitoring needed  
✅ **Automatic fallback** - Never fails to generate  
✅ **Automatic reset** - Monthly quota refresh  
✅ **Smart warnings** - Alerts before exhaustion  
✅ **Simple checking** - `node check-usage.js`  

### **Your Free Tier:**
✅ **10,000 chars/month** ElevenLabs (professional quality)  
✅ **Unlimited** Google TTS (fallback)  
✅ **≈15-20 minutes** of audio/month  
✅ **Perfect for demos** and testing  

### **What Happens When Exhausted:**
✅ Audio **still generates** (via Google TTS)  
✅ System **automatically handles** it  
✅ No errors or failures  
✅ Resets next month  

---

## 🎯 **Key Takeaway:**

**Don't stress about quota exhaustion!**

Your system is designed to handle it gracefully:
1. Tracks usage automatically
2. Warns before exhaustion
3. Falls back to Google TTS
4. Audio ALWAYS generates

**Just check usage occasionally with `node check-usage.js` and you're good!** ✅

---

## 🚀 **Quick Commands:**

```bash
# Check current usage
node check-usage.js

# Generate with tracking
node demo-narration.js

# View usage data
cat data/tts-usage.json
```

**Your TTS system is production-ready with quota management!** 🎙️✨
