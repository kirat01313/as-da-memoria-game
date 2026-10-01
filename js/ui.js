import { formatarTempo, formatarData } from "./utils.js"; // ★ formatarData
import { NIVEIS } from "./baralho.js"; // ★

const raiz = document.documentElement;
const seccoes = document.querySelectorAll("main > .seccao");
const linksMenu = document.querySelectorAll(".menu-link");
const botaoTema = document.getElementById("btn-tema");
const seletorBaralho = document.getElementById("seletor-baralho");
const dialogoVitoria = document.getElementById("dialogo-vitoria");

// ★ Elementos do recorde, do ranking e do diálogo de vitória
const campoRecorde = document.getElementById("recorde");
const corpoRanking = document.getElementById("ranking-corpo");
const rankingVazio = document.getElementById("ranking-vazio");
const rankingNivel = document.getElementById("ranking-nivel");
const rankingPares = document.getElementById("ranking-pares");
const separadores = document.querySelectorAll(".separador");
const vitoriaTempo = document.getElementById("vitoria-tempo");
const vitoriaJogadas = document.getElementById("vitoria-jogadas");
const vitoriaPosicao = document.getElementById("vitoria-posicao");
const vitoriaRecorde = document.getElementById("vitoria-recorde");

// Mostra uma secção e esconde as outras
export function mostrarSeccao(id) {
  seccoes.forEach((seccao) => {
    seccao.hidden = seccao.id !== id;
  });

  // O jogo pertence à "Mesa" no menu
  const ativo = id === "jogo" ? "inicio" : id;

  linksMenu.forEach((link) => {
    if (link.dataset.seccao === ativo) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  window.scrollTo(0, 0);
}

export function aplicarTema(tema) {
  raiz.dataset.tema = tema;
  botaoTema.setAttribute("aria-pressed", String(tema === "escuro"));
}

export function aplicarBaralho(baralho) {
  raiz.dataset.baralho = baralho;
  seletorBaralho.value = baralho;
}

// Liga e desliga o estado "A carregar…" de um botão
export function mostrarCarregamento(botao, aCarregar) {
  if (aCarregar) {
    botao.dataset.textoOriginal = botao.textContent;
    botao.textContent = "A carregar baralho…";
  } else {
    botao.textContent = botao.dataset.textoOriginal;
  }

  botao.disabled = aCarregar;
  botao.classList.toggle("a-carregar", aCarregar);
}

// Durante a partida não se pode trocar de baralho
export function bloquearSeletorBaralho(bloqueado) {
  seletorBaralho.disabled = bloqueado;
}

// ★ "Recorde a bater" no ecrã inicial
export function mostrarRecorde(recorde) {
  campoRecorde.textContent = recorde
    ? `${formatarTempo(recorde.tempo)} · ${recorde.jogadas} jogadas`
    : "—";
}

// ★ Tabela do ranking de um nível
export function mostrarRanking(nivel, entradas, idDestacado) {
  separadores.forEach((botao) => {
    botao.setAttribute("aria-pressed", String(botao.dataset.nivel === nivel));
  });

  rankingNivel.textContent = `Nível ${NIVEIS[nivel].nome}`;
  rankingPares.textContent = `${NIVEIS[nivel].pares} pares`;

  corpoRanking.innerHTML = "";
  rankingVazio.hidden = entradas.length > 0;

  entradas.forEach((entrada, indice) => {
    const eAtual = entrada.id === idDestacado;
    const linha = document.createElement("tr");
    if (eAtual) linha.classList.add("atual");

    // Posição: número grande
    const posicao = document.createElement("span");
    posicao.className = "posicao";
    posicao.textContent = `${indice + 1}.º`;

    // Jogador: inicial num círculo + nome (+ selo, se for o resultado acabado de fazer)
    const jogador = document.createElement("div");
    jogador.className = "jogador";

    const inicial = document.createElement("span");
    inicial.className = "jogador-inicial";
    inicial.setAttribute("aria-hidden", "true");
    inicial.textContent = entrada.nome.charAt(0).toUpperCase();

    const nome = document.createElement("span");
    nome.className = "jogador-nome";
    nome.textContent = entrada.nome;

    jogador.append(inicial, nome);

    if (eAtual) {
      const selo = document.createElement("span");
      selo.className = "selo-tu";
      selo.textContent = "A tua marca";
      jogador.appendChild(selo);
    }

    // Cada célula: [conteúdo, classe]
    const colunas = [
      [posicao, "col-posicao"],
      [jogador, "col-jogador"],
      [formatarTempo(entrada.tempo), "col-tempo col-numero"],
      [entrada.jogadas, "col-jogadas col-numero"],
      [formatarData(entrada.data), "col-data col-numero"],
    ];

    const celulas = colunas.map(([conteudo, classe]) => {
      const celula = document.createElement("td");
      celula.className = classe;
      celula.append(conteudo);
      return celula;
    });

    linha.append(...celulas);
    corpoRanking.appendChild(linha);
  });
}

// ★ Diálogo de vitória com tempo, jogadas, posição e recorde pessoal
export function mostrarVitoria({ nivel, segundos, jogadas, posicao, recordePessoal }) {
  const nomeNivel = NIVEIS[nivel].nome;

  vitoriaTempo.textContent = formatarTempo(segundos);
  vitoriaJogadas.textContent = jogadas;
  vitoriaPosicao.textContent = posicao
    ? `Ficaste em ${posicao}.º lugar no nível ${nomeNivel}.`
    : `Não entraste no top 10 do nível ${nomeNivel}. Tenta outra vez!`;
  vitoriaRecorde.hidden = !recordePessoal;

  dialogoVitoria.showModal();
}