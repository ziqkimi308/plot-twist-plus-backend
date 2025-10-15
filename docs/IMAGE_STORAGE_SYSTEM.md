# Image Storage System - Save to Disk ✅

## Date: October 15, 2025

## Problem with Previous Approach

### Issues with External URLs & Base64

1. **Pollinations.ai** - Unreliable, fails often, images keep changing
2. **Base64 in JSON** - Large payload sizes, slow transfers
3. **No persistence** - Images lost when browser closes
4. **Network dependency** - Required internet for every load

## New Approach: Save to Disk

### Directory Structure

```
backend/
  data/
    pictures/
      picture-act-one/
        I_1728974123456.png
        I_1728974234567.png
      picture-act-two/
        II_1728974345678.png
        II_1728974456789.png
      picture-act-three/
        III_1728974567890.png
        III_1728974678901.png
```

### How It Works

#### 1. Image Generation (`backend/utils/imageEngine.js`)

```javascript
// When generating images:
1. Create act-specific folder (picture-act-one, picture-act-two, picture-act-three)
2. Generate image from Pollinations.ai/HuggingFace/Fallback
3. Download image as Buffer
4. Save to disk with timestamp filename: `{act}_{timestamp}.png`
5. Return local URL: `/api/images/picture-act-one/I_1728974123456.png`
```

#### 2. Image Serving (`backend/server.js`)

```javascript
// Static file server for images
app.use(
	"/api/images",
	express.static(path.join(__dirname, "data", "pictures"))
);

// Example URLs:
// http://localhost:3000/api/images/picture-act-one/I_1728974123456.png
// http://localhost:3000/api/images/picture-act-two/II_1728974234567.png
// http://localhost:3000/api/images/picture-act-three/III_1728974345678.png
```

#### 3. Frontend Usage

```javascript
// Images come from backend as local URLs
<img src="/api/images/picture-act-one/I_1728974123456.png" />

// Or with full URL:
<img src="http://localhost:3000/api/images/picture-act-one/I_1728974123456.png" />
```

## Implementation Details

### Modified Files

#### 1. `backend/utils/imageEngine.js`

**Added**:

- Import `fs`, `path` for file operations
- `IMAGE_BASE_DIR` constant
- Folder creation logic
- Image saving logic
- Functions now return Buffers instead of URLs

**Changes**:

```javascript
// BEFORE: Return external URL
return imageUrl; // "https://image.pollinations.ai/..."

// AFTER: Download and save, return local URL
fs.writeFileSync(filepath, imageBuffer);
return `/api/images/${actFolder}/${filename}`;
```

#### 2. `backend/server.js`

**Added**:

```javascript
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static images
app.use(
	"/api/images",
	express.static(path.join(__dirname, "data", "pictures"))
);
```

### Image Response Format

**Before** (external URL):

```json
{
	"act": "I",
	"imageUrl": "https://image.pollinations.ai/prompt/...",
	"provider": "pollinations.ai"
}
```

**After** (local file):

```json
{
	"act": "I",
	"imageUrl": "/api/images/picture-act-one/I_1728974123456.png",
	"localPath": "E:/.../ backend/data/pictures/picture-act-one/I_1728974123456.png",
	"provider": "pollinations.ai"
}
```

## Benefits

### 1. ✅ **Reliability**

- Images saved locally, no external dependency
- Works offline after initial generation
- No "image not found" errors

### 2. ✅ **Performance**

- Fast loading from local disk
- No network latency
- Smaller JSON payloads (URL vs base64)

### 3. ✅ **Persistence**

- Images persist across sessions
- Can reuse images for same story
- Build up library of generated images

### 4. ✅ **Consistency**

- Same image every time
- No random changes
- Predictable behavior

### 5. ✅ **Scalability**

- Easy to manage with file system
- Can implement cleanup scripts
- Can add caching layer

## Usage

### Generate Images (Automatic)

```bash
# When generating story, images are automatically saved
POST /api/generate-image
{
  "plot": "..."
}

# Response includes local URLs
{
  "images": [
    {
      "act": "I",
      "imageUrl": "/api/images/picture-act-one/I_1728974123456.png",
      "localPath": "..."
    },
    ...
  ]
}
```

### Access Images (Frontend)

```javascript
// In ProductPlayer.jsx
<img
	src={image.imageUrl} // "/api/images/picture-act-one/I_1728974123456.png"
	alt={`Act ${index + 1}`}
/>

// Browser fetches from:
// http://localhost:3000/api/images/picture-act-one/I_1728974123456.png
```

### Direct Access (Browser)

```
http://localhost:3000/api/images/picture-act-one/I_1728974123456.png
http://localhost:3000/api/images/picture-act-two/II_1728974234567.png
http://localhost:3000/api/images/picture-act-three/III_1728974345678.png
```

## File Naming Convention

```
Format: {ACT}_{TIMESTAMP}.png

Examples:
- I_1728974123456.png    (Act I/ONE)
- II_1728974234567.png   (Act II/TWO)
- III_1728974345678.png  (Act III/THREE)

Why timestamp?
- Unique filenames
- No overwrite conflicts
- Chronological sorting
- Easy cleanup (delete old)
```

## Cleanup Strategy (Future)

```javascript
// Optional: Clean up old images
// Delete images older than 7 days
const cleanupOldImages = () => {
	const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
	const now = Date.now();

	fs.readdirSync(actFolder).forEach((file) => {
		const timestamp = parseInt(file.split("_")[1]);
		if (now - timestamp > maxAge) {
			fs.unlinkSync(path.join(actFolder, file));
		}
	});
};
```

## Error Handling

### Image Generation Fails

```javascript
// Falls back through providers:
1. Pollinations.ai (free, fast)
2. Hugging Face (requires API key)
3. Placeholder (always works)

// Even if all fail, fallback creates a placeholder
```

### File Save Fails

```javascript
// Returns error in response:
{
  "act": "I",
  "success": false,
  "error": "Failed to save image: ..."
}
```

### Image Not Found (404)

```javascript
// Frontend onError handler:
onError={(e) => {
  // Keep trying same source
  e.target.onerror = null;
}}
```

## Comparison

| Aspect          | Old (External URL)   | New (Local File) |
| --------------- | -------------------- | ---------------- |
| **Speed**       | Slow (network)       | Fast (disk)      |
| **Reliability** | ❌ Fails often       | ✅ Always works  |
| **Persistence** | ❌ Lost on close     | ✅ Saved forever |
| **Consistency** | ❌ Changes randomly  | ✅ Never changes |
| **Offline**     | ❌ Requires internet | ✅ Works offline |
| **Payload**     | Small (URL)          | Small (URL)      |
| **Storage**     | None                 | Disk space       |

## Status: ✅ FULLY IMPLEMENTED

### What Changed

1. ✅ Image generation saves to disk
2. ✅ Static file server added
3. ✅ Frontend uses local URLs
4. ✅ Directory structure created
5. ✅ Error handling implemented

### Testing

1. Generate a story
2. Check `backend/data/pictures/picture-act-*/`
3. See PNG files saved
4. Images load from local server
5. Same images on refresh

### Servers Running

```
✅ Backend: http://localhost:3000 (with /api/images endpoint)
✅ Frontend: http://localhost:5173
```

All changes applied and servers restarted! 🎬✨
