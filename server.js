require('dotenv').config({ path: '.env.local' });
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3000;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/personagem', async (req, res) => {
    try {
        const { data: dicasExistentes, error: errDicas } = await supabase.from('personagens_dicas').select('personagem_id');

        if (errDicas) throw errDicas;

        if (!dicasExistentes || dicasExistentes.length === 0) {
            return res.status(404).send("Nenhuma dica encontrada no banco de dados.");
        }

        const idsValivos = [...new Set(dicasExistentes.map(d => d.personagem_id))];
        const idSorteado = idsValivos[Math.floor(Math.random() * idsValivos.length)];
        const { data: personagem, error: errP } = await supabase.from('personagens').select('id, nome_principal').eq('id', idSorteado).single();

        if (errP) throw errP;

        const { data: dicas, error: errD } = await supabase.from('personagens_dicas').select('dica').eq('personagem_id', idSorteado);

        if (errD) throw errD;

        const { data: nomes, error: errN } = await supabase.from('personagens_nomes').select('nome_variacao').eq('personagem_id', idSorteado);

        if (errN) throw errN;

        const respostaFinal = {
            id: personagem.id,
            nome_principal: personagem.nome_principal,
            dicas: dicas.map(d => d.dica),
            nomes_aceitaveis: nomes.length > 0 ? nomes.map(n => n.nome_variacao) : [personagem.nome_principal]
        };

        res.json(respostaFinal);

    } catch (err) {
        res.status(500).send("Erro ao carregar personagens.");
    }
});

app.listen(PORT, () => console.log(`Servidor pronto em http://localhost:${PORT}`));