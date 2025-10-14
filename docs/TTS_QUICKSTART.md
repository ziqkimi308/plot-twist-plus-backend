# TTS Quick Start Guide

## ✅ **What I Created**

### **`utils/ttsEngine.js`** - Complete TTS System

Two main functions:

1. **`extractDialogue(script)`** - Extracts character dialogue from screenplay
2. **`generateScriptVoices(script, options)`** - Generates audio files for all dialogue

---

## 🚀 **Quick Usage**

```javascript
import { generateScriptVoices } from './utils/ttsEngine.js';

// Your script from buildScriptPrompt()
const script = `...screenplay here...`;

// Generate all voices automatically
const results = await generateScriptVoices(script);

console.log(results);
// Returns array of audio files with metadata
```

---

## 🔑 **Setup (Optional but Recommended)**

### **Add to `.env` file:**

```bash
# ElevenLabs API Key (optional, for high-quality TTS)
# Get free at: https://elevenlabs.io/sign-up
# Free tier: 10,000 characters/month
ELEVENLABS_API_KEY=
```

**If you don't add ElevenLabs API key:**
- ✅ Still works! 
- ✅ Automatically uses Google TTS (free unlimited)
- ⚠️ Lower quality but always available

---

## 📊 **How It Works**

### **Automatic Fallback System:**

```
Script Input
    ↓
Extract Dialogue (CHARACTER: "line")
    ↓
For each dialogue line:
    1. Try ElevenLabs (if API key exists) ✨ High quality
    2. If fails → Try Google TTS 🔄 Always works
    3. If fails → Skip, log error ⚠️ Continue processing
    ↓
Save MP3 files: 000_CHARACTER.mp3, 001_CHARACTER.mp3, etc.
    ↓
Return array with file paths and metadata
```

---

## 📁 **Output Example**

```
voice-output/
├── 000_SARAH.mp3      (Character: SARAH, Line 1)
├── 001_MIKE.mp3       (Character: MIKE, Line 1)
├── 002_SARAH.mp3      (Character: SARAH, Line 2)
├── 003_MIKE.mp3       (Character: MIKE, Line 2)
└── 004_SARAH.mp3      (Character: SARAH, Line 3)
```

---

## 🎯 **Example with Script from promptBuilder**

```javascript
import { buildScriptPrompt } from './utils/promptBuilder.js';
import { generateWithGroq } from './utils/aiTextGenerator.js';
import { generateScriptVoices } from './utils/ttsEngine.js';

// 1. You already have a plot
const plot = "...your generated plot...";

// 2. Generate script using buildScriptPrompt()
const scriptPrompt = buildScriptPrompt(plot);
const script = await generateWithGroq(scriptPrompt);

// 3. Generate voices from script
const audioFiles = await generateScriptVoices(script, {
    provider: 'auto',     // Try ElevenLabs → Google TTS
    language: 'en',       // Language for Google TTS
    outputDir: './voices' // Where to save files
});

// 4. Use the audio files
console.log(`Generated ${audioFiles.length} voice files!`);
audioFiles.forEach(file => {
    console.log(`${file.character}: ${file.audioFile}`);
});
```

---

## ⚙️ **Options**

```javascript
const options = {
    provider: 'auto',      // 'auto' | 'elevenlabs' | 'google'
    language: 'en',        // 'en', 'es', 'fr', 'de', etc.
    outputDir: './voices'  // Where to save MP3 files
};

const results = await generateScriptVoices(script, options);
```

---

## 🎙️ **Provider Comparison**

| Feature | ElevenLabs | Google TTS |
|---------|-----------|------------|
| **Quality** | ⭐⭐⭐⭐⭐ Natural | ⭐⭐⭐ Robotic |
| **Setup** | API key needed | No setup |
| **Cost** | 10k chars/month free | Unlimited free |
| **Speed** | 1-2 sec/line | 0.5-1 sec/line |
| **Reliability** | Rate limits | Always works |

---

## 🧪 **Test It**

Create a test file to try it out:

```javascript
// test-my-tts.js
import { generateScriptVoices } from './utils/ttsEngine.js';

const sampleScript = `
FADE IN:

INT. COFFEE SHOP - DAY

SARAH
I can't believe this is happening.

MIKE
What's wrong, Sarah?

SARAH
Everything. Just everything.

FADE OUT.
`;

const results = await generateScriptVoices(sampleScript);
console.log('Audio files generated:', results);
```

Run: `node test-my-tts.js`

---

## ✅ **What You Get**

Each result object contains:

```javascript
{
    character: "SARAH",
    line: "I can't believe this is happening.",
    order: 0,
    audioFile: "000_SARAH.mp3",
    audioPath: "E:/path/to/voice-output/000_SARAH.mp3",
    provider: "elevenlabs",  // or "google"
    success: true,
    sizeKB: "45.23"
}
```

---

## 🚀 **Ready to Use!**

The TTS engine is **production-ready** and works automatically with your `buildScriptPrompt()` function!

**With ElevenLabs API:** High-quality voices
**Without API key:** Still works with Google TTS

**Next step:** Try it with your generated scripts! 🎬
