# 🎙️ Google Cloud TTS Deep Male Voice Options

## Quick Reference: Male Voices Ranked by Depth

### VERY DEEP VOICES (Best for Narrator)

1. **en-US-Wavenet-D** ⭐ DEEPEST ← **CURRENT DEFAULT**

   - Type: Wavenet (high quality)
   - Deepness: ⭐⭐⭐⭐⭐ (5/5)
   - Recommended pitch: -10.0 (very deep)
   - Recommended rate: 0.82 (slow, authoritative)
   - **Best for: Main narrator, very authoritative tone**

2. **en-US-Wavenet-B**

   - Type: Wavenet
   - Deepness: ⭐⭐⭐⭐ (4/5)
   - Recommended pitch: -9.0
   - Recommended rate: 0.85
   - Best for: Alternative narrator, slightly different tone

3. **en-US-Neural2-D**
   - Type: Neural2 (very high quality)
   - Deepness: ⭐⭐⭐⭐ (4/5)
   - Recommended pitch: -8.0
   - Recommended rate: 0.85
   - Best for: High-quality narrator, more natural

### MEDIUM-DEEP VOICES

4. **en-US-Neural2-J**

   - Type: Neural2
   - Deepness: ⭐⭐⭐ (3/5)
   - Recommended pitch: -7.0
   - Recommended rate: 0.87
   - Best for: Narrator, more conversational

5. **en-US-Wavenet-A**

   - Type: Wavenet
   - Deepness: ⭐⭐⭐ (3/5)
   - Recommended pitch: -6.0
   - Recommended rate: 0.88
   - Best for: Characters, balanced tone

6. **en-US-Neural2-A**
   - Type: Neural2
   - Deepness: ⭐⭐⭐ (3/5)
   - Recommended pitch: -6.0
   - Recommended rate: 0.88
   - Best for: Characters, natural

### LIGHTER MALE VOICES

7. **en-US-Studio-M**

   - Type: Studio (premium)
   - Deepness: ⭐⭐ (2/5)
   - Recommended pitch: -5.0
   - Recommended rate: 0.90
   - Best for: Younger characters

8. **en-US-Neural2-I**
   - Type: Neural2
   - Deepness: ⭐⭐ (2/5)
   - Recommended pitch: -4.0
   - Recommended rate: 0.92
   - Best for: Characters, expressive

---

## How to Change Narrator Voice

### Option 1: Edit ttsEngine.js (Permanent Change)

File: `backend/utils/ttsEngine.js`

```javascript
// Find this line (around line 517):
const gcpNarrator = "en-US-Wavenet-D"; // Current

// Change to another voice:
const gcpNarrator = "en-US-Neural2-D"; // Alternative

// And adjust settings:
const gcpNarratorSettings = {
	speakingRate: 0.85, // 0.82-0.92 (slower = more authoritative)
	pitch: -8.0, // -10 to -5 (lower = deeper)
};
```

### Option 2: Override in API Request (Temporary)

```javascript
await fetch("/api/generate-voice", {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({
		includeNarration: true,
		provider: "google-cloud-tts",
		voiceMapping: {
			NARRATOR: "en-US-Wavenet-D", // Override voice
		},
	}),
});
```

**Note**: When using option 2, the pitch/rate settings from `gcpNarratorSettings` will still apply!

---

## Pitch & Rate Guide

### Pitch Values (-20 to +20)

- `-20` to `-15`: Extremely deep (may sound unnatural)
- **`-10` to `-8`**: Very deep (great for narrator) ← **RECOMMENDED**
- `-7` to `-5`: Deep
- `-4` to `-2`: Slightly deeper
- `0`: Normal
- `+2` to `+5`: Higher/younger

### Speaking Rate Values (0.25 to 4.0)

- `0.70` to `0.80`: Very slow (dramatic)
- **`0.82` to `0.88`**: Slow, authoritative ← **RECOMMENDED FOR NARRATOR**
- `0.90` to `0.95`: Slightly slow
- `1.0`: Normal
- `1.05` to `1.15`: Faster (energetic)

---

## Testing Different Voices

1. **Quick test** (restart server after editing):

   ```bash
   cd backend
   # Edit ttsEngine.js, change gcpNarrator value
   node server.js
   ```

2. **Regenerate voice** from frontend:

   - Generate new story with narration enabled
   - Listen to `000_NARRATOR.mp3` in `data/voice/voice-act-one/`

3. **Compare**: Keep old files before regenerating to compare voices

---

## Current Configuration

**File**: `backend/utils/ttsEngine.js` (line ~517)

```javascript
const gcpNarrator = "en-US-Wavenet-D"; // VERY DEEP male narrator
const gcpNarratorSettings = {
	speakingRate: 0.82, // Very slow, authoritative
	pitch: -10.0, // Very deep tone
};
```

**Effect**: Produces the DEEPEST male narrator voice available in Google Cloud TTS.

---

## Troubleshooting

### "Voice still sounds female"

- Check: Make sure backend server restarted after editing
- Check: Confirm provider is "google-cloud-tts" (not "elevenlabs" or "google")
- Check: Verify GOOGLE_APPLICATION_CREDENTIALS is set
- Solution: Regenerate voice (delete old files first)

### "Voice is too deep/unnatural"

- Reduce pitch: Try -8.0 or -6.0 instead of -10.0
- Try different voice: en-US-Neural2-D is more natural
- Increase rate: Try 0.85 or 0.88 instead of 0.82

### "Voice is not deep enough"

- Increase pitch depth: Try -12.0 (but may sound robotic)
- Try en-US-Wavenet-D (deepest option)
- Reduce speaking rate: Try 0.80

---

## Summary

| Setting | Current Value     | Effect              |
| ------- | ----------------- | ------------------- |
| Voice   | `en-US-Wavenet-D` | Deepest male voice  |
| Pitch   | `-10.0`           | Very deep tone      |
| Rate    | `0.82`            | Slow, authoritative |

**Result**: Maximum depth male narrator for Google Cloud TTS ✅
