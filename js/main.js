import { mostrarSeccao, aplicarTema, aplicarBaralho } from "./ui.js";

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