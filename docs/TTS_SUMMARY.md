# 🎙️ PlotTwist+ TTS System Summary

## ✅ **Complete TTS Voice Generation System**

Your system now has **3-tier TTS fallback** with professional audiobook quality!

---

## 🎯 **Fallback Chain**

```
Script Input
    ↓
1️⃣  ElevenLabs (Primary)
    • 10,000 chars/month FREE
    • 12 custom voices (John, Josh, Rachel, etc.)
    • Voice mapping per character
    • ⭐⭐⭐⭐⭐ Best quality
    ↓ (if fails or quota exceeded)
    
2️⃣  Fish Audio (Secondary) ⭐ NEW!
    • 8,000 credits/month FREE
    • 1000+ voices, 70+ languages
    • Studio-grade quality
    • ⭐⭐⭐⭐ Professional quality
    ↓ (if fails or quota exceeded)
    
3️⃣  Google TTS (Tertiary)
    • Unlimited FREE forever
    • Always available
    • ⭐⭐⭐ Basic quality (robotic)
    ↓
MP3 Audio Files Generated ✅
```

---

## 📊 **Provider Comparison**

| Feature | ElevenLabs | Fish Audio | Google TTS |
|---------|------------|------------|------------|
| **Quality** | ⭐⭐⭐⭐⭐ Very natural | ⭐⭐⭐⭐ Natural | ⭐⭐⭐ Robotic |
| **Free Tier** | 10k chars/mo | 8k credits/mo | Unlimited |
| **Voices** | 12 custom | 1000+ library | 1 standard |
| **Setup** | API key | API key | No setup |
| **Voice Mapping** | ✅ Yes | ❌ No | ❌ No |
| **Languages** | 29 | 70+ | 100+ |
| **Best For** | Production | Variety/backup | Fallback |

---

## 🎙️ **Available Voices**

### **ElevenLabs (Custom Voices):**

**Narrators:**
- `john` - John Doe, deep narrator (DEFAULT) ⭐
- `nigel` - Nigel Graves, professional

**Male Characters:**
- `josh` - Young, energetic ✅
- `adam` - Deep, mature
- `antoni` - Well-rounded
- `arnold` - Powerful, authoritative
- `sam` - Raspy, mysterious

**Female Characters:**
- `rachel` - Calm, articulate
- `bella` - Soft, gentle
- `elli` - Emotional, expressive
- `domi` - Strong, confident
- `dorothy` - Pleasant, conversational

---

## ⚙️ **Setup Required**

### **`.env` File:**

```bash
# ElevenLabs (Primary) - REQUIRED for custom voices
ELEVENLABS_API_KEY=sk_xxx...
# Get free at: https://elevenlabs.io/sign-up

# Fish Audio (Secondary) - OPTIONAL for better fallback
FISHAUDIO_API_KEY=fa_xxx...
# Get free at: https://fish.audio/auth/signup

# Google TTS (Tertiary) - NO SETUP NEEDED
# Always works as final fallback
```

---

## 💡 **Usage**

### **Basic (Dialogue Only):**
```javascript
await generateScriptVoices(script);
// Uses default settings, ElevenLabs voices
```

### **With Narration (Recommended):**
```javascript
await generateScriptVoices(script, {
    includeNarration: true,        // ← Include action lines
    narratorVoice: 'john',         // ← John Doe narrator (default)
    voiceMapping: {
        'NARRATOR': 'john',        // Deep narrator
        'SARAH CHEN': 'rachel',    // Female lead
        'MARCUS REED': 'josh'      // Young male ✅
    }
});
```

### **Force Specific Provider:**
```javascript
// Force Fish Audio only
await generateScriptVoices(script, { 
    provider: 'fishaudio' 
});

// Force Google TTS only (no API key needed)
await generateScriptVoices(script, { 
    provider: 'google' 
});
```

---

## 📁 **Output**

### **Generated Files:**
```
voice-output/
├── 000_NARRATOR.mp3      (John Doe - ElevenLabs)
├── 001_SARAH_CHEN.mp3    (Rachel - ElevenLabs)
├── 002_NARRATOR.mp3      (John Doe - ElevenLabs)
├── 003_MARCUS_REED.mp3   (Josh - ElevenLabs)
├── 004_SARAH_CHEN.mp3    (Rachel - Fish Audio)  ← Fallback
├── 005_NARRATOR.mp3      (Google TTS)           ← Final fallback
└── ...
```

