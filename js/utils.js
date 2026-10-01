// Converte segundos em "m:ss" (75 → "1:15")
export function formatarTempo(totalSegundos) {
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;
  return `${minutos}:${String(segundos).padStart(2, "0")}`;
}

// Converte "2026-10-01" em "1 de out. de 2026"
const formatoData = new Intl.DateTimeFormat("pt-PT", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatarData(dataIso) {
  return formatoData.format(new Date(dataIso));
}

// Devolve uma cópia baralhada; a lista original não é alterada
export function baralhar(lista) {
  const copia = [...lista];

  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }

  return copia;
}