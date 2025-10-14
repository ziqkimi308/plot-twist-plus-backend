# PlotTwist+ Text-to-Speech (TTS) System

## Overview

The TTS Engine converts screenplay scripts into audio files with multiple AI voice providers and automatic fallback.

## Features

### ✅ **3-Tier Fallback System**
1. **Primary: ElevenLabs** - High quality, natural voices (10,000 chars/month free)
2. **Secondary: Google TTS** - Free unlimited, basic quality
3. **Tertiary: Graceful failure** - Logs error, continues processing

### ✅ **Automatic Dialogue Extraction**
- Parses screenplay format (character names in ALL CAPS)
- Handles dialogue with quotes and without
- Skips parentheticals like `(angrily)`, `(whispers)`
- Preserves order for sequential playback

### ✅ **Smart Character Detection**
- Recognizes standard screenplay format
- Handles character names with spaces
- Skips scene headers (INT./EXT.)
- Filters out action lines

---

## Setup Instructions

### 1. **Add ElevenLabs API Key (Optional but Recommended)**

**Get a FREE ElevenLabs API Key:**
1. Go to: https://elevenlabs.io/
2. Sign up for free account
3. Navigate to Profile Settings → API Keys
4. Copy your API key
5. Add to `.env` file:

```bash
# ElevenLabs API Key (optional, for high-quality TTS)
# Free tier: 10,000 characters/month
ELEVENLABS_API_KEY=your_api_key_here
```

**Free Tier Limits:**
- 10,000 characters per month
- 3 custom voices
- High-quality natural speech
- Commercial use allowed

---

### 2. **Google TTS (Automatic Fallback)**

No setup needed! Google TTS works automatically as a fallback:
- ✅ **Free unlimited**
- ✅ **No API key required**
- ✅ **Multiple languages**
- ⚠️ Basic quality (robotic)

---

## Usage

### **1. Import the TTS Engine**

```javascript
import { extractDialogue, generateScriptVoices } from './utils/ttsEngine.js';
```

### **2. Generate Voices from Script**

```javascript
const script = `
FADE IN:

INT. COFFEE SHOP - DAY

SARAH sits alone, staring at her phone.

SARAH
I can't believe this is happening.

MIKE enters and sits across from her.

MIKE
What's wrong?

SARAH
Everything. Just... everything.

FADE OUT.
`;

// Generate audio files for all dialogue
const results = await generateScriptVoices(script, {
    provider: 'auto', // 'auto', 'elevenlabs', 'google'
    language: 'en',
    outputDir: './voice-output'
});

console.log(results);
/*
Output:
[
    {
        character: 'SARAH',
        line: 'I can\'t believe this is happening.',
        order: 0,
        audioFile: '000_SARAH.mp3',
        audioPath: '/path/to/voice-output/000_SARAH.mp3',
        provider: 'elevenlabs',
        success: true,
        sizeKB: '45.23'
    },
    {
        character: 'MIKE',
        line: 'What\'s wrong?',
        order: 1,
        audioFile: '001_MIKE.mp3',
        audioPath: '/path/to/voice-output/001_MIKE.mp3',
        provider: 'elevenlabs',
        success: true,
        sizeKB: '12.45'
    },
    ...
]
*/
```

### **3. Extract Dialogue Only (Without Generating Audio)**

```javascript
const dialogue = extractDialogue(script);

console.log(dialogue);
/*
Output:
[
    {
        character: 'SARAH',
        line: 'I can\'t believe this is happening.',
        order: 0
    },
    {
        character: 'MIKE',
        line: 'What\'s wrong?',
        order: 1
    },
    ...
]
*/
```

---

## Options

### **`generateScriptVoices(script, options)`**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `provider` | string | `'auto'` | `'auto'`, `'elevenlabs'`, `'google'` |
| `language` | string | `'en'` | Language code for Google TTS |
| `outputDir` | string | `'../voice-output'` | Directory to save audio files |

### **Provider Options:**
- **`'auto'`**: Tries ElevenLabs → Google TTS → Skip
- **`'elevenlabs'`**: Only ElevenLabs (skips if no API key)
- **`'google'`**: Only Google TTS (always available)

---

## Output

