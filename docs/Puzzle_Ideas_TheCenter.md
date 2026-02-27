# 🧩 Ideias de Puzzles para "The Center"

> Documento de planeamento para os desafios interativos disponíveis na secção **The Center** do site Puzzle of Blessings.

---

## Filosofia Geral

Os puzzles do site devem ser **complementares** ao jogo, nunca uma cópia direta. O jogador deve sentir que o site é uma extensão do universo do jogo — um lugar onde pode treinar o raciocínio, descobrir lore escondido e ganhar pequenas recompensas que enriquecem a experiência no Unity.

**Princípios:**
- Puzzles resolvíveis **apenas no browser** (sem precisar do jogo aberto).
- Misturam lógica, observação e conhecimento do universo do jogo.
- Alguns puzzles são **rotativos** (mudam semanalmente), outros são **permanentes**.
- Dificuldade progressiva: Fácil → Médio → Difícil → Enigma Secreto.

---

## Categoria 1: Quebra-Cabeças de Lógica

Puzzles clássicos adaptados ao universo do jogo.

### 1.1 — Grelha de Bênçãos (Estilo Sudoku/Nonogram)
- **Descrição:** Uma grelha 5x5 com ícones de bênçãos. O jogador precisa de preencher a grelha seguindo regras (ex: "Cada linha deve ter exatamente uma bênção de fogo").
- **Dificuldade:** Fácil a Médio.
- **Variação Semanal:** A grelha muda todas as semanas com novas combinações.
- **Recompensa:** 10 moedas no jogo por cada grelha completada.

### 1.2 — Sequência Sagrada
- **Descrição:** Mostram-se 5 símbolos numa sequência. O jogador deve identificar o 6º símbolo seguindo o padrão lógico (cor, forma, rotação, etc.).
- **Dificuldade:** Médio.
- **Exemplo:** 🔴🔵🔴🔵🔴 → ? (Resposta: 🔵)
- **Variações:** Padrões de Fibonacci com ícones, sequências baseadas em atributos das bênçãos.

### 1.3 — Torre de Elementos
- **Descrição:** O jogador tem 4 elementos (fogo, água, terra, ar) e deve organizá-los numa torre de 3 andares seguindo pistas textuais:
  - *"O fogo não pode estar por baixo da água."*
  - *"A terra está sempre num andar par."*
  - *"O ar nunca está no topo."*
- **Dificuldade:** Médio a Difícil.
- **Inspiração:** Puzzles de lógica dedutiva (estilo Einstein/Zebra Puzzle).

---

## Categoria 2: Puzzles de Consulta (Investigação no Site)

Puzzles que obrigam o jogador a **explorar outras páginas do site** para encontrar pistas.

### 2.1 — Caça ao Código
- **Descrição:** Um código de 4 caracteres está escondido em diferentes páginas do site (Wiki, Update Log, Credits, etc.). Cada página tem uma letra/número escondido de forma subtil (ex: uma letra com cor ligeiramente diferente no texto, um comentário no rodapé, um tooltip num ícone).
- **Dificuldade:** Médio.
- **Implementação:** Esconder `<span>` com classes especiais em várias páginas. O jogador insere o código no The Center.
- **Recompensa:** Desbloqueio de um item cosmético ou título exclusivo.

### 2.2 — Pergunta do Oráculo
- **Descrição:** O "Oráculo" (um NPC do lore) faz uma pergunta cuja resposta **só pode ser encontrada na Wiki ou no Update Log**.
  - *Ex: "Em que versão do jogo foi introduzida a Bênção de Gelo?"* → O jogador vai ao Update Log procurar.
  - *Ex: "Quantos atributos tem a Bênção de Fogo?"* → O jogador consulta a Wiki.
- **Dificuldade:** Fácil.
- **Rotação:** Uma nova pergunta a cada 3 dias.

### 2.3 — Mapa Fragmentado
- **Descrição:** Uma imagem do mapa do jogo é dividida em 9 fragmentos. Alguns fragmentos estão visíveis no The Center, mas os restantes estão espalhados pelas páginas do site (como imagens pequenas ou ícones clicáveis). O jogador precisa de os encontrar todos e montar o mapa.
- **Dificuldade:** Difícil.
- **Mecânica:** Drag-and-drop de peças para a posição correta.

