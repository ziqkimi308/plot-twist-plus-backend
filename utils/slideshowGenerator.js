/**
 * Slideshow Generator Utility
 * Handles creation and synchronization of slideshow presentations
 */

/**
 * Generate slideshow data by combining script, images, and audio
 * @param {string} script - Full screenplay text
 * @param {Array} images - Array of image objects (3 images, one per act)
 * @param {Array} audioFiles - Array of audio file objects
 * @returns {Object} Slideshow data with timing and synchronization
 */
export function generateSlideshowData(script, images = [], audioFiles = []) {
	console.log('Generating slideshow data...');
	console.log('Script length:', script?.length || 0);
	console.log('Images count:', images?.length || 0);
	console.log('Audio files count:', audioFiles?.length || 0);

	// Parse script into acts and scenes
	const acts = parseScriptIntoActs(script);

	// Create timing data based on script content
	const timing = generateTiming(acts, audioFiles);

	// Match images to acts
	const actImages = matchImagesToActs(images, acts);

	// Generate slide sequence
	const slides = generateSlides(acts, actImages, audioFiles, timing);

	return {
		slides,
		timing,
		metadata: {
			duration: timing.totalDuration,
			actCount: acts.length,
			slideCount: slides.length,
			generatedAt: new Date().toISOString()
		}
	};
}

/**
 * Generate playback instructions for the slideshow
 * @param {Object} slideshowData - Generated slideshow data
 * @returns {Object} Playback instructions and controls
 */
export function generatePlaybackInstructions(slideshowData) {
	const { slides, timing, metadata } = slideshowData;

	return {
		instructions: {
			totalDuration: timing.totalDuration,
			playbackRate: "1x",
			autoAdvance: true,
			controls: {
				play: "Start slideshow",
				pause: "Pause at current slide",
				next: "Advance to next slide",
				previous: "Go to previous slide",
				restart: "Restart from beginning"
			}
		},
		navigation: slides.map((slide, index) => ({
			slideNumber: index + 1,
			title: slide.title,
			startTime: slide.startTime,
			duration: slide.duration
		})),
		metadata
	};
}

/**
 * Export slideshow in various formats
 * @param {Object} slideshowData - Generated slideshow data
 * @param {string} format - Export format (json, html, etc.)
 * @returns {Object} Export data
 */
export function exportSlideshow(slideshowData, format = 'json') {
	console.log(`Exporting slideshow in ${format} format...`);

	switch (format.toLowerCase()) {
		case 'json':
			return {
				format: 'json',
				data: slideshowData,
				filename: `slideshow_${Date.now()}.json`
			};

		case 'html':
			return {
				format: 'html',
				data: generateHtmlSlideshow(slideshowData),
				filename: `slideshow_${Date.now()}.html`
			};

		default:
			return {
				format: 'json',
				data: slideshowData,
				filename: `slideshow_${Date.now()}.json`
			};
	}
}

/**
 * Generate subtitles for the slideshow
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
	if (!script) return [];

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

function generateSlides(acts, actImages, audioFiles, timing) {
	const slides = [];

	acts.forEach((act, index) => {
		const slide = {
			id: `slide_${index + 1}`,
			title: `Act ${act.number}`,
			content: act.content,
			image: actImages[act.number],
			audio: audioFiles[index] || null,
			startTime: index * timing.actDuration,
			duration: timing.actDuration,
			scenes: act.scenes.map(scene => ({
				content: scene,
				duration: timing.slideDuration
			}))
		};

		slides.push(slide);
	});

	return slides;
}

function extractDialogueLines(script) {
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

function generateHtmlSlideshow(slideshowData) {
	const { slides, metadata } = slideshowData;

	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PlotTwist+ Slideshow</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #000; color: #fff; }
        .slideshow-container { position: relative; width: 100%; height: 100vh; }
        .slide { display: none; text-align: center; padding: 50px; }
        .slide.active { display: block; }
        .slide img { max-width: 80%; max-height: 60%; object-fit: contain; }
        .slide-content { margin-top: 20px; }
        .controls { position: fixed; bottom: 20px; width: 100%; text-align: center; }
        .controls button { margin: 0 10px; padding: 10px 20px; background: #333; color: #fff; border: none; cursor: pointer; }
    </style>
</head>
<body>
    <div class="slideshow-container">
        ${slides.map((slide, index) => `
            <div class="slide ${index === 0 ? 'active' : ''}">
                <h2>${slide.title}</h2>
                ${slide.image ? `<img src="${slide.image.url}" alt="${slide.image.alt}">` : ''}
                <div class="slide-content">
                    <p>${slide.content.substring(0, 200)}...</p>
                </div>
            </div>
        `).join('')}
    </div>
    
    <div class="controls">
        <button onclick="previousSlide()">Previous</button>
        <button onclick="togglePlayback()">Play/Pause</button>
        <button onclick="nextSlide()">Next</button>
    </div>
    
    <script>
        let currentSlide = 0;
        const slides = document.querySelectorAll('.slide');
        
        function showSlide(n) {
            slides[currentSlide].classList.remove('active');
            currentSlide = (n + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
        }
        
        function nextSlide() {
            showSlide(currentSlide + 1);
        }
        
        function previousSlide() {
            showSlide(currentSlide - 1);
        }
        
        function togglePlayback() {
            // Auto-advance slides every 5 seconds when playing
            // Implementation would go here
        }
    </script>
</body>
</html>`;
}