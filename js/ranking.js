const CHAVE_RANKING = "as-da-memoria:ranking";
const MAXIMO_POR_NIVEL = 10;
const RANKING_VAZIO = { facil: [], medio: [], dificil: [] };

let ranking = RANKING_VAZIO;
let idDaUltimaEntrada = null;

// Mais rápido primeiro; em caso de empate, menos jogadas
function compararResultados(a, b) {
  return a.tempo - b.tempo || a.jogadas - b.jogadas;
}

function guardarRanking() {
  localStorage.setItem(CHAVE_RANKING, JSON.stringify(ranking));
}

// Na primeira visita não há nada guardado: começa com o ranking fictício do JSON
export async function carregarRanking() {
  const guardado = localStorage.getItem(CHAVE_RANKING);

  if (guardado) {
    try {
      ranking = JSON.parse(guardado);
      return;
    } catch {
      // Dados estragados no localStorage: ignora-os e recomeça a partir do JSON
    }
  }

  try {
    const resposta = await fetch("dados/ranking-inicial.json");

    if (!resposta.ok) {
      throw new Error(`Falha ao ler ranking-inicial.json (erro ${resposta.status})`);
    }

    ranking = await resposta.json();
    guardarRanking();
  } catch (erro) {
    console.error(erro);
    ranking = RANKING_VAZIO;
  }
}

export function obterRanking(nivel) {
  return ranking[nivel] ?? [];
}

export function obterRecorde(nivel) {
  return obterRanking(nivel)[0] ?? null;
}

export function obterIdDaUltimaEntrada() {
  return idDaUltimaEntrada;
}

// Junta o resultado ao ranking e diz em que lugar ficou
export function registarResultado({ nome, nivel, segundos, jogadas }) {
  const entrada = {
    id: Date.now(),
    nome,
    tempo: segundos,
    jogadas,
    data: new Date().toLocaleDateString("en-CA"), // "2026-10-01", na data local
  };

  const lista = obterRanking(nivel);

  // Melhor resultado anterior deste jogador neste nível (null se nunca jogou)
  const melhorAnterior = lista
    .filter((item) => item.nome.toLowerCase() === nome.toLowerCase())
    .reduce(
      (melhor, item) => (melhor === null || compararResultados(item, melhor) < 0 ? item : melhor),
      null
    );

  const recordePessoal = melhorAnterior !== null && compararResultados(entrada, melhorAnterior) < 0;

  // Lista nova, ordenada e cortada; a anterior não é alterada
  const novaLista = [...lista, entrada].sort(compararResultados).slice(0, MAXIMO_POR_NIVEL);

  ranking = { ...ranking, [nivel]: novaLista };
  guardarRanking();
  idDaUltimaEntrada = entrada.id;

  const indice = novaLista.indexOf(entrada);
  return { posicao: indice === -1 ? null : indice + 1, recordePessoal };
}