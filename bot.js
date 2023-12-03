const Discord = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');


const { Client, GatewayIntentBits, MessageAttachment } = Discord;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadedFiles = new Map();

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

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    const fileId = uuidv4();

    const channel = client.channels.cache.get(DISCORD_CHANNEL_ID);

    if (channel) {
        channel.send({ files: [{ attachment: file.buffer, name: fileId }] })
            .then(() => {
                uploadedFiles.set(fileId, req.file.originalname);
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

// Endpoint to get the list of uploaded files
app.get('/files', (req, res) => {
    const files = Array.from(uploadedFiles).map(([fileId, originalName]) => ({
        fileId,
        originalName,
    }));
    res.json(files);
});

// Updated endpoint to download a file by unique ID
app.get('/download/:fileId', async (req, res) => {
    const fileId = req.params.fileId;
    const originalFileName = uploadedFiles.get(fileId);

    if (originalFileName) {
        const channel = client.channels.cache.get(DISCORD_CHANNEL_ID);

        if (channel) {
            const messages = await channel.messages.fetch({ limit: 100 });
            
            for (const [, message] of messages) {
                const attachments = message.attachments;
                for (const [, attachment] of attachments) {
                    if (attachment.name === fileId) {
                        // Set the appropriate headers for file download based on the file type
                        const contentType = getContentType(originalFileName);
                        res.setHeader('Content-Type', contentType);
                        res.setHeader('Content-Disposition', `attachment; filename=${originalFileName}`);
                        
                        // Send the file content to the client
                        res.send(await axios.get(attachment.url, { responseType: 'arraybuffer' }).then(response => Buffer.from(response.data, 'binary')));
                        return;
                    }
                }
            }
        }
        res.status(404).json({ success: false, error: 'File Not Found' });
    } else {
        res.status(404).json({ success: false, error: 'File Not Found' });
    }
});


// Function to determine the content type based on the file extension
function getContentType(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();

    switch (extension) {
        case 'txt':
            return 'text/plain';
        case 'pdf':
            return 'application/pdf';
        case 'png':
            return 'image/png';
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        default:
            return 'application/octet-stream';
    }
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

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
