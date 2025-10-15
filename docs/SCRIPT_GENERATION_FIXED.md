# Script Generation Fixed - Complete

## Date: October 15, 2025

## Problem Summary

The script generation was producing imbalanced act files with most content ending up in ACT THREE, and the AI was generating unwanted "ACT" references beyond the main act headers.

## Root Causes

1. **Missing Act Markers in Plot Input**: The plot text was being sent to the AI without clear act boundaries, causing the AI to misinterpret the structure
2. **Prompt Contained "Act Two/Three" References**: The prompt instructions used phrases like "propels the story into Act Two" which taught the AI to use "ACT" in descriptive text
3. **No Content Distribution Guidance**: The AI wasn't instructed to maintain balanced content across all three acts

## Solutions Implemented

### 1. Added Clear Act Markers to Plot Input

**File**: `backend/utils/scriptGenerator.js`

Changed from:

```javascript
const fullPlot = `${actOnePlot}\n\n${actTwoPlot}\n\n${actThreePlot}`;
```

To:

```javascript
const fullPlot = `**ACT ONE - SETUP**
${actOnePlot}

**ACT TWO - CONFRONTATION**
${actTwoPlot}

**ACT THREE - RESOLUTION**
${actThreePlot}`;
```

This ensures the AI understands the clear act structure from the input.

### 2. Removed Unwanted "ACT" References from Prompts

**File**: `backend/utils/promptBuilder.js`

**Plot Prompt Changes**:

- Removed phrases like "propels the story into Act Two"
- Removed phrases like "leads to Act Three"
- Changed to "propels the story into the second part"
- Changed to "leads to the third part"
- Added CRITICAL OUTPUT FORMAT REQUIREMENTS section

**Script Prompt Changes**:

- Added explicit instruction: "Distribute content evenly across all three acts"
- Added per-act content requirements
- Specified "Do NOT put plot elements from earlier acts into ACT THREE"
- Removed example text that referenced "Act Two" or "Act Three"

### 3. Enhanced Splitting Logic

**File**: `backend/utils/scriptGenerator.js`

The splitting regex already uses capturing groups to preserve headers:

```javascript
const actMatches = scriptText.split(
	/((?:^|\n)\*\*ACT\s*(?:ONE|TWO|THREE)\*\*)/gim
);
```

This correctly:

- Matches only standalone act headers at line boundaries
- Avoids matching embedded text like "ACT ONE CONCLUSION"
- Preserves the headers in the split result
- Pairs headers with their content during reconstruction

## Verification Results

### Test 1: Science Fiction Story

```
✓ plot-act-one.txt (2.2K)
✓ plot-act-two.txt (2.1K)
✓ plot-act-three.txt (1.4K)
✓ script-act-one.txt (30 lines, 2.2K)
✓ script-act-two.txt (44 lines, 2.1K)
✓ script-act-three.txt (48 lines, 2.0K)
✓ Only 3 ACT markers found (expected)
```

### Test 2: Mystery Story

```
✓ plot-act-one.txt (1957 bytes)
✓ plot-act-two.txt (2362 bytes)
✓ plot-act-three.txt (1268 bytes)
✓ script-act-one.txt (43 lines, 2625 bytes)
✓ script-act-two.txt (55 lines, 2274 bytes)
✓ script-act-three.txt (51 lines, 1809 bytes)
✓ Only 3 ACT markers found (expected)
```

## Success Criteria Met

✅ All plot files generated (act-one, act-two, act-three, complete)
✅ All script files generated (act-one, act-two, act-three, complete)
✅ Balanced content distribution across acts
✅ Only 3 standalone "ACT" occurrences (the headers)
✅ No unwanted "ACT" references in descriptive text
✅ Proper NARRATOR and CHARACTER formatting maintained
✅ Act markers use word format (ONE, TWO, THREE) not Roman numerals

## Files Modified

1. `backend/utils/promptBuilder.js`

   - Updated `buildPlotPrompt()` to remove "Act Two/Three" references
   - Updated `buildScriptPrompt()` to add content distribution guidance
   - Added CRITICAL OUTPUT FORMAT REQUIREMENTS sections

2. `backend/utils/scriptGenerator.js`
   - Updated plot concatenation to include act markers
   - Changed console logging to show truncated preview instead of full text

## Testing Instructions

To verify the fix works:

1. Clean data directories:

   ```bash
   rm -rf backend/data/plot/* backend/data/script/*
   ```

2. Generate plot:

   ```bash
   curl -X POST http://localhost:3000/api/generate-plot \
     -H "Content-Type: application/json" \
     -d '{"genre":"thriller","characters":"Detective and suspect","setting":"city"}'
   ```

3. Generate script:

   ```bash
   curl -X POST http://localhost:3000/api/generate-script \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

4. Verify files:
   ```bash
   ls -lh backend/data/plot/
   ls -lh backend/data/script/
   wc -l backend/data/script/script-act-*.txt
   grep -iw "act" backend/data/script/script-complete.txt
   ```

Expected output: Only 3 lines with ACT headers should appear.

## Future Improvements

1. Consider adding minimum/maximum line counts per act to ensure consistency
2. Add automated tests to validate act balance
3. Monitor AI output over time to ensure prompt changes remain effective
4. Consider adding act length guidelines to the prompt (e.g., "Each act should be approximately X lines")

## Status: ✅ COMPLETE

All scripts are now generated correctly with balanced content and clean act markers.
