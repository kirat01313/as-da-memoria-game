const raiz = document.documentElement;
const seccoes = document.querySelectorAll("main > .seccao");
const linksMenu = document.querySelectorAll(".menu-link");
const botaoTema = document.getElementById("btn-tema");
const seletorBaralho = document.getElementById("seletor-baralho");

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