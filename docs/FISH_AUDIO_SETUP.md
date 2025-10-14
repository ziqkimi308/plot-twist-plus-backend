# Fish Audio TTS Setup Guide

## ✅ **Fish Audio Added as Secondary TTS Provider!**

Fish Audio is now integrated into your TTS system as the **second fallback** option.

---

## 🎯 **Fallback Order**

```
1. ElevenLabs (Primary)     → 10,000 chars/month ⭐
   ↓ (if fails)
2. Fish Audio (Secondary)   → 8,000 credits/month ⭐⭐ NEW!
   ↓ (if fails)
3. Google TTS (Tertiary)    → Unlimited, basic quality
```

---

## 🎙️ **Fish Audio Benefits**

✅ **FREE Tier:** 8,000 credits per month  
✅ **Studio Quality:** Professional audiobook-grade voices  
✅ **Multiple Voices:** 1000+ voices in 70+ languages  
✅ **Better than Google TTS:** More natural sound  
✅ **Automatic Fallback:** Kicks in if ElevenLabs fails  

---

## 🚀 **Setup Instructions**

### **1. Sign Up (FREE)**

1. Go to: https://fish.audio/auth/signup
2. Fill in details and verify your account
3. Log in to Fish Audio dashboard

### **2. Get API Key**

1. Navigate to: https://fish.audio/app/api-keys
2. Click "Create New Key"
3. Give it a name (e.g., "PlotTwist+")
4. Copy your API key

### **3. Add to `.env` File**

```bash
# Fish Audio API Key (8k credits/month free)
# Get free key at: https://fish.audio/auth/signup
FISHAUDIO_API_KEY=your_api_key_here
```

---

## 💡 **Usage**

### **Automatic (Recommended)**
Fish Audio automatically works as a fallback:

```javascript
await generateScriptVoices(script, {
    includeNarration: true
});

// Fallback order:
// 1. Tries ElevenLabs
// 2. If fails → Tries Fish Audio
// 3. If fails → Uses Google TTS
```

### **Force Fish Audio Only**
```javascript
await generateScriptVoices(script, {
    provider: 'fishaudio',  // ← Force Fish Audio
    includeNarration: true
});
```

---

## 📊 **Comparison**

| Feature | ElevenLabs | Fish Audio | Google TTS |
|---------|------------|------------|------------|
| **Quality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Natural Sound** | Very natural | Natural | Robotic |
| **Free Tier** | 10k chars/mo | 8k credits/mo | Unlimited |
| **Voice Variety** | 12 voices | 1000+ voices | 1 voice |
| **Setup** | API key | API key | None |
| **Best For** | Production | Backup/variety | Last resort |

---

## 🎭 **Voice Features**

### **ElevenLabs (Primary):**
- ✅ Custom voices (John, Josh, Rachel, etc.)
- ✅ Voice mapping per character
- ✅ Best quality

### **Fish Audio (Secondary):**
- ✅ Studio-grade quality
- ✅ 1000+ voice library
- ✅ 70+ languages
- ✅ Default model: `s1` (best quality)

### **Google TTS (Tertiary):**
- ✅ Always available
- ✅ Never requires setup
- ⚠️ Basic quality

---

## 🔄 **How Fallback Works**

```javascript
// Example generation flow:

Generating audio 1/10: NARRATOR
   Trying ElevenLabs (voice: john)...
   ✅ ElevenLabs success

Generating audio 2/10: SARAH CHEN
   Trying ElevenLabs (voice: rachel)...
   ❌ ElevenLabs failed: Rate limit exceeded
   Trying Fish Audio...
   ✅ Fish Audio success

Generating audio 3/10: MARCUS REED
   Trying ElevenLabs (voice: josh)...
   ❌ ElevenLabs failed: API quota exceeded
   Trying Fish Audio...
   ❌ Fish Audio failed: Monthly limit reached
   Trying Google TTS...
   ✅ Google TTS success
```

**Result:** You get audio files no matter what! 🎉

---

## 💰 **Cost Breakdown**

### **Free Tier Limits:**

**ElevenLabs:**
- 10,000 characters/month
- Resets monthly
- ~5-10 minutes of audio

**Fish Audio:**
- 8,000 credits/month
- Resets monthly
- ~4-8 minutes of audio

**Google TTS:**
- Unlimited forever
- Free always

**Total FREE:** ~10-20 minutes of high-quality audio/month + unlimited basic audio!

---

## 🎯 **Example Configuration**

```javascript
// .env file
ELEVENLABS_API_KEY=sk_xxx...      // Primary (10k chars/mo)
FISHAUDIO_API_KEY=fa_xxx...       // Secondary (8k credits/mo)
// No Google TTS key needed         // Tertiary (unlimited)

// Usage
const results = await generateScriptVoices(script, {
    provider: 'auto',              // Auto-fallback enabled
    includeNarration: true,
    narratorVoice: 'john',
    voiceMapping: {
        'NARRATOR': 'john',
        'SARAH': 'rachel',
        'MARCUS': 'josh'
    }
});

// Results will use:
// - ElevenLabs for most voices (high quality)
// - Fish Audio if ElevenLabs fails (good quality)
// - Google TTS as last resort (basic quality)
```

---

## 📝 **API Reference**

### **Fish Audio API**
- **Endpoint:** `https://api.fish.audio/v1/tts`
- **Model:** `s1` (default, best quality)
- **Format:** MP3
- **Documentation:** https://docs.fish.audio

### **Request Example:**
```bash
curl -X POST https://api.fish.audio/v1/tts \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello from Fish Audio!",
    "format": "mp3"
  }' \
  --output audio.mp3
```

---

## ✅ **Summary**

✅ **Fish Audio integrated** as 2nd fallback  
✅ **8,000 free credits/month**  
✅ **Studio-grade quality**  
✅ **Automatic fallback system**  
✅ **3-tier protection:** ElevenLabs → Fish Audio → Google TTS  

**Your TTS system now has triple redundancy with two high-quality options!** 🎙️✨

---

## 🔗 **Useful Links**

- **Sign Up:** https://fish.audio/auth/signup
- **Get API Key:** https://fish.audio/app/api-keys
- **Documentation:** https://docs.fish.audio
- **Pricing:** https://fish.audio/plan/
- **Voice Library:** https://fish.audio/app/discovery/