### **Audio Files**
- Format: `MP3`
- Naming: `{order}_{CHARACTER}.mp3`
  - `000_SARAH.mp3`
  - `001_MIKE.mp3`
  - `002_SARAH.mp3`

### **Result Object**
```javascript
{
    character: string,      // Character name
    line: string,           // Dialogue text
    order: number,          // Sequential order
    audioFile: string,      // Filename
    audioPath: string,      // Full path
    provider: string,       // 'elevenlabs', 'google', or 'none'
    success: boolean,       // true if audio generated
    sizeKB: string,         // File size in KB
    error: string           // Error message if failed (optional)
}
```

---

## ElevenLabs Voice Options

### **Available Voices**
- `pNInz6obpgDQGcFmaJgB` - Adam (male, default)
- `EXAVITQu4vr4xnSDxMaL` - Bella (female)
- `ErXwobaYiN019PkySvjV` - Antoni (male)
- `VR6AewLTigWG4xSOukaG` - Arnold (male)
- `MF3mGyEYCl7XYWbV9V6O` - Elli (female)

### **Custom Voice Settings**

```javascript
const results = await generateScriptVoices(script, {
    provider: 'elevenlabs',
    voiceOptions: {
        voice_id: 'EXAVITQu4vr4xnSDxMaL', // Bella
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
            stability: 0.75,        // 0-1 (higher = more stable)
            similarity_boost: 0.85  // 0-1 (higher = more similar to original)
        }
    }
});
```

---

## Supported Script Formats

### **Standard Screenplay Format**
```
CHARACTER NAME
Dialogue here.

CHARACTER NAME (emotion)
More dialogue.
```

### **With Colons**
```
CHARACTER NAME:
Dialogue here.
```

### **With Quotes**
```
CHARACTER NAME
"Dialogue in quotes."
```

---

## Error Handling

The TTS engine gracefully handles failures:

1. **ElevenLabs fails** → Falls back to Google TTS
2. **Google TTS fails** → Logs error, continues with next dialogue
3. **No API keys** → Uses Google TTS only

---

## Performance

### **Generation Speed**
- **ElevenLabs**: ~1-2 seconds per dialogue line
- **Google TTS**: ~0.5-1 seconds per dialogue line

### **Rate Limits**
- **ElevenLabs**: 1-second delay between requests (courtesy)
- **Google TTS**: 0.5-second delay between requests

---

## Example: Full Workflow

```javascript
import { generateScriptVoices } from './utils/ttsEngine.js';
import { buildScriptPrompt } from './utils/promptBuilder.js';
import { generateWithGroq } from './utils/aiTextGenerator.js';

// 1. Generate plot (from previous steps)
const plot = await generatePlot(genre, characters, setting);

// 2. Generate script from plot
const scriptPrompt = buildScriptPrompt(plot);
const script = await generateWithGroq(scriptPrompt);

// 3. Generate voices from script
const voices = await generateScriptVoices(script, {
    provider: 'auto',
    language: 'en'
});

console.log(`Generated ${voices.length} audio files`);
console.log(`Output directory: ./voice-output`);
```

---

## Troubleshooting

### **Issue: "No dialogue found in script"**
**Solution**: Check script format. Character names must be in ALL CAPS.

### **Issue: "ElevenLabs API error 401"**
**Solution**: Check your API key in `.env` file.

### **Issue: "ElevenLabs API error 429"**
**Solution**: Rate limit exceeded. System will automatically fall back to Google TTS.

### **Issue: "Google TTS error 403"**
**Solution**: Google may be rate-limiting. Add longer delays or try again later.

---

## Cost Comparison

| Provider | Free Tier | Quality | Setup |
|----------|-----------|---------|-------|
| **ElevenLabs** | 10k chars/month | ⭐⭐⭐⭐⭐ Excellent | API key required |
| **Google TTS** | Unlimited | ⭐⭐⭐ Good | No setup |

---

## Next Steps

1. **Test the system** with a sample script
2. **Add ElevenLabs API key** for best quality
3. **Integrate into your API endpoint** (e.g., `/api/generate-voice`)
4. **Customize voices** per character

---

**Your TTS system is production-ready with automatic fallback!** 🎙️
