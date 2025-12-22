import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3001;

// CORS for Vite dev server
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Get list of audio files
app.get('/api/files/audio', (req, res) => {
    const audioDir = path.join(__dirname, 'public', 'audio');
    try {
        if (!fs.existsSync(audioDir)) {
            return res.json([]);
        }
        const files = fs.readdirSync(audioDir)
            .filter(file => /\.(mp3|wav|ogg|m4a|aac)$/i.test(file))
            .sort();
        res.json(files);
    } catch (error) {
        console.error('Error reading audio directory:', error);
        res.json([]);
    }
});

// Get list of cover images
app.get('/api/files/covers', (req, res) => {
    const coversDir = path.join(__dirname, 'public', 'covers');
    try {
        if (!fs.existsSync(coversDir)) {
            return res.json([]);
        }
        const files = fs.readdirSync(coversDir)
            .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
            .sort();
        res.json(files);
    } catch (error) {
        console.error('Error reading covers directory:', error);
        res.json([]);
    }
});

// Get list of lyrics files
app.get('/api/files/lyrics', (req, res) => {
    const lyricsDir = path.join(__dirname, 'public', 'lyrics');
    try {
        if (!fs.existsSync(lyricsDir)) {
            return res.json([]);
        }
        const files = fs.readdirSync(lyricsDir)
            .filter(file => /\.(json|lrc|txt)$/i.test(file))
            .sort();
        res.json(files);
    } catch (error) {
        console.error('Error reading lyrics directory:', error);
        res.json([]);
    }
});

app.listen(PORT, () => {
    console.log(`📁 File API running at http://localhost:${PORT}`);
    console.log('   GET /api/files/audio  - List audio files');
    console.log('   GET /api/files/covers - List cover images');
    console.log('   GET /api/files/lyrics - List lyrics files');
});
