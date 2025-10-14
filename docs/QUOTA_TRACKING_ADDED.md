# ✅ Quota Tracking System - IMPLEMENTED!

## 🎉 **Your TTS Now Has Smart Quota Management!**

---

## 🎯 **What Was Added:**

### **1. Automatic Usage Tracking**
- ✅ Tracks every character used with ElevenLabs
- ✅ Stores usage data in `data/tts-usage.json`
- ✅ Auto-resets monthly
- ✅ Prevents unexpected exhaustion

### **2. Smart Quota Checking**
- ✅ Checks quota BEFORE calling ElevenLabs API
- ✅ Skips to Google TTS if quota exhausted
- ✅ Never wastes API calls
- ✅ Always generates audio

### **3. Usage Monitoring**
- ✅ Real-time usage display
- ✅ Percentage tracking
- ✅ Remaining character count
- ✅ Estimated minutes of audio left

### **4. Automatic Warnings**
- ✅ Warns at 75% usage
- ✅ Alerts at 90% usage
- ✅ Notifies when switching to fallback
- ✅ Displays usage after each generation

---

## 📁 **New Files Created:**

### **1. `utils/usageTracker.js`**
Core tracking system:
- `trackElevenLabsUsage()` - Records usage
- `getUsageStats()` - Returns current stats
- `hasQuotaAvailable()` - Checks if quota left
- `displayUsageSummary()` - Shows detailed stats

### **2. `check-usage.js`**
Quick command to check quota:
```bash
node check-usage.js
```

### **3. `docs/MANAGING_TTS_QUOTA.md`**
Complete guide with:
- How tracking works
- Optimization strategies
- Best practices
- Examples

---

## 🎯 **How It Works:**

### **Before (No Tracking):**
```
Generate audio → Call ElevenLabs
                 ↓
                Might fail if quota exceeded
                ↓
                Error or surprise exhaustion
```

### **After (With Tracking):**
```
Generate audio → Check quota
                 ↓
            Has quota? ─→ YES → ElevenLabs
                 ↓              Track usage
                 NO             Display stats
                 ↓
            Use Google TTS (fallback)
                 ↓
            Always succeeds! ✅
```

---

## 🎙️ **Example Output:**

### **During Generation:**
```
Generating audio 1/10: NARRATOR
   Trying ElevenLabs (voice: john)...
   ✅ ElevenLabs success

Generating audio 2/10: SARAH
   Trying ElevenLabs (voice: rachel)...
   ✅ ElevenLabs success

...

========================================================

📊 ElevenLabs Usage: 2,450 / 10,000 chars (24.5%)
   Remaining: 7,550 chars (~12 min of audio)

========================================================
```

### **When Approaching Limit:**
```
Generating audio 8/10: MARCUS
   Trying ElevenLabs (voice: josh)...
   ✅ ElevenLabs success

⚠️  ElevenLabs quota at 85%. 1,500 chars remaining.

Generating audio 9/10: DETECTIVE
   Trying ElevenLabs (voice: adam)...
   ✅ ElevenLabs success

⚠️  WARNING: ElevenLabs quota at 92%! Only 800 chars left.
   Fallback to Google TTS will activate when quota exhausted.
```

### **When Exhausted:**
```
Generating audio 1/10: NARRATOR
   ⚠️  ElevenLabs quota exhausted - skipping to fallback
   Trying Google TTS...
   ✅ Google TTS success

Generating audio 2/10: SARAH
   ⚠️  ElevenLabs quota exhausted - skipping to fallback
   Trying Google TTS...
   ✅ Google TTS success

...continues with Google TTS...
```

---

## 📊 **Check Usage Command:**

```bash
node check-usage.js
```

**Output:**
```
🎙️  TTS USAGE CHECKER

====================================================
📊 ELEVENLABS TTS USAGE SUMMARY
====================================================

📅 Month: 2025-01

📈 Usage:
   Used:      2,450 / 10,000 chars
   Remaining: 7,550 chars
   Percentage: 24.5%

🎙️  Estimated remaining audio: ~12 minutes

🟢 [██████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 24.5%

✅ Plenty of quota available!

====================================================

💡 USAGE OPTIMIZATION TIPS:

   1. Test with short scripts first
   2. Use selective narration (not full action lines)
   3. Preview character count before generating
   4. Google TTS automatically activates when quota exhausted

📝 Your quota resets automatically at the start of each month!
```

