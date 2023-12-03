const Discord = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const multer = require('multer');

const { Client,  GatewayIntentBits } = Discord;

const client = new Client({ intents: [ GatewayIntentBits.Guilds] });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// Read tokens from the configuration file
const { BOT_TOKEN, DISCORD_CHANNEL_ID } = readTokens();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.login(BOT_TOKEN);

// Express.js server to handle file upload notification from the web server
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;

    // Upload the file to the Discord server
    const channel = client.channels.cache.get(DISCORD_CHANNEL_ID);

    if (channel) {
        channel.send({ files: [{ attachment: file.buffer, name: 'uploaded_file.txt' }] })
            .then(() => res.json({ success: true }))
            .catch(error => {
                console.error('Error uploading file to Discord:', error);
                res.status(500).json({ success: false, error: 'Internal Server Error' });
            });
    } else {
        console.error(`Discord channel with ID ${DISCORD_CHANNEL_ID} not found.`);
        res.status(404).json({ success: false, error: 'Discord Channel Not Found' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Function to read tokens from the configuration file
function readTokens() {
    const tokens = {};

    try {
        const data = fs.readFileSync('tokens.token', 'utf8');
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