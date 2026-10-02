# Ás da Memória

Jogo da memória com cartas de jogar ilustradas, em que as figuras são os colegas da turma.
Escolhe um baralho e um nível, encontra todos os pares no menor tempo e com o menor número de jogadas, e tenta entrar no ranking.

Projeto 2 do Módulo 4 (JavaScript) — programa UpSkill, IPCA.

---

## Links

- **Jogar online:** https://kirat01313.github.io/as-da-memoria-game/
- **Repositório:** https://github.com/kirat01313/as-da-memoria-game

---

## Sobre o jogo

Há **três baralhos**, cada um com o seu estilo de ilustração: **Clássico**, **Vitral** e **Azulejo**.
Cada baralho tem 16 cartas: 9 figuras (Reis, Damas, Valetes e Ases) com a cara de colegas da turma e 7 cartas numéricas. Em cada partida, as figuras entram sempre primeiro, e as cartas numéricas só completam o que faltar.

| Nível | Pares | Cartas na mesa |
|---|---|---|
| Fácil | 6 | 12 |
| Médio | 8 | 16 |
| Difícil | 12 | 24 |

O cronómetro só começa quando viras a primeira carta. No fim, o resultado entra no ranking do nível: primeiro conta o tempo e, em caso de empate, o número de jogadas.

## Funcionalidades

- **Mesa:** escolha do nome e do nível, com o recorde atual do nível à vista.
- **Partida:** cronómetro, contador de jogadas e de pares, e os botões Recomeçar e Sair (este pede confirmação). Os pares encontrados saem da mesa e deixam o lugar vazio.
- **Vitória:** mostra o tempo, as jogadas, o lugar no ranking e o recorde pessoal.
- **Ranking:** é separado por nível e guarda os 10 melhores de cada um. Na primeira visita vem com resultados fictícios, para dar um recorde a bater. A tua última marca aparece destacada.
- **Galeria:** mostra todas as cartas de cada baralho, a começar pelo verso. A carta selecionada aparece em grande, com o nome da pessoa, e as miniaturas ficam num carrossel. Navega-se com as setas do ecrã ou com o teclado (←, →, Home, End).
- **Baralho:** escolhe-se no cabeçalho e muda o leque da Mesa, o verso das cartas e a galeria. Fica bloqueado durante uma partida.
- **Modo claro e escuro**, com ícone de sol e lua.
- **Carregamento real:** antes de cada partida, as imagens das cartas são pré-carregadas. Enquanto isso, o botão mostra um ícone com os quatro naipes. Não há atrasos simulados.
- **Acessibilidade:**
  - link "Saltar para o conteúdo";
  - jogo inteiro com teclado e foco sempre visível;
  - mensagens do jogo anunciadas aos leitores de ecrã (`aria-live`);
  - menos animações para quem tem o movimento reduzido ativo no sistema.
- **Responsivo:** a grelha de cartas ajusta-se ao ecrã, do telemóvel ao portátil.

## Requisitos do projeto

| Requisito | Onde no código |
|---|---|
| **Lógica e controlo de fluxo** | `if/else` em [`jogo.js`](js/jogo.js) (`virarCarta`: par certo ou errado). `switch` em [`galeria.js`](js/galeria.js) (teclas ←, →, Home, End). Ternários em [`main.js`](js/main.js) e [`ui.js`](js/ui.js). Ciclo `for` em [`utils.js`](js/utils.js) (`baralhar`). `map`, `filter`, `find` e `reduce` em [`jogo.js`](js/jogo.js), [`baralho.js`](js/baralho.js) e [`ranking.js`](js/ranking.js). |
| **Dados simples** | Em [`utils.js`](js/utils.js): `formatarTempo` (segundos para `1:05`, com `padStart`) e `formatarData` (`Intl.DateTimeFormat` em pt-PT). Validação do nome com `trim()` em [`main.js`](js/main.js). Comparação de nomes sem maiúsculas (`toLowerCase`) em [`ranking.js`](js/ranking.js). |
| **Dados complexos e imutabilidade** | `baralhar` trabalha numa cópia (`[...lista]`). A mesa nasce de `[...cartas, ...cartas]` e de `map` com `{ ...carta, uid }`. O ranking cresce sem alterar o original: `[...lista, entrada].sort(...).slice(0, 10)` e `{ ...ranking, [nivel]: novaLista }`. |
| **DOM dinâmico** | `createElement` e `appendChild` nas cartas (`criarCarta`), na tabela do ranking (`mostrarRanking`), nas miniaturas da galeria e no ícone de carregamento. |
| **Reatividade e eventos** | Em [`main.js`](js/main.js): `submit` do formulário e `change` do seletor de baralho. Em [`jogo.js`](js/jogo.js): `click` com delegação na grelha (`closest(".carta")`). No menu: `click` em `[data-seccao]`. Em [`galeria.js`](js/galeria.js): `keydown`. |
| **Scope e closures** | [`cronometro.js`](js/cronometro.js): `criarCronometro` guarda `inicio`, `segundos` e `intervalo` numa closure; de fora só se usam as funções devolvidas. O estado de cada módulo (`partida`, `ranking`, `baralhosEmCache`) não é exportado. As guardas `partidaAtual` e `pedidoAtual` ignoram respostas que chegam atrasadas. |
| **Assincronismo** | `fetch` + `async/await` para [`baralhos.json`](dados/baralhos.json) e [`ranking-inicial.json`](dados/ranking-inicial.json), sempre com verificação de `response.ok`. Pré-carregamento das imagens com `new Promise` e `Promise.all` ([`baralho.js`](js/baralho.js)). `try/catch/finally` no início da partida e na galeria. |
| **Modularização** | Oito módulos ES com `import` e `export` (ver a estrutura abaixo). |
| **Persistência** | `localStorage` e `sessionStorage` (ver a tabela seguinte). |

