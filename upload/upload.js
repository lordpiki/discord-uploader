const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadedFiles = new Map();

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

module.exports = { router, uploadedFiles };