---

## Categoria 3: Puzzles de Raciocínio / Enigma

Desafios que testam a capacidade de pensar "fora da caixa".

### 3.1 — Cifra das Ruínas
- **Descrição:** Uma mensagem encriptada aparece no The Center (ex: cifra de César, substituição de letras, código Morse com sons do jogo). O jogador deve descodificá-la.
- **Dificuldade:** Difícil.
- **Exemplo:**
  - Mensagem: `EHQFDR` (Cifra de César, deslocamento de 3)
  - Resposta: `BENCAO`
- **Variações:** Cifras cada vez mais complexas ao longo das semanas.

### 3.2 — O Labirinto Mental
- **Descrição:** Um labirinto visual onde o jogador navega com as setas do teclado ou cliques. A particularidade: algumas paredes são invisíveis e só se revelam quando o jogador se aproxima.
- **Dificuldade:** Médio.
- **Implementação:** Canvas HTML5 ou SVG interativo.
- **Temática:** Ambientado nas "Ruínas" do universo do jogo.

### 3.3 — Charada do Guardião
- **Descrição:** Um texto em forma de charada/poema que descreve algo do universo do jogo. O jogador deve adivinhar o que é.
  - *Ex: "Nasço do céu mas não sou chuva. Queimo sem fogo. Curo sem água. O que sou?"* → Resposta: **Bênção de Luz**.
- **Dificuldade:** Fácil a Médio.
- **Rotação:** Uma nova charada por semana.

### 3.4 — Puzzle de Imagem (Spot the Difference)
- **Descrição:** Duas imagens/capturas do jogo, aparentemente iguais. O jogador deve encontrar 5 diferenças.
- **Dificuldade:** Fácil.
- **Implementação:** Duas `<img>` lado a lado com áreas clicáveis.

---

## Categoria 4: Desafios Comunitários / Competitivos

Puzzles que envolvem a comunidade toda.

### 4.1 — Puzzle Colaborativo Semanal
- **Descrição:** Um puzzle gigante (ex: um jigsaw puzzle de 100 peças de uma artwork do jogo). Cada jogador pode colocar **1 peça por dia**. O progresso é partilhado por todos.
- **Dificuldade:** Especial (Comunitário).
- **Recompensa Coletiva:** Se a comunidade completar o puzzle em 7 dias, todos recebem um item.

### 4.2 — Ranking de Enigmas
- **Descrição:** Um leaderboard dos jogadores que resolveram mais puzzles no mês. Mostra o username, o número de puzzles resolvidos e o tempo médio.
- **Recompensa Mensal:** Os top 3 ganham um título especial no perfil.

### 4.3 — Puzzle do Dia
- **Descrição:** Um mini-puzzle que muda diariamente (pode ser de qualquer categoria acima). Aparece em destaque na página do The Center.
- **Tempo Limite:** 5 minutos para resolver.

---

## Tabela de Prioridades para Implementação

| Prioridade | Puzzle | Razão |
|---|---|---|
| 🔴 Alta | Pergunta do Oráculo | Fácil de implementar, incentiva explorar o site |
| 🔴 Alta | Charada do Guardião | Só precisa de texto, rotação semanal |
| 🟡 Média | Caça ao Código | Requer esconder elementos em várias páginas |
| 🟡 Média | Sequência Sagrada | Lógica pura, bom para engagement |
| 🟢 Baixa | Labirinto Mental | Requer Canvas/SVG, mais complexo |
| 🟢 Baixa | Puzzle Colaborativo | Requer backend mais elaborado |

---

## Notas de Design

- Todos os puzzles devem ter um **visual temático** coerente com o jogo (cores escuras, dourados, fontes medievais/fantasia).
- Sons opcionais ao resolver puzzles (um "ding" suave, inspirado nos sons do jogo).
- Animação de "sucesso" quando o jogador resolve corretamente (confetti dourado, brilho nas bordas).
- Os puzzles **nunca** devem ser frustrantes. Oferecer dicas após 2 tentativas erradas.
