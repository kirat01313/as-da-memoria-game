import {
  mostrarSeccao,
  aplicarTema,
  aplicarBaralho,
  mostrarCarregamento,
  bloquearSeletorBaralho,
  mostrarVitoria,
  mostrarRecorde, // ★
  mostrarRanking, // ★
} from "./ui.js";
import { prepararBaralho } from "./baralho.js";
import { iniciarJogo, reiniciarJogo, sairDoJogo, jogoEmCurso } from "./jogo.js";
import {
  carregarRanking,
  obterRanking,
  obterRecorde,
  registarResultado,
  obterIdDaUltimaEntrada,
} from "./ranking.js"; // ★
import { abrirGaleria } from "./galeria.js";

const CHAVE_TEMA = "as-da-memoria:tema";
const CHAVE_BARALHO = "as-da-memoria:baralho";
const CHAVE_NOME = "as-da-memoria:nome"; // ★ sessionStorage
const BARALHOS = ["classico", "vitral", "azulejo"];

// ★ Nível que a página "Ranking" está a mostrar
let nivelRanking = "facil";

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

  // Com a galeria aberta, passa a mostrar o baralho escolhido no header
  if (!document.getElementById("galeria").hidden) abrirGaleria(evento.target.value);
});

// Navegação: um só listener para todos os botões com data-seccao
document.addEventListener("click", (evento) => {
  const botao = evento.target.closest("[data-seccao]");
  if (!botao) return;

  // "Ver ranking" dentro do diálogo de vitória: fecha-o primeiro
  botao.closest("dialog")?.close();

  // Com uma partida a decorrer, "Mesa" leva de volta ao jogo
  const pedida = botao.dataset.seccao;
  const destino = pedida === "inicio" && jogoEmCurso() ? "jogo" : pedida;

  if (destino === "ranking") atualizarRanking(); // ★ tabela sempre atualizada
  if (destino === "galeria") abrirGaleria(document.documentElement.dataset.baralho); // abre no baralho do header
  mostrarSeccao(destino);
});

// ★ Ranking: separadores Fácil / Médio / Difícil
function atualizarRanking() {
  mostrarRanking(nivelRanking, obterRanking(nivelRanking), obterIdDaUltimaEntrada());
}

document.querySelector("#ranking .separadores").addEventListener("click", (evento) => {
  const separador = evento.target.closest(".separador");
  if (!separador) return;

  nivelRanking = separador.dataset.nivel;
  atualizarRanking();
});

// Nova partida
const formPartida = document.getElementById("form-partida");
const botaoJogar = document.getElementById("btn-jogar");
const erroPartida = document.getElementById("erro-partida");
const campoNome = document.getElementById("nome-jogador");

// ★ O nome fica guardado enquanto o separador estiver aberto
campoNome.value = sessionStorage.getItem(CHAVE_NOME) ?? "";

// ★ "Recorde a bater" do nível escolhido no formulário
function atualizarRecorde() {
  mostrarRecorde(obterRecorde(formPartida.elements.nivel.value));
}

formPartida.addEventListener("change", (evento) => {
  if (evento.target.name === "nivel") atualizarRecorde();
});

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

  sessionStorage.setItem(CHAVE_NOME, nome); // ★
  erroPartida.hidden = true;
  mostrarCarregamento(botaoJogar, true);

  try {
    const cartas = await prepararBaralho(baralho, nivel);

    iniciarJogo({ cartas, baralho, nivel, nome, aoTerminar: terminarPartida });
    bloquearSeletorBaralho(true);
    mostrarSeccao("jogo");
  } catch (erro) {
    console.error(erro);
    mostrarErroPartida("Não foi possível carregar o baralho. Verifica a ligação e tenta outra vez.");
  } finally {
    mostrarCarregamento(botaoJogar, false);
  }
});

// Fim da partida: chamada pelo jogo.js quando o último par sai da mesa
function terminarPartida(resultado) {
  // ★ Regista no ranking e prepara a página do ranking para o nível jogado
  const { posicao, recordePessoal } = registarResultado(resultado);
  nivelRanking = resultado.nivel;
  atualizarRecorde();

  bloquearSeletorBaralho(false);
  mostrarVitoria({ ...resultado, posicao, recordePessoal });
}

// Botões do jogo
document.getElementById("btn-reiniciar").addEventListener("click", reiniciarJogo);

document.getElementById("btn-sair").addEventListener("click", () => {
  if (!confirm("Sair da partida? O progresso desta partida perde-se.")) return;

  sairDoJogo();
  bloquearSeletorBaralho(false);
  mostrarSeccao("inicio");
});

// "Jogar este nível" no ranking: escolhe esse nível no formulário e volta à mesa
document.getElementById("btn-jogar-nivel").addEventListener("click", () => {
  if (jogoEmCurso()) {
    mostrarSeccao("jogo");
    return;
  }

  formPartida.elements.nivel.value = nivelRanking;
  atualizarRecorde();
  mostrarSeccao("inicio");
  campoNome.focus();
});

// "Jogar outra vez": fecha o diálogo e repete o formulário com os mesmos dados
document.getElementById("btn-jogar-outra").addEventListener("click", () => {
  document.getElementById("dialogo-vitoria").close();
  formPartida.requestSubmit();
});

// ★ Carrega o ranking (do localStorage ou, na primeira visita, do JSON)
await carregarRanking();
atualizarRecorde();