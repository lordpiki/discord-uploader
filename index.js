const express = require('express');
const { client } = require('./bot/bot');
const { router: uploadRouter, uploadedFiles } = require('./upload/upload');
const { app: downloadApp } = require('./download/download');
const path = require('path');

const port = 3000;

const app = express();

app.use('/upload', uploadRouter);
app.use('/download', downloadApp);

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/files', (req, res) => {
    const files = Array.from(uploadedFiles).map(([fileId, originalName]) => ({
        fileId,
        originalName,
    }));
    res.json(files);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.login(client.tokens.BOT_TOKEN);