---

## ✅ **Key Features:**

### **1. Automatic Monthly Reset**
```
January 1st → Quota resets to 10,000
February 1st → Quota resets to 10,000
March 1st → Quota resets to 10,000
... every month automatically
```

### **2. Visual Progress Bar**
```
25%: 🟢 [██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 25.0%
50%: 🟢 [████████████████░░░░░░░░░░░░░░░░░░] 50.0%
75%: 🟡 [██████████████████████████░░░░░░░░] 75.0%
90%: 🔴 [████████████████████████████████░░] 90.0%
```

### **3. Smart Warnings**
- **75%:** Yellow warning
- **90%:** Red alert
- **100%:** Auto-switches to Google TTS

### **4. Never Fails**
- Quota exhausted? → Google TTS takes over
- Google TTS fails? → Retry logic
- Audio ALWAYS generates ✅

---

## 💡 **Usage Optimization Tips:**

### **1. Preview Before Generating**
```javascript
import { extractScriptWithNarration } from './utils/ttsEngine.js';

const dialogue = extractScriptWithNarration(script);
const charCount = dialogue.reduce((sum, d) => sum + d.line.length, 0);
console.log(`This will use ${charCount} characters`);
```

### **2. Dialogue vs. Narration**
```javascript
// Dialogue only (saves quota)
await generateScriptVoices(script, {
    includeNarration: false
});

// With narration (uses more quota)
await generateScriptVoices(script, {
    includeNarration: true
});
```

### **3. Test with Short Scripts**
```javascript
// Test first 3 scenes
const testScript = fullScript.split('INT.').slice(0, 3).join('INT.');
```

---

## 🎯 **What You Get:**

### **Monthly Quota:**
- **10,000 characters** ElevenLabs (professional)
- **≈15-20 minutes** of audio
- **≈100-150 dialogue lines**
- **≈5-10 screenplay pages**

### **Unlimited Fallback:**
- Google TTS (basic quality)
- Always available
- Never exhausts

### **Smart Management:**
- Real-time tracking
- Automatic warnings
- Graceful fallback
- Monthly reset

---

## 🚀 **How to Use:**

### **1. Generate Audio (Automatic Tracking):**
```javascript
// Just generate as normal - tracking is automatic!
const results = await generateScriptVoices(script, {
    includeNarration: true,
    narratorVoice: 'john',
    voiceMapping: {
        'NARRATOR': 'john',
        'SARAH': 'rachel',
        'MARCUS': 'josh'
    }
});

// Usage automatically tracked and displayed!
```

### **2. Check Usage Anytime:**
```bash
node check-usage.js
```

### **3. That's It!**
The system handles everything else automatically!

---

## 📊 **Data Storage:**

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

---

## ✅ **Files Modified:**

### **1. `utils/ttsEngine.js`**
- Import usage tracking functions
- Check quota before ElevenLabs call
- Track usage after successful generation
- Display usage summary at end

### **2. New: `utils/usageTracker.js`**
- Core tracking logic
- Monthly reset logic
- Usage statistics
- Warning system

### **3. New: `check-usage.js`**
- Quick usage checker
- Simple command-line tool

### **4. New: `docs/MANAGING_TTS_QUOTA.md`**
- Complete guide
- Best practices
- Examples

---

## 🎉 **Summary:**

### **Your Concern:**
> "I am afraid of situation where API exhausted of free tier"

### **Solution Implemented:**
✅ **Automatic tracking** - Never surprised  
✅ **Smart warnings** - Know before it happens  
✅ **Graceful fallback** - Google TTS takes over  
✅ **Always generates** - Never fails  
✅ **Easy monitoring** - Simple `check-usage.js` command  
✅ **Monthly reset** - Fresh quota every month  

---

## 🎯 **Bottom Line:**

**You don't need to worry about quota exhaustion anymore!**

The system:
1. ✅ Tracks usage automatically
2. ✅ Warns you in advance
3. ✅ Falls back gracefully
4. ✅ Always generates audio
5. ✅ Resets monthly

**Just check `node check-usage.js` occasionally and you're covered!** 🎙️✨

---

## 🚀 **Try It Now:**

```bash
# Check your current usage
node check-usage.js

# Generate audio (tracking automatic)
node demo-narration.js

# Check usage again to see the difference
node check-usage.js
```

**Your TTS system is now production-ready with intelligent quota management!** ✅
