# PlotTwist+ Narration Feature Guide

## ✅ **Feature Added: Narration Support!**

Your TTS engine now supports **TWO MODES**:

---

## 🎭 **Mode 1: Dialogue Only** (Original)

**What it does:** Extracts only character dialogue

```javascript
const results = await generateScriptVoices(script, {
    includeNarration: false  // ← Default mode
});
```

**Example Output:**
```
[Audio] SARAH: "Something doesn't add up."
[Audio] MARCUS: "I found something."
[Audio] SARAH: "What is it?"
```

✅ **Use when:** You want just conversations  
❌ **Missing:** Scene descriptions, actions, context

---

## 📖 **Mode 2: With Narration** (NEW!)

**What it does:** Includes action lines with dialogue for full audiobook experience

```javascript
const results = await generateScriptVoices(script, {
    includeNarration: true,         // ← Enable narration
    narratorVoice: 'arnold',        // ← Deep voice for actions
    voiceMapping: {
        'NARRATOR': 'arnold',       // ← Voice for action lines
        'SARAH CHEN': 'rachel',
        'MARCUS REED': 'sam'
    }
});
```

**Example Output:**
```
[Audio - NARRATOR/Arnold] "A dimly lit office. Rain patters against the window."
[Audio - Sarah/Rachel] "Something doesn't add up here."
[Audio - NARRATOR/Arnold] "The door bursts open. Marcus enters."
[Audio - Marcus/Sam] "I found something!"
```

✅ **Use when:** You want complete audiobook experience  
✅ **Includes:** Everything - scenes, actions, dialogue

---

## 🎙️ **Current Behavior**

Based on your `buildScriptPrompt()` format, action lines appear mixed with dialogue:

```
SARAH CHEN
Something doesn't add up.

The door bursts open. Marcus enters.

MARCUS REED
I found something!
```

**With `includeNarration: true`:**
- Action lines are included in the audio
- They're read by either the last speaking character OR as separate narration
- Creates fuller audio experience

---

## 🎯 **Recommended Setup**

### **For Full Audiobook Experience:**

```javascript
const voiceMapping = {
    'NARRATOR': 'arnold',        // Deep male for action/narration
    'FEMALE_CHARACTER': 'rachel', // Calm female
    'MALE_CHARACTER': 'josh',     // Young male
    'VILLAIN': 'sam'             // Raspy, mysterious
};

const results = await generateScriptVoices(script, {
    provider: 'auto',
    includeNarration: true,      // ← Include all action lines
    narratorVoice: 'arnold',     // ← Deep voice for narration
    voiceMapping: voiceMapping
});
```

---

## 🔊 **Voice Recommendations**

### **Best Narrator Voices:**
- **`arnold`** ✅ - Crisp, authoritative (like movie trailers)
- **`adam`** - Deep, mature (classic narrator)
- **`antoni`** - Well-rounded, balanced
- **`rachel`** - Calm female narrator (for female-led stories)
- **`domi`** - Strong female narrator

### **Character Voices:**
- **Male Heroes:** `josh` (young), `antoni` (balanced)
- **Male Villains:** `sam` (raspy), `arnold` (powerful)
- **Female Heroes:** `rachel` (calm), `bella` (soft)
- **Female Villains:** `domi` (strong), `elli` (dramatic)

---

## 📊 **Comparison**

| Feature | Dialogue Only | With Narration |
|---------|---------------|----------------|
| **Speed** | Faster (fewer files) | Slower (more audio) |
| **Cost** | Lower (fewer chars) | Higher (more chars) |
| **Quality** | Missing context | Complete story |
| **Use Case** | Quick demos | Production audiobooks |
| **Immersion** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 💡 **Examples**

### **Example 1: Detective Story**
```javascript
const voices = {
    'NARRATOR': 'arnold',           // Deep narrator
    'DETECTIVE SARAH': 'rachel',    // Female lead
    'SUSPECT JOHN': 'sam'           // Mysterious suspect
};

await generateScriptVoices(detectiveScript, {
    includeNarration: true,
    narratorVoice: 'arnold',
    voiceMapping: voices
});
```

### **Example 2: Romance**
```javascript
const voices = {
    'NARRATOR': 'rachel',  // Female narrator for romance
    'EMMA': 'bella',       // Soft female lead
    'JAMES': 'antoni'      // Balanced male lead
};

await generateScriptVoices(romanceScript, {
    includeNarration: true,
    narratorVoice: 'rachel',
    voiceMapping: voices
});
```

### **Example 3: Action Thriller**
```javascript
const voices = {
    'NARRATOR': 'arnold',  // Powerful narrator
    'HERO': 'josh',        // Energetic hero
    'VILLAIN': 'sam'       // Raspy villain
};

await generateScriptVoices(thrillerScript, {
    includeNarration: true,
    narratorVoice: 'arnold',
    voiceMapping: voices
});
```

---

## 🎬 **What You Get**

### **Without Narration:**
```
📁 voice-output/
├── 001_SARAH.mp3    - "Something's wrong."
├── 002_MARCUS.mp3   - "I found evidence."
└── 003_SARAH.mp3    - "Show me."
```
**Result:** Just dialogue (like a phone conversation)

### **With Narration:**
```
📁 voice-output/
├── 000_NARRATOR.mp3 - "A dimly lit office. Rain falls..."
├── 001_SARAH.mp3    - "Something's wrong."
├── 002_NARRATOR.mp3 - "The door bursts open..."
├── 003_MARCUS.mp3   - "I found evidence."
├── 004_NARRATOR.mp3 - "He places it on the desk..."
└── 005_SARAH.mp3    - "Show me."
```
**Result:** Complete audiobook experience!

---

## ✅ **Current Status**

✅ **Narration support added**  
✅ **Multiple voice actors**  
✅ **Narrator voice customization**  
✅ **Automatic fallback (ElevenLabs → Google TTS)**  
✅ **Production ready**

---

## 🚀 **Quick Start**

```javascript
// Simple: Just dialogue
await generateScriptVoices(script);

// Advanced: With narration
await generateScriptVoices(script, {
    includeNarration: true,
    narratorVoice: 'arnold',
    voiceMapping: {
        'NARRATOR': 'arnold',
        'CHARACTER1': 'rachel',
        'CHARACTER2': 'josh'
    }
});
```

---

**Your TTS system now supports full audiobook production!** 🎙️📖
