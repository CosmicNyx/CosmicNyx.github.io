const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;

// Serve static files
app.use(express.static('.'));

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Ibis Paint Workspace running at http://localhost:${PORT}`);
    console.log(`Open your browser and start drawing!`);
});