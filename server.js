const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/personagem', (req, res) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'data', 'personagens.json'), 'utf8');
        const personagens = JSON.parse(data);
        const sorteado = personagens[Math.floor(Math.random() * personagens.length)];
        res.json(sorteado);
    } catch (err) {
        res.status(500).send("Erro ao carregar personagens.");
    }
});

app.listen(PORT, () => console.log(`Servidor pronto em http://localhost:${PORT}`));