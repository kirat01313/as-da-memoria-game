import { baralhar } from "./utils.js";

// Quantas cartas cada nível usa. No Fácil só entram figuras (as pessoas).
export const NIVEIS = {
  facil: { nome: "Fácil", pares: 6, soFiguras: true },
  medio: { nome: "Médio", pares: 8, soFiguras: false },
  dificil: { nome: "Difícil", pares: 12, soFiguras: false },
};

// Guarda o JSON depois da primeira leitura, para não o pedir a cada partida
let baralhosEmCache = null;

export async function obterBaralhos() {
  if (baralhosEmCache) return baralhosEmCache;

  const resposta = await fetch("dados/baralhos.json");

  if (!resposta.ok) {
    throw new Error(`Falha ao ler baralhos.json (erro ${resposta.status})`);
  }

  baralhosEmCache = await resposta.json();
  return baralhosEmCache;
}

export function caminhoImagem(baralho, id) {
  return `img/baralhos/${baralho}/${id}.webp`;
}

// Transforma o carregamento de uma imagem numa Promise
function carregarImagem(caminho) {
  return new Promise((resolve, reject) => {
    const imagem = new Image();
    imagem.onload = () => resolve(imagem);
    imagem.onerror = () => reject(new Error(`Falha ao carregar ${caminho}`));
    imagem.src = caminho;
  });
}

// Escolhe as cartas da partida e só termina quando as imagens estiverem prontas
export async function prepararBaralho(baralho, nivel) {
  const baralhos = await obterBaralhos();
  const dadosBaralho = baralhos[baralho];

  if (!dadosBaralho) {
    throw new Error(`O baralho "${baralho}" não existe no JSON`);
  }

  const { pares, soFiguras } = NIVEIS[nivel];

  const disponiveis = soFiguras
    ? dadosBaralho.cartas.filter((carta) => carta.tipo === "figura")
    : dadosBaralho.cartas;

  const escolhidas = baralhar(disponiveis).slice(0, pares);

  const caminhos = [
    ...escolhidas.map((carta) => caminhoImagem(baralho, carta.id)),
    caminhoImagem(baralho, "verso"),
  ];

  await Promise.all(caminhos.map(carregarImagem));

  return escolhidas;
}