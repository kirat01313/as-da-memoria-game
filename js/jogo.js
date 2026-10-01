import { baralhar } from "./utils.js";
import { caminhoImagem, NIVEIS } from "./baralho.js";

// Tempo para ver um par errado antes de as cartas voltarem a virar-se (ms)
const PAUSA_PAR_ERRADO = 1100;

const grelha = document.getElementById("grelha");
const mensagem = document.getElementById("mensagem-jogo");
const campoJogadas = document.getElementById("jogadas");
const campoPares = document.getElementById("pares");
const campoJogador = document.getElementById("info-jogador");
const campoNivel = document.getElementById("info-nivel");

// Estado da partida atual (null = não há partida)
let partida = null;

export function jogoEmCurso() {
  return partida !== null && !partida.terminada;
}

export function iniciarJogo(config) {
  const { cartas, baralho, nivel, nome } = config;

  // Cada carta entra duas vezes; o uid distingue as duas cópias
  const mesa = baralhar([...cartas, ...cartas]).map((carta, indice) => ({
    ...carta,
    uid: String(indice),
  }));

  partida = {
    config,
    mesa,
    viradas: [],
    pares: 0,
    jogadas: 0,
    bloqueada: false,
    terminada: false,
  };

  grelha.innerHTML = "";
  grelha.dataset.nivel = nivel;
  mesa.forEach((carta) => grelha.appendChild(criarCarta(carta, baralho)));

  campoJogador.textContent = nome;
  campoNivel.textContent = NIVEIS[nivel].nome;
  mensagem.textContent = `Boa sorte, ${nome}! Encontra os ${cartas.length} pares.`;
  atualizarEstatisticas();
}

// Recomeça com as mesmas cartas, baralhadas de novo
export function reiniciarJogo() {
  if (partida) iniciarJogo(partida.config);
}

export function sairDoJogo() {
  partida = null;
  grelha.innerHTML = "";
  mensagem.textContent = "";
}

function criarCarta(carta, baralho) {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "carta";
  botao.dataset.uid = carta.uid;
  botao.setAttribute("aria-label", "Carta virada para baixo");

  const verso = document.createElement("span");
  verso.className = "carta-face carta-verso";

  const frente = document.createElement("span");
  frente.className = "carta-face carta-frente";

  const imagem = document.createElement("img");
  imagem.src = caminhoImagem(baralho, carta.id);
  imagem.alt = ""; // o nome da carta vai no aria-label do botão

  frente.appendChild(imagem);
  botao.appendChild(verso);
  botao.appendChild(frente);

  return botao;
}

function atualizarEstatisticas() {
  campoJogadas.textContent = partida.jogadas;
  campoPares.textContent = `${partida.pares}/${partida.config.cartas.length}`;
}

// Um só listener para todas as cartas (delegação de eventos)
grelha.addEventListener("click", (evento) => {
  const botao = evento.target.closest(".carta");
  if (botao) virarCarta(botao);
});

function virarCarta(botao) {
  if (!jogoEmCurso() || partida.bloqueada || botao.classList.contains("virada")) return;

  const carta = partida.mesa.find((item) => item.uid === botao.dataset.uid);

  botao.classList.add("virada");
  botao.setAttribute("aria-label", carta.nome);
  partida.viradas.push({ botao, carta });

  // Primeira carta da jogada: espera pela segunda
  if (partida.viradas.length < 2) return;

  partida.jogadas++;
  const [primeira, segunda] = partida.viradas;
  partida.viradas = [];

  // Par certo: as duas saem da mesa
  if (primeira.carta.id === segunda.carta.id) {
    partida.pares++;

    [primeira, segunda].forEach((item) => {
      item.botao.classList.add("encontrada");
      item.botao.disabled = true;
    });

    mensagem.textContent = `Par encontrado: ${carta.nome}.`;
    atualizarEstatisticas();

    if (partida.pares === partida.config.cartas.length) terminarJogo();
    return;
  }

  // Par errado: abanam e, depois da pausa, voltam a virar-se para baixo
  atualizarEstatisticas();
  mensagem.textContent = "Não fazem par. Tenta outra vez.";
  partida.bloqueada = true;

  primeira.botao.classList.add("errada");
  segunda.botao.classList.add("errada");

  const partidaAtual = partida;

  setTimeout(() => {
    // Se entretanto o jogador reiniciou ou saiu, esta partida já não conta
    if (partida !== partidaAtual) return;

    [primeira, segunda].forEach((item) => {
      item.botao.classList.remove("errada", "virada");
      item.botao.setAttribute("aria-label", "Carta virada para baixo");
    });

    partida.bloqueada = false;
  }, PAUSA_PAR_ERRADO);
}

function terminarJogo() {
  partida.terminada = true;
  mensagem.textContent = "Baralho completo!";

  const { nome, nivel, baralho, aoTerminar } = partida.config;
  aoTerminar({ nome, nivel, baralho, jogadas: partida.jogadas });
}