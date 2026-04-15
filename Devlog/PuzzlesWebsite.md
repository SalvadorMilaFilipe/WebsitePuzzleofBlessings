# Puzzles Website

## Puzzle de 5 cliques (Página de Download)

O puzzle consiste numa animação interativa desenvolvida em Three.js (React Three Fiber) que serve como "ponte" entre a experiência web e o jogo.

### 🎮 Funcionamento
1.  **Interação Física**: O utilizador pode clicar nas peças soltas no fundo da página. Cada clique gera uma força de atração que aproxima as peças do centro.
2.  **Ciclo de 5 Cliques**: Após o 5.º clique, o sistema verifica o estado de autenticação.
3.  **Resultado Narrativo**:
    *   **Utilizador Autenticado**: As 4 peças principais (TL, TR, BL, BR) fundem-se num **Fragmento de Bênção** (quadrado perfeito) com cor Roxo Ametista profundo. Uma sobreposição imersiva em tela cheia é ativada para celebrar a restauração.
    *   **Utilizador Convidado**: As peças agitam-se e brilham momentaneamente, mas recusam-se a fundir, mantendo-se dispersas. Isto incentiva o utilizador a criar conta/fazer login.
4.  **Reset de Sessão**: Ao fazer logout, o puzzle desmorona-se automaticamente, voltando ao estado inicial de peças soltas.

### ⚙️ Detalhes Técnicos
- **Geometrias de Encaixe**: Cada peça central tem um "molde" único com abas e encaixes (tabs/holes) que se trancam perfeitamente na conclusão.
- **Modo "Sacred Focus"**: O overlay fullscreen usa `position: fixed` e `z-index: 9999`, com bloqueio de scroll do navegador.
- **Contrast Check**: A cor Roxo Ametista (#6A0DAD) foi escolhida especificamente para garantir contraste total com o texto branco do site.

## Sincronização Website-Game

Para garantir a progressão contínua:
- **Triggers SQL**: A base de dados sincroniza automaticamente o `pl_level_id` (Player) com o `sv_level_id` (Saves) através de gatilhos em PostgreSQL.
- **Lore Context**: Esta interação simboliza o restauro de uma memória ou bênção que o jogador poderá carregar para dentro das ilhas ao iniciar o jogo.