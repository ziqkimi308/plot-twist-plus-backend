import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import generateImageRouter from './routes/generateImage.js';
import generatePlotRouter from './routes/generatePlot.js';
import generateScriptRouter from './routes/generateScript.js';
import generateVoiceRouter from './routes/generateVoice.js';
import generateProductRouter from './routes/generateProduct.js';
import saveStoryRouter from './routes/saveStory.js';

// ES module dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static images from data/pictures
app.use('/api/images', express.static(path.join(__dirname, 'data', 'pictures')));

// Routes
app.use('/api/generate-plot', generatePlotRouter);
app.use('/api/generate-script', generateScriptRouter);
app.use('/api/generate-image', generateImageRouter);
app.use('/api/generate-voice', generateVoiceRouter);
app.use('/api/generate-product', generateProductRouter);
app.use('/api/save-story', saveStoryRouter);

// Start server
app.listen(PORT, () => {
	console.log(`PlotTwist+ Backend running on port ${PORT}`);
	console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

