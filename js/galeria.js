import { obterBaralhos, caminhoImagem, carregarImagem } from "./baralho.js";
import { criarCarregador } from "./ui.js";

const seccao = document.getElementById("galeria");
const separadores = document.querySelectorAll("#galeria .separador");
const imagem = document.getElementById("galeria-imagem");
const aCarregar = document.getElementById("galeria-a-carregar");
const campoNome = document.getElementById("galeria-nome");
const campoPessoa = document.getElementById("galeria-pessoa");
const campoContador = document.getElementById("galeria-contador");
const listaMiniaturas = document.getElementById("galeria-miniaturas");
const botaoAnterior = document.getElementById("galeria-anterior");
const botaoSeguinte = document.getElementById("galeria-seguinte");

// O ícone de carregamento fica sempre dentro da moldura; só se mostra/esconde
aCarregar.prepend(criarCarregador());

// O verso entra sempre como primeira carta da galeria
const VERSO = { id: "verso", nome: "Verso do baralho", tipo: "verso" };

let baralhoAtual = null;
let cartas = [];
let indiceAtual = 0;
let pedidoAtual = 0; // conta os pedidos de imagem, para ignorar os que chegam atrasados

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

// Pré-carrega a imagem grande e só a troca quando está pronta.
// Enquanto isso, a carta antiga fica esbatida e o ícone aparece por cima.
async function mostrarImagem(caminho, nome) {
  const pedido = ++pedidoAtual;

  imagem.classList.add("a-esbater");
  aCarregar.hidden = false;

  try {
    await carregarImagem(caminho);

    // Se entretanto foi escolhida outra carta, esta imagem já não interessa
    if (pedido !== pedidoAtual) return;

    imagem.src = caminho;
    imagem.alt = nome;
  } catch (erro) {
    if (pedido === pedidoAtual) console.error(erro);
  } finally {
    if (pedido === pedidoAtual) {
      imagem.classList.remove("a-esbater");
      aCarregar.hidden = true;
    }
  }
}

function escolherCarta(indice) {
  indiceAtual = indice;
  const carta = cartas[indice];

  mostrarImagem(caminhoGrande(baralhoAtual, carta.id), carta.nome);
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

// Teclado: só com a galeria aberta e fora de campos de texto
document.addEventListener("keydown", (evento) => {
  const aEscrever = ["INPUT", "SELECT", "TEXTAREA"].includes(evento.target.tagName);
  if (seccao.hidden || aEscrever) return;

  switch (evento.key) {
    case "ArrowLeft":
      mudarCarta(-1);
      break;
    case "ArrowRight":
      mudarCarta(1);
      break;
    case "Home":
      escolherCarta(0);
      break;
    case "End":
      escolherCarta(cartas.length - 1);
      break;
    default:
      return; // outra tecla: não faz nada
  }

  evento.preventDefault(); // impede a página de fazer scroll com estas teclas
});
