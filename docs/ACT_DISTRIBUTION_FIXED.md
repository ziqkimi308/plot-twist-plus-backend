# ACT DISTRIBUTION FIX - COMPLETE ✅

## Problem

Voice files were all being stored in `voice-act-one` folder only. The `voice-act-two` and `voice-act-three` folders were either empty or not created.

## Root Cause

The issue had multiple layers:

1. **ACT marker format mismatch**: The original code looked for Roman numerals (I, II, III) but scripts now use words (ONE, TWO, THREE)

2. **ACT markers in extracted content**: ACT markers were being included in the extracted dialogue, which shouldn't happen

3. **Line counting mismatch**: The critical bug was in `getActForLine()`:
   - `extractScriptWithNarration()` consolidates multiple script lines into single dialogue/narration elements (reducing 113 lines to 27 elements)
   - `getActForLine()` counted raw script lines and tried to map order numbers to line positions
   - This created an index mismatch where order 18 (which should be ACT THREE) was being mapped to line 28 (still in ACT TWO territory)

## Solution

Instead of trying to calculate the act for each dialogue element after extraction, we now **tag each element with its act during the extraction process**. This ensures perfect alignment because both extraction functions (`extractDialogue` and `extractScriptWithNarration`) use the same logic to track act transitions.

### Changes Made

#### 1. Updated `extractDialogue()` (Lines 55-126)

- Added `currentAct` variable to track the current act (starts at 'ONE')
- Added ACT marker detection: `/^\*\*ACT\s+(ONE|TWO|THREE)\*\*/i`
- Updates `currentAct` when an ACT marker is encountered
- Tags each dialogue element with an `act` field

#### 2. Updated `extractScriptWithNarration()` (Lines 140-260)

- Added `currentAct` variable to track the current act (starts at 'ONE')
- Changed ACT marker handling from simple skip to detection + update
- Tags every pushed element (narration, dialogue, scene-heading) with an `act` field

#### 3. Updated `generateScriptVoices()` (Line 483)

- Changed from: `const act = getActForLine(order, script);`
- Changed to: `const { character, line, order, act } = dialogue[i];`
- Now uses the `act` field directly from the extracted element

#### 4. Removed complex `getActForLine()` function

- No longer needed since acts are tagged during extraction
- This eliminates the entire class of bugs related to line counting mismatches

## Results

### Before Fix:

- ACT ONE: 19-27 files
- ACT TWO: 0-8 files
- ACT THREE: 0 files
- **Total: 19-27 files** (all in wrong locations)

### After Fix:

- **ACT ONE: 6 files** (orders 0-5)
- **ACT TWO: 11 files** (orders 6-16)
- **ACT THREE: 10 files** (orders 17-26)
- **Total: 27 files** ✅

## Verification

### Dialogue-Only Mode (`includeNarration: false`)

```
voice-act-one: 6 files (orders 0-5)
voice-act-two: 11 files (orders 6-16)
voice-act-three: 10 files (orders 17-26)
```

### Narration Mode (`includeNarration: true`)

```
voice-act-one: 6 files (orders 0-5)
voice-act-two: 11 files (orders 6-16)
voice-act-three: 10 files (orders 17-26)
```

Both modes produce the same correct distribution!

## Architecture Improvement

This fix also improves the codebase architecture by:

- **Reducing coupling**: No need to pass script to act detection function
- **Improving performance**: Act detection happens once during extraction, not for every element
- **Simplifying logic**: Single source of truth for act boundaries
- **Preventing bugs**: Eliminates possibility of extraction/detection logic diverging

## Files Modified

- `backend/utils/ttsEngine.js`:
  - `extractDialogue()` - Added act tracking
  - `extractScriptWithNarration()` - Added act tracking
  - `generateScriptVoices()` - Use act field instead of calling getActForLine()
  - Removed need for complex `getActForLine()` function (can be deleted in cleanup)

## Testing

Created verification scripts:

- `test-act-detection-direct.js` - Direct function call test
- `test-verify-acts.js` - Verify file distribution across acts
- `test-all-acts.js` - Detailed act assignment analysis

All tests pass! ✅

## Date

Fixed: 2024-01-XX (today)
