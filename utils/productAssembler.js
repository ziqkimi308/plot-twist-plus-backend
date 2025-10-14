/**
 * Product Assembler Utility
 * Handles creation and organization of final product assets (images, script, audio)
 */

/**
 * Assemble product data by combining script, images, and audio
 * @param {string} script - Full screenplay text
 * @param {Array} images - Array of image objects (3 images, one per act)
 * @param {Array} audioFiles - Array of audio file objects
 * @returns {Object} Product data with organized assets
 */
export function assembleProduct(script, images = [], audioFiles = []) {
	console.log('Assembling product data...');
	console.log('Script type:', typeof script);
	console.log('Script value:', script);
	console.log('Script length:', script?.length || 0);
	console.log('Images count:', images?.length || 0);
	console.log('Audio files count:', audioFiles?.length || 0);

	// Ensure script is a string
	if (typeof script !== 'string') {
		console.error('Script is not a string! Converting to string...');
		script = String(script || '');
	}

	// Parse script into acts and scenes
	const acts = parseScriptIntoActs(script);

	// Create timing data based on script content
	const timing = generateTiming(acts, audioFiles);

	// Match images to acts
	const actImages = matchImagesToActs(images, acts);

	// Generate product assets
	const productAssets = generateProductAssets(acts, actImages, audioFiles, timing);

	return {
		plot: script, // Full script as plot
		script: script,
		images: images,
		audioFiles: audioFiles,
		assets: productAssets,
		metadata: {
			totalFiles: images.length + audioFiles.length + 2, // +2 for plot and script
			generatedAt: new Date().toISOString()
		}
	};
}

/**
 * Generate playback instructions for the product
 * @param {Object} productData - Generated product data
 * @returns {Object} Playback instructions and controls
 */
export function generatePlaybackInstructions(productData) {
	const { assets, metadata } = productData;

	return {
		instructions: {
			totalFiles: metadata.totalFiles,
			format: "presentation",
			fileTypes: {
				plot: "Plot text file",
				script: "Script text file",
				images: "Image files",
				audio: "Audio files"
			}
		},
		metadata
	};
}

/**
 * Export product in various formats
 * @param {Object} productData - Generated product data
 * @param {string} format - Export format (json, zip, etc.)
 * @returns {Object} Export data
 */
export function exportProduct(productData, format = 'json') {
	console.log(`Exporting product in ${format} format...`);

	switch (format.toLowerCase()) {
		case 'json':
			return {
				format: 'json',
				data: productData,
				filename: `product_${Date.now()}.json`
			};

		case 'zip':
			return {
				format: 'zip',
				data: generateZipProduct(productData),
				filename: `product_${Date.now()}.zip`
			};

		default:
			return {
				format: 'json',
				data: productData,
				filename: `product_${Date.now()}.json`
			};
	}
}

/**
 * Generate subtitles for the download
 * @param {string} script - Full screenplay text
 * @param {Array} audioFiles - Array of audio file objects
 * @returns {Object} Subtitle data
 */
export function generateSubtitles(script, audioFiles = []) {
	console.log('Generating subtitles...');

	const lines = extractDialogueLines(script);
	const subtitles = lines.map((line, index) => ({
		id: index + 1,
		startTime: index * 5, // Placeholder timing - 5 seconds per line
		endTime: (index + 1) * 5,
		text: line.text,
		speaker: line.speaker
	}));

	return {
		subtitles,
		format: 'srt',
		language: 'en',
		generatedAt: new Date().toISOString()
	};
}

// Helper functions

function parseScriptIntoActs(script) {
	console.log('parseScriptIntoActs called with:', typeof script, script);

	if (!script || typeof script !== 'string') {
		console.log('Script is not a string, returning empty array');
		return [];
	}

	const acts = [];
	const actRegex = /ACT\s+(I+|[IVX]+|\d+)/gi;
	const parts = script.split(actRegex);

	for (let i = 1; i < parts.length; i += 2) {
		const actNumber = parts[i];
		const actContent = parts[i + 1] || '';

		acts.push({
			number: actNumber,
			content: actContent.trim(),
			scenes: extractScenes(actContent)
		});
	}

	return acts.length > 0 ? acts : [{
		number: 'I',
		content: script,
		scenes: extractScenes(script)
	}];
}

function extractScenes(actContent) {
	if (!actContent || typeof actContent !== 'string') {
		return [];
	}

	const scenes = [];
	const lines = actContent.split('\n').filter(line => line.trim());

	let currentScene = '';
	for (const line of lines) {
		if (line.includes('INT.') || line.includes('EXT.')) {
			if (currentScene) {
				scenes.push(currentScene.trim());
			}
			currentScene = line;
		} else {
			currentScene += '\n' + line;
		}
	}

	if (currentScene) {
		scenes.push(currentScene.trim());
	}

	return scenes;
}

