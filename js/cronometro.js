// Cria um cronómetro. O tempo fica guardado dentro da função (closure):
// só é possível mexer-lhe através dos métodos devolvidos.
export function criarCronometro(aoAtualizar) {
  let inicio = null;      // momento em que arrancou (em ms)
  let segundos = 0;
  let intervalo = null;

  function atualizar() {
    segundos = Math.floor((Date.now() - inicio) / 1000);
    aoAtualizar(segundos);
  }

  return {
    iniciar() {
      if (intervalo) return; // já está a contar
      inicio = Date.now();
      atualizar();
      intervalo = setInterval(atualizar, 250);
    },

    parar() {
      if (!intervalo) return;
      clearInterval(intervalo);
      intervalo = null;
      atualizar(); // regista o valor exato no momento da paragem
    },

    reiniciar() {
      clearInterval(intervalo);
      intervalo = null;
      inicio = null;
      segundos = 0;
      aoAtualizar(0);
    },

    aCorrer() {
      return intervalo !== null;
    },

    obterSegundos() {
      return segundos;
    },
  };
}