import { baralhar } from "./utils.js";

// Quantos pares cada nível usa
export const NIVEIS = {
  facil: { nome: "Fácil", pares: 6 },
  medio: { nome: "Médio", pares: 8 },
  dificil: { nome: "Difícil", pares: 12 },
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
export function carregarImagem(caminho) {
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

  const { pares } = NIVEIS[nivel];

  // As figuras (as cartas ilustradas da turma) entram primeiro; os números só completam.
  // A posição na mesa continua aleatória: o jogo.js volta a baralhar tudo.
  const figuras = baralhar(dadosBaralho.cartas.filter((carta) => carta.tipo === "figura"));
  const numeros = baralhar(dadosBaralho.cartas.filter((carta) => carta.tipo === "numero"));

  const escolhidas = [...figuras, ...numeros].slice(0, pares);

  const caminhos = [
    ...escolhidas.map((carta) => caminhoImagem(baralho, carta.id)),
    caminhoImagem(baralho, "verso"),
  ];

  await Promise.all(caminhos.map(carregarImagem));

  return escolhidas;
}