function generateTiming(acts, audioFiles) {
	const defaultDuration = 30; // 30 seconds per act if no audio
	const totalAudioDuration = audioFiles.reduce((sum, file) => {
		return sum + (file.duration || 10); // Default 10 seconds per audio file
	}, 0);

	const totalDuration = totalAudioDuration || (acts.length * defaultDuration);
	const actDuration = totalDuration / Math.max(acts.length, 1);

	return {
		totalDuration,
		actDuration,
		slideDuration: 5, // 5 seconds per slide
		transitionDuration: 1 // 1 second transition
	};
}

function matchImagesToActs(images, acts) {
	const actImages = {};

	acts.forEach((act, index) => {
		if (images[index]) {
			actImages[act.number] = images[index];
		} else {
			// Fallback to a default image or placeholder
			actImages[act.number] = {
				url: '/images/placeholder.jpg',
				alt: `Act ${act.number} placeholder`
			};
		}
	});

	return actImages;
}

function generateProductAssets(acts, actImages, audioFiles, timing) {
	const assets = [];

	acts.forEach((act, index) => {
		const asset = {
			id: `asset_${index + 1}`,
			title: `Act ${act.number}`,
			content: act.content,
			image: actImages[act.number],
			audio: audioFiles[index] || null,
			type: 'presentation'
		};

		assets.push(asset);
	});

	return assets;
}

function extractDialogueLines(script) {
	if (!script || typeof script !== 'string') {
		return [];
	}

	const lines = [];
	const scriptLines = script.split('\n');

	let currentSpeaker = null;

	for (const line of scriptLines) {
		const trimmed = line.trim();

		// Check if line is a character name (all caps, centered)
		if (/^[A-Z\s]+$/.test(trimmed) && trimmed.length > 0 && trimmed.length < 50) {
			currentSpeaker = trimmed;
		}
		// Check if line is dialogue (not action, not scene heading)
		else if (trimmed && !trimmed.includes('INT.') && !trimmed.includes('EXT.') &&
			!trimmed.includes('FADE') && currentSpeaker) {
			lines.push({
				speaker: currentSpeaker,
				text: trimmed
			});
		}
	}

	return lines;
}

function generateZipProduct(productData) {
	const { plot, script, images, audioFiles } = productData;

	return {
		files: [
			{ name: 'plot.txt', content: plot },
			{ name: 'script.txt', content: script },
			...images.map((img, i) => ({ name: `image_${i + 1}.jpg`, url: img.imageUrl })),
			...audioFiles.map((audio, i) => ({ name: `audio_${i + 1}.mp3`, url: audio.audioFile }))
		],
		metadata: productData.metadata
	};
}

function generateHtmlProduct(productData) {
	const { plot, script, images, audioFiles, metadata } = productData;

	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PlotTwist+ Product Page</title>
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background: #f5f5f5; }
        .product-container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
        .product-section { margin: 20px 0; }
        .download-btn { display: inline-block; margin: 10px; padding: 15px 25px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        .download-btn:hover { background: #0056b3; }
        .content-preview { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; max-height: 200px; overflow-y: auto; }
    </style>
</head>
<body>
    <div class="product-container">
        <h1>PlotTwist+ Story Product</h1>
        <p>Generated: ${metadata.generatedAt}</p>
        
        <div class="product-section">
            <h2>Plot</h2>
            <div class="content-preview">${plot?.substring(0, 500) || 'No plot available'}...</div>
            <a href="#" class="download-btn" onclick="downloadText('plot.txt', '${plot}')">Download Plot</a>
        </div>
        
        <div class="product-section">
            <h2>Script</h2>
            <div class="content-preview">${script?.substring(0, 500) || 'No script available'}...</div>
            <a href="#" class="download-btn" onclick="downloadText('script.txt', '${script}')">Download Script</a>
        </div>
        
        <div class="product-section">
            <h2>Images (${images?.length || 0} files)</h2>
            ${images?.map((img, i) => `<a href="${img.imageUrl}" class="download-btn" download="image_${i + 1}.jpg">Image ${i + 1}</a>`).join('') || 'No images available'}
        </div>
        
        <div class="product-section">
            <h2>Audio Files (${audioFiles?.length || 0} files)</h2>
            ${audioFiles?.map((audio, i) => `<a href="${audio.audioFile}" class="download-btn" download="audio_${i + 1}.mp3">Audio ${i + 1}</a>`).join('') || 'No audio files available'}
        </div>
    </div>
    
    <script>
        function downloadText(filename, content) {
            const blob = new Blob([content], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    </script>
</body>
</html>`;
}