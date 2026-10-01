import { mostrarSeccao, aplicarTema, aplicarBaralho, mostrarCarregamento } from "./ui.js";
import { prepararBaralho } from "./baralho.js";

const CHAVE_TEMA = "as-da-memoria:tema";
const CHAVE_BARALHO = "as-da-memoria:baralho";
const BARALHOS = ["classico", "vitral", "azulejo"];

// Ano no rodapé
document.getElementById("ano").textContent = new Date().getFullYear();

// Tema: recupera o guardado, ou claro por defeito
const temaGuardado = localStorage.getItem(CHAVE_TEMA);
aplicarTema(temaGuardado === "escuro" ? "escuro" : "claro");

document.getElementById("btn-tema").addEventListener("click", () => {
  const novoTema = document.documentElement.dataset.tema === "escuro" ? "claro" : "escuro";
  aplicarTema(novoTema);
  localStorage.setItem(CHAVE_TEMA, novoTema);
});

// Baralho: recupera o guardado, se for válido; senão, Clássico
const baralhoGuardado = localStorage.getItem(CHAVE_BARALHO);
aplicarBaralho(BARALHOS.includes(baralhoGuardado) ? baralhoGuardado : "classico");

document.getElementById("seletor-baralho").addEventListener("change", (evento) => {
  aplicarBaralho(evento.target.value);
  localStorage.setItem(CHAVE_BARALHO, evento.target.value);
});

// Navegação: um só listener para todos os botões com data-seccao
document.addEventListener("click", (evento) => {
  const botao = evento.target.closest("[data-seccao]");
  if (!botao) return;

  // "Ver ranking" dentro do diálogo de vitória: fecha-o primeiro
  botao.closest("dialog")?.close();

  mostrarSeccao(botao.dataset.seccao);
});

// Nova partida
const formPartida = document.getElementById("form-partida");
const botaoJogar = document.getElementById("btn-jogar");
const erroPartida = document.getElementById("erro-partida");

function mostrarErroPartida(mensagem) {
  erroPartida.textContent = mensagem;
  erroPartida.hidden = false;
}

formPartida.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const dados = new FormData(formPartida);
  const nome = dados.get("nome").trim();
  const nivel = dados.get("nivel");
  const baralho = document.documentElement.dataset.baralho;

  if (!nome) {
    mostrarErroPartida("Escreve o teu nome para começar.");
    return;
  }

  erroPartida.hidden = true;
  mostrarCarregamento(botaoJogar, true);

  try {
    const cartas = await prepararBaralho(baralho, nivel);
    console.log("Cartas da partida:", cartas); // na Parte 3, aqui começa o jogo
    mostrarSeccao("jogo");
  } catch (erro) {
    console.error(erro);
    mostrarErroPartida("Não foi possível carregar o baralho. Verifica a ligação e tenta outra vez.");
  } finally {
    mostrarCarregamento(botaoJogar, false);
  }
});