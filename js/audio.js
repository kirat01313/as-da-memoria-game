// Música de fundo e efeitos sonoros, com as definições guardadas no localStorage
const CHAVE_SOM = "as-da-memoria:som";
const PREDEFINICOES = { musica: 40, efeitos: 70, silenciado: false }; // volumes de 0 a 100

// Cada efeito pode ter várias versões; escolhe-se uma ao acaso para não soar sempre igual
const EFEITOS = {
  virar: ["audio/virar-1.ogg", "audio/virar-2.ogg"],
  par: ["audio/par.ogg"],
  baralhar: ["audio/baralhar.ogg"],
};

const musica = new Audio("audio/musica-fundo.mp3");
musica.loop = true;
musica.preload = "none"; // só descarrega quando for tocar

let definicoes = carregarDefinicoes();
let jaInteragiu = false; // os browsers só deixam tocar som depois de um clique ou tecla

function carregarDefinicoes() {
  try {
    const guardadas = JSON.parse(localStorage.getItem(CHAVE_SOM));
    return { ...PREDEFINICOES, ...guardadas };
  } catch {
    return { ...PREDEFINICOES }; // dados estragados: volta às predefinições
  }
}

function guardarDefinicoes() {
  localStorage.setItem(CHAVE_SOM, JSON.stringify(definicoes));
}

function musicaAudivel() {
  return !definicoes.silenciado && definicoes.musica > 0;
}

// Ajusta o volume; pausa quando não se ouve e retoma quando volta a ouvir-se
function atualizarMusica() {
  musica.volume = definicoes.musica / 100;

  if (!musicaAudivel() || document.hidden) {
    musica.pause();
  } else if (jaInteragiu && musica.paused) {
    musica.play().catch(() => {}); // se o browser recusar, fica em silêncio sem erro
  }
}

export function obterDefinicoes() {
  return { ...definicoes };
}

export function alterarDefinicoes(novas) {
  definicoes = { ...definicoes, ...novas };
  guardarDefinicoes();
  atualizarMusica();
}

export function tocarEfeito(nome) {
  const versoes = EFEITOS[nome];
  if (!versoes || definicoes.silenciado || definicoes.efeitos === 0) return;

  const som = new Audio(versoes[Math.floor(Math.random() * versoes.length)]);
  som.volume = definicoes.efeitos / 100;
  som.play().catch(() => {});
}

// A música arranca na primeira interação com a página
function desbloquear() {
  jaInteragiu = true;
  document.removeEventListener("pointerdown", desbloquear);
  document.removeEventListener("keydown", desbloquear);
  atualizarMusica();
}

document.addEventListener("pointerdown", desbloquear);
document.addEventListener("keydown", desbloquear);

// Separador escondido: pausa a música; ao voltar, retoma
document.addEventListener("visibilitychange", atualizarMusica);
