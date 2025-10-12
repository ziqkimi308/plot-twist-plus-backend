import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/generate-plot', (req, res) => {
    res.json({ message: 'Generate Plot endpoint' });
});

app.use('/api/generate-script', (req, res) => {
    res.json({ message: 'Generate Script endpoint' });
});

app.use('/api/generate-voice', (req, res) => {
    res.json({ message: 'Generate Voice endpoint' });
});

app.use('/api/save-story', (req, res) => {
    res.json({ message: 'Save Story endpoint' });
});

// Start server
app.listen(PORT, () => {
    console.log(`PlotTwist+ Backend running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
