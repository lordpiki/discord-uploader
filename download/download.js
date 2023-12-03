const express = require('express');
const axios = require('axios');
const { client } = require('../bot/bot');
const { uploadedFiles } = require('../upload/upload');
const { readTokens } = require('../utils/utils');

const tokens = readTokens();
const app = express();

app.get('/download/:fileId', async (req, res) => {
    const fileId = req.params.fileId;
    const originalFileName = uploadedFiles.get(fileId);

    if (originalFileName) {
        const channel = client.channels.cache.get(tokens.DISCORD_CHANNEL_ID);

        if (channel) {
            const messages = await channel.messages.fetch({ limit: 100 });

            for (const [, message] of messages) {
                const attachments = message.attachments;
                for (const [, attachment] of attachments) {
                    if (attachment.name === fileId) {
                        const contentType = getContentType(originalFileName);
                        res.setHeader('Content-Type', contentType);
                        res.setHeader('Content-Disposition', `attachment; filename=${originalFileName}`);

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

function getContentType(fileName) {
    // Implement getContentType function from previous code
}

module.exports = { app };
