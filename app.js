// app.js (or index.js)
const express = require('express');
const { client } = require('./controllers/botController');
const fileApp = require('./controllers/fileController');

const app = express();

// Your existing Discord bot-related code

// Use file handling routes
app.use('/', fileApp);

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
