import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

/**
 * Download an image from a URL and save it locally
 * @param {string} url - The image URL
 * @param {string} filename - The local filename (e.g., 'act_I.jpg')
 * @param {string} dir - The directory to save the image (default: 'public/images')
 * @returns {Promise<string>} The local path to the saved image
 */
export async function downloadImage(url, filename, dir = path.join(process.cwd(), 'public', 'images')) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
	const filePath = path.join(dir, filename);
	const response = await fetch(url);
	if (!response.ok) throw new Error(`Failed to download image: ${url}`);
	const buffer = await response.buffer();
	fs.writeFileSync(filePath, buffer);
	return `/images/${filename}`;
}