### O que fica guardado no browser

| Chave | Armazenamento | Conteúdo |
|---|---|---|
| `as-da-memoria:tema` | `localStorage` | Modo claro ou escuro |
| `as-da-memoria:baralho` | `localStorage` | Último baralho escolhido |
| `as-da-memoria:ranking` | `localStorage` | Os 10 melhores de cada nível |
| `as-da-memoria:nome` | `sessionStorage` | Nome do jogador, só enquanto o separador estiver aberto |

## Estrutura

```
├── index.html            Página única: as secções mostram-se e escondem-se com hidden
├── css/
│   └── style.css         Estilos, variáveis de cor e modo escuro
├── js/
│   ├── main.js           Ponto de entrada: liga os eventos aos módulos
│   ├── jogo.js           Regras da partida: virar cartas, pares, jogadas, fim
│   ├── baralho.js        Lê os baralhos do JSON e pré-carrega as imagens
│   ├── cronometro.js     Cronómetro (closure)
│   ├── ranking.js        Ranking por nível e recorde pessoal
│   ├── galeria.js        Galeria de cartas com carrossel
│   ├── ui.js             Tudo o que mexe no ecrã (secções, tema, ranking, vitória)
│   └── utils.js          Funções reutilizáveis: formatar tempo e data, baralhar
├── dados/
│   ├── baralhos.json         As 16 cartas de cada baralho
│   └── ranking-inicial.json  Resultados fictícios da primeira visita
└── img/
    └── baralhos/
        ├── classico/     Cartas a 600 px (jogo); grande/ a 1200 px (galeria)
        ├── vitral/
        └── azulejo/
```

## Como correr localmente

O projeto usa módulos JavaScript e `fetch`, que não funcionam se abrires o `index.html` com duplo clique (`file://`). É preciso um servidor local:

1. Clonar o repositório:
   ```bash
   git clone https://github.com/kirat01313/as-da-memoria-game.git
   ```
2. Abrir a pasta no VS Code.
3. Instalar a extensão **Live Server**.
4. Clicar com o botão direito no `index.html` e escolher **Open with Live Server**.

Também funciona com qualquer outro servidor estático, por exemplo `python -m http.server` dentro da pasta, abrindo depois http://localhost:8000.

---

## Créditos

- **Ilustrações das figuras:** geradas com IA (Google Gemini) a partir de fotografias dos colegas da turma, com a autorização de cada um.
- **Cartas numéricas:** compostas em Python (Pillow) a partir dos mesmos estilos. Todas as imagens foram convertidas para WebP.
- **Protótipo visual:** Baseado em um projeto do Google Stitch.
- **Tipos de letra:** [EB Garamond](https://fonts.google.com/specimen/EB+Garamond) e [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans), via Google Fonts.

### A turma nas cartas

| Pessoa | Clássico | Vitral | Azulejo |
|---|---|---|---|
| Adriana | Dama de Ouros | Dama de Copas | Dama de Espadas |
| Bruno | Ás de Copas | Ás de Ouros | Valete de Espadas |
| Diogo | Valete de Paus | Rei de Copas | Ás de Espadas |
| Ellen | Dama de Paus | Dama de Paus | Dama de Paus |
| Fred | Valete de Ouros | Ás de Copas | Rei de Paus |
| Matilde | Dama de Copas | Dama de Ouros | Dama de Copas |
| Paulo | Rei de Paus | Valete de Espadas | Valete de Ouros |
| Tarik | Rei de Espadas | Rei de Ouros | Valete de Copas |
| Vitor | Rei de Ouros | Valete de Paus | Rei de Copas |

---

## Autor

Tarik Chaia — IPCA / UpSkill 2026 · [LinkedIn](https://www.linkedin.com/in/tarik-guaranho/)

## Docente

Rodrigo Costa · [LinkedIn](https://www.linkedin.com/in/rfcosta85/)
