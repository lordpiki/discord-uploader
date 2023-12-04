const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const { client } = require('../bot/bot'); // Adjust the path as needed
const fs = require('fs');


const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const uploadedFiles = new Map();
const { BOT_TOKEN, DISCORD_CHANNEL_ID } = readTokens();

router.use(bodyParser.json());

router.post('/', upload.single('file'), (req, res) => {
    const file = req.file;

    // Upload the file to the Discord server
    const channel = client.channels.cache.get(DISCORD_CHANNEL_ID);

    if (channel) {
        channel.send({ files: [{ attachment: file.buffer, name: req.file.originalname }] })
            .then(() => {
                uploadedFiles.set(req.file.originalname, file.buffer); // Keep track of the uploaded file and its name
                res.json({ success: true });
            })
            .catch(error => {
                console.error('Error uploading file to Discord:', error);
                res.status(500).json({ success: false, error: 'Internal Server Error' });
            });
    } else {
        console.error(`Discord channel with ID ${DISCORD_CHANNEL_ID} not found.`);
        res.status(404).json({ success: false, error: 'Discord Channel Not Found' });
    }
});


function readTokens() {
    const tokens = {};

    try {
        const data = fs.readFileSync('./tokens.token', 'utf8');
        const lines = data.split('\n');

        for (const line of lines) {
            const keyValue = line.split('=');

            if (keyValue.length === 2) {
                const [key, value] = keyValue.map(part => part.trim());
                tokens[key] = value;
            }
        }
    } catch (err) {
        console.error('Error reading tokens from tokens.token:', err);
        process.exit(1);
    }

    return tokens;
}

module.exports = { router, uploadedFiles };
