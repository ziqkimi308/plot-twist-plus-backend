# PlotTwist+ Voice Reference Guide

## 🎙️ **Available ElevenLabs Voices**

### **Male Voices**

| Name | Voice ID | Description | Best For |
|------|----------|-------------|----------|
| **john** ⭐ | `EiNlNiXeDU1pqqOPrYMO` | John Doe - Deep narrator | **NARRATOR (Default)** |
| **josh** ✅ | `TxGEqnHWrfWFTfGW9XjX` | Young, energetic | Marcus-type characters |
| **nigel** | `adZJnAl6IYZw4EYI9FVd` | Nigel Graves - Professional | Main characters |
| **adam** | `pNInz6obpgDQGcFmaJgB` | Deep, mature | Older characters |
| **antoni** | `ErXwobaYiN019PkySvjV` | Well-rounded | Balanced characters |
| **arnold** | `VR6AewLTigWG4xSOukaG` | Crisp, resonant | Authority figures |
| **sam** | `yoZ06aMxZJJ28mfd3POQ` | Raspy, dynamic | Mysterious/rough |

### **Female Voices**

| Name | Voice ID | Description | Best For |
|------|----------|-------------|----------|
| **rachel** | `21m00Tcm4TlvDq8ikWAM` | Calm, articulate | Female leads/detectives |
| **bella** | `EXAVITQu4vr4xnSDxMaL` | Soft, well-rounded | Gentle characters |
| **elli** | `MF3mGyEYCl7XYWbV9V6O` | Emotional, expressive | Dramatic characters |
| **domi** | `AZnzlk1XvdvUeBnXmlld` | Strong, confident | Powerful women |
| **dorothy** | `ThT5KcBeYPX3keUQqHPh` | Pleasant, conversational | Friendly characters |

---

## ✅ **Current Default Setup**

```javascript
// Default configuration
const defaultVoices = {
    NARRATOR: 'john',      // John Doe - Deep narrator
    DEFAULT: 'adam'        // Fallback for unmapped characters
};
```

---

## 🎭 **Recommended Voice Mappings**

### **Detective Story**
```javascript
const voiceMapping = {
    'NARRATOR': 'john',           // Deep narrator
    'DETECTIVE SARAH': 'rachel',  // Calm female
    'DETECTIVE MARCUS': 'josh',   // Young energetic ✅
    'SUSPECT': 'nigel',           // Professional
    'WITNESS': 'bella'            // Soft female
};
```

### **Action Thriller**
```javascript
const voiceMapping = {
    'NARRATOR': 'john',      // Deep narrator
    'HERO': 'arnold',        // Powerful
    'VILLAIN': 'sam',        // Raspy
    'ALLY': 'josh',          // Energetic ✅
    'FEMALE LEAD': 'domi'    // Strong
};
```

### **Drama/Romance**
```javascript
const voiceMapping = {
    'NARRATOR': 'john',      // Deep narrator
    'MALE LEAD': 'nigel',    // Professional
    'FEMALE LEAD': 'rachel', // Calm
    'BEST FRIEND': 'josh',   // Energetic ✅
    'RIVAL': 'elli'          // Expressive
};
```

### **Mystery**
```javascript
const voiceMapping = {
    'NARRATOR': 'john',           // Deep narrator
    'INVESTIGATOR': 'nigel',      // Professional
    'VICTIM': 'bella',            // Soft
    'DETECTIVE MARCUS': 'josh',   // Young energetic ✅
    'KILLER': 'sam'               // Mysterious
};
```

---

## 💡 **Usage Examples**

### **Example 1: Simple (Default Narrator)**
```javascript
await generateScriptVoices(script, {
    includeNarration: true,
    voiceMapping: {
        'SARAH CHEN': 'rachel',
        'MARCUS REED': 'josh'
    }
    // NARRATOR automatically uses 'john' (default)
});
```

### **Example 2: Custom Narrator**
```javascript
await generateScriptVoices(script, {
    includeNarration: true,
    narratorVoice: 'nigel',  // Override default
    voiceMapping: {
        'NARRATOR': 'nigel',
        'SARAH': 'rachel',
        'MARCUS': 'josh'
    }
});
```

### **Example 3: Multiple Characters**
```javascript
await generateScriptVoices(script, {
    includeNarration: true,
    voiceMapping: {
        'NARRATOR': 'john',      // Deep narrator
        'HERO': 'nigel',         // Professional male
        'SIDEKICK': 'josh',      // Young energetic ✅
        'FEMALE LEAD': 'rachel', // Calm female
        'VILLAIN': 'sam',        // Raspy
        'ASSISTANT': 'bella'     // Soft female
    }
});
```

---

## 🎯 **Character Type Guide**

### **When to Use Each Voice:**

**John (Narrator):**
- ✅ Narration/Action descriptions
- ✅ Scene settings
- ✅ Deep, authoritative voice

**Josh (Energetic):**
- ✅ Young protagonists
- ✅ Enthusiastic sidekicks
- ✅ Energetic characters like Marcus
- ✅ Action heroes

**Nigel (Professional):**
- ✅ Main protagonists
- ✅ Professional characters
- ✅ Intelligent/sophisticated roles
- ✅ Business/corporate characters

**Rachel (Female Lead):**
- ✅ Female detectives
- ✅ Professional women
- ✅ Calm protagonists
- ✅ Leaders

**Sam (Mysterious):**
- ✅ Villains
- ✅ Mysterious characters
- ✅ Rough/tough personalities
- ✅ Anti-heroes

---

## ⚙️ **Voice Settings (Advanced)**

```javascript
// Custom voice settings for ElevenLabs
await generateScriptVoices(script, {
    voiceMapping: {
        'CHARACTER': 'josh'
    },
    // Advanced: Override voice settings
    voiceSettings: {
        stability: 0.5,          // 0-1 (higher = more stable)
        similarity_boost: 0.75   // 0-1 (higher = more similar to original)
    }
});
```

---

## 📊 **Voice Comparison**

| Use Case | Best Voice | Alternative |
|----------|------------|-------------|
| **Narrator** | john ⭐ | nigel |
| **Young Hero** | josh ✅ | antoni |
| **Female Lead** | rachel | domi |
| **Villain** | sam | arnold |
| **Professional** | nigel | adam |
| **Energetic** | josh ✅ | antoni |
| **Authority** | arnold | adam |
| **Gentle** | bella | dorothy |

---

## 🚀 **Quick Reference**

```javascript
// Your standard setup
const standardVoices = {
    'NARRATOR': 'john',    // ⭐ Deep narrator (default)
    'MARCUS': 'josh',      // ✅ Energetic (you like this!)
    'SARAH': 'rachel',     // Calm female lead
    'VILLAIN': 'sam',      // Mysterious
    'HERO': 'nigel'        // Professional main character
};

await generateScriptVoices(script, {
    includeNarration: true,
    voiceMapping: standardVoices
});
```

---

## ✅ **Summary**

- **Default Narrator:** `john` (John Doe - Deep)
- **Marcus Voice:** `josh` (Young, energetic) ✅
- **Nigel:** Available for main characters
- **Total Voices:** 12 (7 male, 5 female)

**All voices are from ElevenLabs free tier!**
