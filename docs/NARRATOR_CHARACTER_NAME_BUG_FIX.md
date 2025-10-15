# NARRATOR DIALOGUE MIXING BUG - FIXED

## Issue

The NARRATOR was reading character names and dialogue that should be separate. For example:

- NARRATOR would narrate: "...Dr. Crowley, a younger version, stands in a laboratory... DR. CROWLEY (urgently) We have to shut this down..."
- Instead of: NARRATOR narrating scene → DR. CROWLEY speaking dialogue separately

## Root Cause

The character name detection regex in `extractScriptWithNarration()` was:

```javascript
const characterMatch = trimmed.match(/^([A-Z][A-Z\s]+?)(\s*\(.*?\))?:?\s*$/);
```

This regex only matched capital letters and spaces `[A-Z\s]`, so it failed to match character names with periods like:

- `DR. CROWLEY`
- `MR. SMITH`
- `MRS. JONES`

When `DR. CROWLEY` wasn't recognized as a character name, the extraction logic treated it as narration and added it to `currentNarration` along with the dialogue that followed.

## Solution

Updated the regex to include periods for character titles:

```javascript
const characterMatch = trimmed.match(/^([A-Z][A-Z\s.]+?)(\s*\(.*?\))?:?\s*$/);
```

The change: `[A-Z\s]` → `[A-Z\s.]` allows periods in character names.

## Files Modified

1. **backend/utils/ttsEngine.js** (line 331)
   - Updated character detection regex to allow periods

## Verification

Created test scripts to verify the fix:

### test-extraction-debug.js

Line-by-line debugging showing:

```
Line 102: "DR. CROWLEY"
  → CHARACTER DETECTED: "DR. CROWLEY"
  → Regular character: DR. CROWLEY
  → Saving previous narration: "The scene shifts to an old security footage..."
  State: character="DR. CROWLEY", narration length=0, dialogue length=0

Line 103: "(urgently)"
  → Skipped parenthetical line

Line 104: "We have to shut this down. It's too much of a risk."
  → Adding to DR. CROWLEY's dialogue
```

### test-narrator-clean.js

Result:

```
✅ No character names or parentheticals found in NARRATOR blocks!
Total NARRATOR elements: 21
```

### Final Extraction

```
Order 27: NARRATOR - The scene shifts to an old security footage, grainy and flickering. Dr. Crowley, a younger version...
Order 28: DR. CROWLEY - We have to shut this down. It's too much of a risk.
Order 29: SCIENTIST - We can't stop now. We're so close.
```

## Impact

- ✅ NARRATOR now only narrates scene descriptions and actions
- ✅ Character dialogue is properly separated and assigned to the correct character
- ✅ Parenthetical directions like "(urgently)" are stripped from all dialogue
- ✅ Character names with titles (DR., MR., MRS.) are properly recognized

## Related Issues Fixed

This also fixes potential issues with other titled characters like:

- MR. JOHN
- MRS. MARRY
- DR. EMILY (if she had a title in the script)

Date: $(date)
Status: ✅ RESOLVED