### **Metadata Returned:**
```javascript
{
    character: "SARAH CHEN",
    line: "Something doesn't add up...",
    audioFile: "001_SARAH_CHEN.mp3",
    audioPath: "/full/path/001_SARAH_CHEN.mp3",
    provider: "elevenlabs",  // or "fishaudio" or "google"
    success: true,
    sizeKB: "45.23"
}
```

---

## 🎬 **Complete Workflow**

```javascript
// 1. Generate plot
const plot = await generatePlot(genre, characters, setting);

// 2. Generate script (TTS-optimized format with NARRATOR blocks)
const scriptPrompt = buildScriptPrompt(plot);
const script = await generateWithGroq(scriptPrompt);

// 3. Generate voices (3-tier fallback)
const audioFiles = await generateScriptVoices(script, {
    includeNarration: true,
    voiceMapping: {
        'NARRATOR': 'john',
        'CHARACTER1': 'rachel',
        'CHARACTER2': 'josh'
    }
});

// 4. Result: MP3 files ready to play!
console.log(`Generated ${audioFiles.length} audio files`);
```

---

## ✅ **Features**

### **Automatic:**
- ✅ **Dialogue extraction** from screenplay
- ✅ **3-tier fallback** (never fails)
- ✅ **Voice mapping** per character (ElevenLabs)
- ✅ **Narration support** (action lines)
- ✅ **MP3 file generation**
- ✅ **Rate limit handling**

### **Script Format:**
- ✅ **TTS-optimized** format with explicit NARRATOR blocks
- ✅ **Character voices** clearly separated
- ✅ **Audiobook-ready** output
- ✅ **Professional quality**

---

## 📝 **Documentation**

- **`TTS_SETUP.md`** - Complete setup guide
- **`TTS_QUICKSTART.md`** - Quick start guide
- **`TTS_NARRATION_GUIDE.md`** - Narration feature guide
- **`FISH_AUDIO_SETUP.md`** - Fish Audio setup ⭐ NEW!
- **`VOICE_REFERENCE.md`** - Voice catalog
- **`SCRIPT_FORMAT_IMPROVED.md`** - Script format guide

---

## 💰 **Cost Breakdown**

### **FREE Tier Limits:**
- **ElevenLabs:** 10,000 chars/month (~5-10 min audio)
- **Fish Audio:** 8,000 credits/month (~4-8 min audio)
- **Google TTS:** Unlimited forever

**Total FREE:** ~10-20 minutes of high-quality audio + unlimited basic audio!

### **If You Exceed Free Tiers:**
- ElevenLabs → Falls back to Fish Audio
- Fish Audio → Falls back to Google TTS
- Google TTS → Never fails, always available

**You're covered no matter what!** 🎉

---

## 🚀 **Quick Commands**

```bash
# Test demos (in backend/)
node demo-voice-generation.js      # Basic demo
node demo-multiple-voices.js       # Multiple voice actors
node demo-with-narrator.js         # With narration
node demo-google-tts-simple.js     # Google TTS test

# Run specific demos
node demo-nigel-narrator.js        # Test Nigel Graves voice
node demo-narrator-clean.js        # Clean narration demo
```

---

## ✅ **Status**

✅ **ElevenLabs** - Configured (12 voices)  
✅ **Fish Audio** - Added as 2nd tier ⭐ NEW!  
✅ **Google TTS** - Always available  
✅ **Voice mapping** - Per character  
✅ **Narration** - Action lines supported  
✅ **Fallback** - 3-tier protection  
✅ **Production ready** - Complete system  

---

## 📖 **Your Current Setup**

```javascript
// Default narrator: John Doe (deep voice)
// Default provider: auto (ElevenLabs → Fish Audio → Google TTS)
// Script format: TTS-optimized with NARRATOR blocks
// Voices: 12 ElevenLabs + 1000+ Fish Audio + Google TTS

const results = await generateScriptVoices(script, {
    includeNarration: true  // ← Full audiobook experience
});

// Generates professional audiobook with:
// • John Doe narrating action
// • Custom voices for each character
// • Automatic fallback protection
// • Production-quality MP3 files
```

---

**Your TTS system is production-ready with triple redundancy!** 🎙️✨📖
