// fileController.js
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { client, upload, uploadedFiles, DISCORD_CHANNEL_ID } = require('./botController');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/upload', upload.single('file'), async (req, res) => {
    const file = req.file;
    const fileSizeLimit = 25 * 1024 * 1024; // 25MB
    const fileId = uuidv4();
    const channel = client.channels.cache.get(DISCORD_CHANNEL_ID);

    if (file.size > fileSizeLimit) {
        // File size exceeds the limit, split into chunks
        const chunkSize = 25 * 1024 * 1024; // 25MB chunks
        const totalChunks = Math.ceil(file.size / chunkSize);

        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min((i + 1) * chunkSize, file.size);
            const chunkBuffer = file.buffer.slice(start, end);

            await channel.send({
                files: [{ attachment: chunkBuffer, name: `${fileId}_${i}` }],
            });
        }

        uploadedFiles.set(fileId, {
            originalName: req.file.originalname,
            totalChunks,
            uploadedChunks: totalChunks,
        });

        res.sendFile(__dirname + '/index.html');
    } else {
        // File size within the limit, send as a single message
        channel.send({ files: [{ attachment: file.buffer, name: `${fileId}_${0}` }] })
            .then(() => {
                uploadedFiles.set(fileId, {
                    originalName: req.file.originalname,
                    totalChunks: 1,
                    uploadedChunks: 1,
                });
                
                res.sendFile(__dirname + '/index.html');
            })
            .catch(error => {
                console.error('Error uploading file to Discord:', error);
                res.status(500).json({ success: false, error: 'Internal Server Error' });
            });

    }
});



// Updated endpoint to download a file by unique ID
app.get('/download/:fileId', async (req, res) => {
    const fileId = req.params.fileId;
    const fileInfo = uploadedFiles.get(fileId);


    if (fileInfo) {
        const { originalName, totalChunks, uploadedChunks } = fileInfo;

        if (uploadedChunks === totalChunks) {
            // All chunks uploaded, proceed with downloading
            const channel = client.channels.cache.get(DISCORD_CHANNEL_ID);
            const fileChunks = [];

            for (let i = 0; i < totalChunks; i++) {
                const messages = await channel.messages.fetch({ limit: 100 });
                const chunkMessage = messages.find(msg => msg.attachments.first()?.name === `${fileId}_${i}`);

                if (chunkMessage) {
                    const chunkBuffer = await axios.get(chunkMessage.attachments.first().url, { responseType: 'arraybuffer' })
                        .then(response => Buffer.from(response.data, 'binary'));
                    fileChunks.push(chunkBuffer);
                } else {
                    res.status(404).json({ success: false, error: 'File Chunks Not Found' });
                    return;
                }
            }

            // Concatenate the chunks and send the file content to the client
            const fileBuffer = Buffer.concat(fileChunks);
            console.log(fileChunks.length, uploadedChunks, totalChunks);
            res.setHeader('Content-Type', getContentType(originalName));
            res.setHeader('Content-Disposition', `attachment; filename=${originalName}`);
            res.send(fileBuffer);

        } else {
            // Chunks still uploading, inform the client
            res.json({ success: false, message: 'File Chunks Still Uploading' });
        }
    } else {
        res.status(404).json({ success: false, error: 'File Not Found' });
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

module.exports = app;
