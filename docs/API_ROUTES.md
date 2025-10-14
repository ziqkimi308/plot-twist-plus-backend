# 🚀 PlotTwist+ API Routes Documentation

Complete API reference for all generation endpoints.

---

## 📋 **Table of Contents**

1. [Generate Plot](#1-generate-plot)
2. [Generate Script](#2-generate-script)
3. [Generate Image](#3-generate-image)
4. [Generate Voice](#4-generate-voice)
5. [Usage Stats](#5-usage-stats)
6. [Audio Files](#6-audio-files)

---

## 1. Generate Plot

**Endpoint:** `POST /api/generate-plot`

**Description:** Generates a 3-act plot with plot twists based on user input.

### Request Body:
```json
{
  "genre": "thriller",
  "theme": "A detective discovers his partner is the killer",
  "setting": "Modern-day New York City (optional)",
  "characters": "Detective Sarah Chen, Marcus Reed (optional)"
}
```

### Required Fields:
- `genre` (string) - Movie genre (e.g., thriller, horror, sci-fi, drama)
- `theme` (string) - Plot theme or premise

### Optional Fields:
- `setting` (string) - Story setting/location
- `characters` (string) - Main characters description

### Response:
```json
{
  "success": true,
  "plot": "Full 3-act plot text with twists...",
  "acts": {
    "actI": "Act I content...",
    "actII": "Act II content...",
    "actIII": "Act III content..."
  },
  "metadata": {
    "genre": "thriller",
    "theme": "A detective discovers...",
    "setting": "Modern-day New York",
    "characters": "Detective Sarah Chen...",
    "provider": "groq",
    "generatedAt": "2025-01-14T10:30:00.000Z"
  }
}
```

### Error Response:
```json
{
  "success": false,
  "error": "Genre is required and must be a non-empty string",
  "timestamp": "2025-01-14T10:30:00.000Z"
}
```

---

## 2. Generate Script

**Endpoint:** `POST /api/generate-script`

**Description:** Converts a 3-act plot into a properly formatted screenplay.

### Request Body:
```json
{
  "plot": "ACT I\nA detective investigates...",
  "title": "The Dark Truth (optional)",
  "style": "concise (optional)"
}
```

### Required Fields:
- `plot` (string) - The full 3-act plot to convert to screenplay format

### Optional Fields:
- `title` (string) - Script title (default: "Untitled")
- `style` (string) - Writing style (concise, detailed, etc.)

### Response:
```json
{
  "success": true,
  "script": "FADE IN:\n\nINT. POLICE STATION - NIGHT\n\nDETECTIVE SARAH CHEN...",
  "metadata": {
    "title": "The Dark Truth",
    "format": "screenplay",
    "pages": 15,
    "scenes": 12,
    "characters": [
      "DETECTIVE SARAH CHEN",
      "MARCUS REED",
      "CAPTAIN RODRIGUEZ"
    ],
    "provider": "groq",
    "generatedAt": "2025-01-14T10:35:00.000Z"
  }
}
```

### Error Response:
```json
{
  "success": false,
  "error": "Plot is required and must be a non-empty string",
  "timestamp": "2025-01-14T10:35:00.000Z"
}
```

---

## 3. Generate Image

**Endpoint:** `POST /api/generate-image`

**Description:** Generates 3 images (one per act) from a plot.

### Request Body:
```json
{
  "plot": "ACT I\nA detective investigates...\nACT II\n...\nACT III\n...",
  "style": "cinematic, noir lighting (optional)",
  "aspect": "16:9 (optional)",
  "negative": "cartoon, anime, low quality (optional)"
}
```

### Required Fields:
- `plot` (string) - The full 3-act plot

### Optional Fields:
- `style` (string) - Image style description
- `aspect` (string) - Aspect ratio (default: "16:9")
- `negative` (string) - Negative prompt for what to avoid

### Response:
```json
{
  "success": true,
  "images": [
    {
      "act": "I",
      "imageUrl": "https://pollinations.ai/...",
      "prompt": "Cinematic shot of a detective's office at night...",
      "provider": "pollinations.ai",
      "width": 1920,
      "height": 1080,
      "success": true
    },
    {
      "act": "II",
      "imageUrl": "https://...",
      "prompt": "...",
      "provider": "huggingface",
      "width": 1920,
      "height": 1080,
      "success": true
    },
    {
      "act": "III",
      "imageUrl": "https://...",
      "prompt": "...",
      "provider": "pollinations.ai",
      "width": 1920,
      "height": 1080,
      "success": true
    }
  ],
  "generatedAt": "2025-01-14T10:40:00.000Z",
  "totalImages": 3
}
```

### Error Response:
```json
{
  "success": false,
  "error": "Plot is required and must be a non-empty string",
  "timestamp": "2025-01-14T10:40:00.000Z"
}
```

---

## 4. Generate Voice

**Endpoint:** `POST /api/generate-voice`

**Description:** Generates voice audio files from a screenplay script with TTS.

### Request Body:
```json
{
  "script": "INT. POLICE STATION - NIGHT\n\nDETECTIVE SARAH CHEN\nSomething doesn't add up...",
  "includeNarration": true,
  "narratorVoice": "john",
  "voiceMapping": {
    "NARRATOR": "john",
    "DETECTIVE SARAH CHEN": "rachel",
    "MARCUS REED": "josh"
  }
}
```

### Required Fields:
- `script` (string) - Formatted screenplay text

### Optional Fields:
- `includeNarration` (boolean) - Include action lines as narration (default: false)
- `narratorVoice` (string) - Voice for narrator (default: "john")
- `voiceMapping` (object) - Map character names to voice names

### Available Voices:
**Male:** john, adam, antoni, arnold, josh, sam, nigel  
**Female:** rachel, bella, elli, domi, dorothy

### Response:
```json
{
  "success": true,
  "audio": [
    {
      "character": "NARRATOR",
      "line": "Interior. Police station. Night.",
      "order": 1,
      "audioFile": "001_NARRATOR.mp3",
      "audioPath": "/path/to/voice-output/session-123/001_NARRATOR.mp3",
      "provider": "elevenlabs",
      "success": true
    },
    {
      "character": "DETECTIVE SARAH CHEN",
      "line": "Something doesn't add up here.",
      "order": 2,
      "audioFile": "002_DETECTIVE_SARAH_CHEN.mp3",
      "audioPath": "/path/to/voice-output/session-123/002_DETECTIVE_SARAH_CHEN.mp3",
      "provider": "elevenlabs",
      "success": true
    }
  ],
  "metadata": {
    "totalLines": 15,
    "successfulGenerations": 15,
    "failedGenerations": 0,
    "providers": {
      "elevenlabs": 12,
      "google": 3
    },
    "usage": {
      "used": 2450,
      "limit": 10000,
      "remaining": 7550,
      "percentUsed": 24.5
    },
    "outputDirectory": "/path/to/voice-output/session-123",
    "generatedAt": "2025-01-14T10:45:00.000Z"
  }
}
```

### Error Response:
```json
{
  "success": false,
  "error": "Script is required and must be a non-empty string",
  "timestamp": "2025-01-14T10:45:00.000Z"
}
```

---

## 5. Usage Stats

**Endpoint:** `GET /api/generate-voice/usage`

**Description:** Returns current ElevenLabs TTS usage statistics.

### Request:
No body required (GET request).

### Response:
```json
{
  "success": true,
  "usage": {
    "month": "2025-01",
    "used": 2450,
    "limit": 10000,
    "remaining": 7550,
    "percentUsed": 24.5,
    "estimatedMinutesLeft": 12,
    "willFallback": false
  }
}
```

---

## 6. Audio Files

**Endpoint:** `GET /api/generate-voice/audio/:filename`

**Description:** Serves generated audio files.

### Request:
```
GET /api/generate-voice/audio/001_NARRATOR.mp3
```

### Response:
Returns the MP3 audio file directly.

### Error Response:
```json
{
  "success": false,
  "error": "Audio file not found"
}
```

---

## 🔄 **Complete Workflow Example**

### Step 1: Generate Plot
```bash
POST /api/generate-plot
{
  "genre": "thriller",
  "theme": "A detective discovers his partner is the killer"
}
```

### Step 2: Generate Script
```bash
POST /api/generate-script
{
  "plot": "<plot from step 1>",
  "title": "The Dark Truth"
}
```

### Step 3: Generate Images
```bash
POST /api/generate-image
{
  "plot": "<plot from step 1>",
  "style": "cinematic, noir lighting"
}
```

### Step 4: Generate Voice
```bash
POST /api/generate-voice
{
  "script": "<script from step 2>",
  "includeNarration": true,
  "voiceMapping": {
    "NARRATOR": "john",
    "SARAH": "rachel",
    "MARCUS": "josh"
  }
}
```

---

## 📊 **Response Standards**

All endpoints follow consistent response patterns:

### Success Response:
```json
{
  "success": true,
  "data": "...",
  "metadata": {
    "provider": "groq | cohere | huggingface | elevenlabs | google",
    "generatedAt": "ISO timestamp"
  }
}
```

### Error Response:
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "ISO timestamp"
}
```

---

## ⚠️ **Error Codes**

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Missing required fields, invalid input |
| 404 | Not Found | Audio file doesn't exist |
| 500 | Internal Server Error | API failure, network issues |

---

## 🔐 **Rate Limits & Quotas**

### ElevenLabs TTS:
- **Free Tier:** 10,000 characters/month
- **Fallback:** Unlimited Google TTS (basic quality)
- **Tracking:** Automatic usage tracking
- **Reset:** Monthly (1st of each month)

### Image Generation:
- **Free Tier:** Unlimited (Pollinations.ai)
- **Fallback:** Hugging Face Inference API

### Plot/Script Generation:
- **Free Tier:** Depends on LLM provider
- **Groq:** 14,400 requests/day, 6,000 tokens/min
- **Fallback:** Cohere → Hugging Face

---

## 🎯 **Best Practices**

1. **Check Usage Before Voice Generation:**
   ```javascript
   const usageResponse = await fetch('/api/generate-voice/usage');
   const { usage } = await usageResponse.json();
   console.log(`Remaining: ${usage.remaining} chars`);
   ```

2. **Handle Fallbacks Gracefully:**
   - System automatically falls back when primary providers fail
   - Check `metadata.provider` to see which service was used

3. **Error Handling:**
   ```javascript
   try {
     const response = await fetch('/api/generate-plot', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ genre: 'thriller', theme: '...' })
     });
     
     const data = await response.json();
     
     if (!data.success) {
       console.error('Error:', data.error);
       // Handle error
     }
   } catch (error) {
     console.error('Network error:', error);
   }
   ```

4. **Voice Mapping:**
   - Map character names EXACTLY as they appear in script
   - Use ALL CAPS for character names
   - Include narrator if using narration

---

## 📝 **Notes**

- All timestamps are in ISO 8601 format
- All text inputs are trimmed automatically
- Character limits vary by provider
- Audio files are stored in `voice-output/session-{timestamp}/`
- Usage tracking is automatic for ElevenLabs
- Monthly quotas reset automatically

---

## ✅ **Routes Summary**

| Endpoint | Method | Purpose | Authentication |
|----------|--------|---------|----------------|
| `/api/generate-plot` | POST | Generate 3-act plot | None |
| `/api/generate-script` | POST | Convert plot to screenplay | None |
| `/api/generate-image` | POST | Generate act images | None |
| `/api/generate-voice` | POST | Generate voice audio | None |
| `/api/generate-voice/usage` | GET | Get TTS usage stats | None |
| `/api/generate-voice/audio/:filename` | GET | Serve audio files | None |

---

**All routes are production-ready with:**
✅ Input validation  
✅ Error handling  
✅ Consistent responses  
✅ Detailed logging  
✅ Fallback providers  
✅ Usage tracking (voice)  

**Your API is ready to use!** 🚀
