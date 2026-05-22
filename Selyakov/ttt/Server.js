const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

let gameState = ['', '', '', '', '', '', '', '', ''];

app.use(express.static(path.join(__dirname)));

app.get('/reset', (req, res) => {
    gameState = ['', '', '', '', '', '', '', '', ''];
    res.send(gameState);
});

app.get('/state', (req, res) => {
    res.send(gameState);
});

app.post(() => {
    console.log("hello world epta")
})
app.listen(PORT, () => {
    console.log(`Сервер работает на http://localhost:${PORT}`);
});