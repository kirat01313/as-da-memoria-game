import { obterBaralhos, caminhoImagem } from "./baralho.js";

const seccao = document.getElementById("galeria");
const separadores = document.querySelectorAll("#galeria .separador");
const imagem = document.getElementById("galeria-imagem");
const campoNome = document.getElementById("galeria-nome");
const campoPessoa = document.getElementById("galeria-pessoa");
const campoContador = document.getElementById("galeria-contador");
const listaMiniaturas = document.getElementById("galeria-miniaturas");
const botaoAnterior = document.getElementById("galeria-anterior");
const botaoSeguinte = document.getElementById("galeria-seguinte");

// O verso entra sempre como primeira carta da galeria
const VERSO = { id: "verso", nome: "Verso do baralho", tipo: "verso" };

let baralhoAtual = null;
let cartas = [];
let indiceAtual = 0;

// A carta em destaque usa a versão grande (1200 px); as miniaturas, a normal (600 px)
function caminhoGrande(baralho, id) {
  return `img/baralhos/${baralho}/grande/${id}.webp`;
}

export async function abrirGaleria(baralho) {
  try {
    const baralhos = await obterBaralhos();

    baralhoAtual = baralho;
    cartas = [VERSO, ...baralhos[baralho].cartas];

    separadores.forEach((botao) => {
      botao.setAttribute("aria-pressed", String(botao.dataset.baralho === baralho));
    });

    desenharMiniaturas();
    escolherCarta(0);
  } catch (erro) {
    console.error(erro);
    campoNome.textContent = "Não foi possível carregar a galeria.";
    campoPessoa.textContent = "";
    campoContador.textContent = "";
  }
}

function desenharMiniaturas() {
  listaMiniaturas.innerHTML = "";

  const itens = cartas.map((carta, indice) => {
    const item = document.createElement("li");

    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "miniatura-botao";
    botao.dataset.indice = indice;
    botao.setAttribute("aria-label", carta.pessoa ? `${carta.nome}, ${carta.pessoa}` : carta.nome);

    const miniatura = document.createElement("img");
    miniatura.src = caminhoImagem(baralhoAtual, carta.id);
    miniatura.alt = "";
    miniatura.loading = "lazy";

    botao.appendChild(miniatura);
    item.appendChild(botao);
    return item;
  });

  listaMiniaturas.append(...itens);
}

function escolherCarta(indice) {
  indiceAtual = indice;
  const carta = cartas[indice];

  imagem.src = caminhoGrande(baralhoAtual, carta.id);
  imagem.alt = carta.nome;
  campoNome.textContent = carta.nome;
  campoPessoa.textContent = carta.pessoa ?? "";
  campoContador.textContent = `${indice + 1} de ${cartas.length}`;

  botaoAnterior.disabled = indice === 0;
  botaoSeguinte.disabled = indice === cartas.length - 1;

  listaMiniaturas.querySelectorAll(".miniatura-botao").forEach((botao, i) => {
    if (i === indice) {
      botao.setAttribute("aria-current", "true");
    } else {
      botao.removeAttribute("aria-current");
    }
  });

  // Traz a miniatura escolhida para o centro do carrossel
  const movimentoReduzido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  listaMiniaturas.children[indice]?.scrollIntoView({
    block: "nearest",
    inline: "center",
    behavior: movimentoReduzido ? "auto" : "smooth",
  });
}

function mudarCarta(passo) {
  const novo = indiceAtual + passo;
  if (novo >= 0 && novo < cartas.length) escolherCarta(novo);
}

// Clique numa miniatura (delegação de eventos)
listaMiniaturas.addEventListener("click", (evento) => {
  const botao = evento.target.closest(".miniatura-botao");
  if (botao) escolherCarta(Number(botao.dataset.indice));
});

botaoAnterior.addEventListener("click", () => mudarCarta(-1));
botaoSeguinte.addEventListener("click", () => mudarCarta(1));

// Separadores Clássico / Vitral / Azulejo
document.querySelector("#galeria .separadores").addEventListener("click", (evento) => {
  const separador = evento.target.closest(".separador");
  if (separador) abrirGaleria(separador.dataset.baralho);
});

// Setas do teclado, só com a galeria aberta e fora de campos de texto
document.addEventListener("keydown", (evento) => {
  const aEscrever = ["INPUT", "SELECT", "TEXTAREA"].includes(evento.target.tagName);
  if (seccao.hidden || aEscrever) return;

  if (evento.key === "ArrowLeft") mudarCarta(-1);
  if (evento.key === "ArrowRight") mudarCarta(1);
});
