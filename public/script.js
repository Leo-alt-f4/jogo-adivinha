let selected = null;
let vidas = 0;
let hintIndex = 0;
let gameOver = false;

const vidasEl = document.getElementById("vidas");
const dicasEl = document.getElementById("dicas");
const inputEl = document.getElementById("adivinhaInput");
const msgEl = document.getElementById("mensagem");
const restartBtn = document.getElementById("restartBtn");

async function init() {
    dicasEl.innerHTML = "";
    msgEl.textContent = "";
    inputEl.value = "";
    inputEl.disabled = false;
    restartBtn.style.display = "none";
    hintIndex = 0;
    gameOver = false;

    try {
        const res = await fetch('/api/personagem');
        if (!res.ok) {
            msgEl.textContent = `Banco de dados sem registros.`;
            return;
        }

        selected = await res.json();
        
        vidas = selected.dicas.length;
        atualizarVidas();
        sortearEmojis();
        mostrarDica();
    } catch (error) {
        console.error("Erro na requisição front-end:", error);
        msgEl.textContent = "Não foi possível conectar ao servidor.";
    }
}

function sortearEmojis() {
    const spans = document.querySelectorAll('.emoji');
    if(spans.length >= 2) {
        spans[0].textContent = '🦸‍♂️';
        spans[1].textContent = '🧟';
    }
}

function mostrarDica() {
    if (selected && hintIndex < selected.dicas.length) {
        const div = document.createElement("div");
        div.className = "hint-line";
        div.textContent = `Dica: ${selected.dicas[hintIndex]}`;
        dicasEl.appendChild(div);
        hintIndex++;
    }
}

function showConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        piece.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(piece);
    }
    setTimeout(() => container.remove(), 4000);
}

function checagem() {
    if (gameOver || !selected) return;
    const chute = inputEl.value.trim().toLowerCase();
    if (!chute) return;

    const nomes = selected.nomes_aceitaveis.map(n => n.toLowerCase().trim());

    if (nomes.includes(chute)) {
        msgEl.innerHTML = "🎉 <strong>Acertou!</strong>";
        showConfetti();
        finalizar();
    } else {
        vidas--;
        atualizarVidas();
        document.querySelector('.game-container').classList.add('shake');
        setTimeout(() => document.querySelector('.game-container').classList.remove('shake'), 400);

        if (vidas > 0) {
            msgEl.textContent = "❌ Errado! Outra dica:";
            mostrarDica();
        } else {
            msgEl.innerHTML = `💀 <strong>Fim de Jogo!</strong> Era o(a): ${selected.nome_principal}`;
            finalizar();
        }
    }
    inputEl.value = "";
}

function finalizar() {
    gameOver = true;
    inputEl.disabled = true;
    restartBtn.style.display = "inline-block";
}

function atualizarVidas() { 
    vidasEl.textContent = "❤️".repeat(vidas); 
    vidasEl.style.display = "flex";
    vidasEl.style.justifyContent = "center";
    vidasEl.style.gap = "4px"; 
}

document.getElementById("btnAdivinhar").onclick = checagem;
inputEl.onkeyup = (e) => e.key === "Enter" && checagem();
restartBtn.onclick = init;

init();