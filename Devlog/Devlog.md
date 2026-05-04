# Devlog: Puzzle of Blessings - Tradual de Desenvolvimento

Este documento detalha o progresso técnico e criativo do projeto **Puzzle of Blessings**, documentando a evolução desde o primeiro esboço até à integração complexa entre o Website e o Jogo.

---

**Outubro de 2025 - Fase de Concepção**
*   **Ideia Base:** Criação do conceito central do projeto: um ecossistema onde um Website e um Jogo (Unity) coexistem e partilham progresso.
*   **Planeamento de Lore:** Definição das "Bênçãos" como mecânica central e os "Puzzles" como forma de interação e progressão.
*   **Design de System:** Esboço inicial da arquitetura de base de dados para suportar a sincronização em tempo real.

---

## 04/11/2025 - Devlog #1: O Nascimento do Conceito
*   **Conceitualização Técnica:** Escolha da framework **Bootstrap** pela sua flexibilidade e rapidez na prototipagem de layouts responsivos. O foco inicial centrou-se na criação de um "Wireframe interativo", testando a disposição de elementos críticos como as secções de Puzzles e o News Log.
*   **Arquitetura de Navegação:** Definição da hierarquia de páginas (Home, Puzzles, Credits, Updates). Foi estabelecido um sistema de grelha (grid) robusto que serviu de esqueleto para todas as iterações futuras do projeto.
*   **Identidade Visual Inicial:** Primeiros testes com paletas de cores que remetem para o tema de "Blessings" (Dourado e Tons Escuros), garantindo que a tipografia fosse legível em diferentes resoluções.

---

## 19/11/2025 - Devlog #2: Transição para Modernidade
*   **Refatoração Tecnológica:** Abandono do modelo de páginas estáticas em favor do **React.js (Single Page Application)**. Esta transição permitiu a componentização do site, facilitando a manutenção e a reutilização de elementos como a Navbar e o Footer em toda a plataforma.
*   **Inauguração do "The Center":** Criação do componente dinâmico principal para gestão de puzzles. A lógica foi desenhada para suportar carregamento assíncrono de conteúdo, preparando o terreno para a integração futura com o backend.
*   **Otimização de Performance:** Implementação do **React Router DOM** para navegação instantânea entre secções, eliminando tempos de carregamento desnecessários e melhorando significativamente a experiência do utilizador.

---

## 21/11/2025 - Devlog #3: Refinamento de UX/UI
*   **Padronização Estética:** Fusão estética da página de download com o menu principal, reduzindo o número de cliques necessários para o utilizador aceder ao jogo.
*   **Interface de Autenticação (Protótipo):** Criação visual do sistema de login. Embora ainda sem funcionalidade de backend nesta fase, foram desenhados os formulários e botões com foco na experiência do utilizador e feedback visual.
*   **Design de Acessibilidade:** Ajuste da paleta de cores nos títulos e elementos interativos para garantir conformidade com as normas de acessibilidade (contraste) e melhor legibilidade.

---

## 23/11/2025 - Devlog #4: Responsividade e Mecânicas de Retenção
*   **Mobile First & Media Queries:** Ajuste profundo do CSS para garantir que o site é perfeitamente utilizável em smartphones, con menus colapsáveis e imagens adaptativas.
*   **Gamificação (Login Rewards):** Implementação de uma lógica visual de recompensas diárias. O sistema foi programado para distinguir dias da semana (coletados vs. não coletados) e apresentar informações dinâmicas sobre os itens que o jogador pode ganhar, incentivando o regresso diário ao portal.

---

## 11/01/2026 - Devlog #5: A Ponte entre Mundos
*   **Correção de Bugs:** Resolução de um erro onde elementos da página de recompensas apareciam indevidamente na página de créditos através de isolamento de componentes.
*   **Backend & Unity:** Início dos testes de integração. Foi estabelecida a primeira ligação bem-sucedida entre o motor de jogo **Unity** e a base de dados (Supabase), permitindo que dados gerados no jogo sejam refletidos no website.

---

## 14/01/2026 - Devlog #6: Identidade Visual e PAP
*   **Polimento de Login:** Adição de uma imagem de "User Desconhecido" no botão de autenticação para dar feedback visual imediato sobre o estado da sessão.
*   **Apresentação:** Finalização de marcos importantes para a Prova de Aptidão Profissional (PAP), garantindo que a base do projeto cumpre os requisitos técnicos exigidos.

---

## 23/01/2026 - Devlog #7: Lógica Avançada de Conteúdo
*   **Update Log Inteligente:** Programação de filtros de versão. O sistema agora identifica e mostra automaticamente a versão mais recente por defeito, permitindo ao utilizador filtrar manualmente se desejar consultar o histórico.
*   **Calendário Dinâmico:** Refatoração do sistema de recompensas para mostrar um ciclo de 3 semanas deslizante. A lógica foi configurada para gerir transições automáticas de meses, garantindo que o jogador vê sempre o seu progresso atual e futuro próximo.

---

## 02/02/2026 - Devlog #8: Infraestrutura de Autenticação e APIs
*   **Integração de Backend-as-a-Service (BaaS):** Introdução do **Supabase SDK** (`@supabase/supabase-js`). Esta foi a viragem tecnológica onde o site deixou de ser estático e passou a consumir APIs em tempo real.
*   **Protocolo OAuth 2.0:** Implementação do fluxo de autenticação via Google. Isto exigiu a configuração de um intermediário de confiança entre o cliente (site) e a API do Google, garantindo que o token de acesso (`access_token`) seja validado de forma segura nas chamadas subsequentes.
*   **Configuração Cloud:** No portal Google Cloud, foi necessário definir os URIs de Redirecionamento Autorizados para aceitar os callbacks do domínio do Supabase, estabelecendo o "handshake" de segurança necessário para o login social.

---

## 13/02/2026 - Devlog #9: Camada de Dados e Persistência
*   **Extensão do Esquema (Schema):** Introdução de campos dinâmicos na API de utilizador. Foi configurada a captura de metadados do Google (como o país e o nome real) para popular automaticamente a tabela `jogador` via comandos SQL assíncronos.
*   **API de Contexto (React Context API):** Criação do `AuthContext`. Esta API interna do React foi introduzida para "espalhar" o estado do utilizador por toda a aplicação, evitando o "prop drilling" e permitindo que qualquer página saiba instantaneamente se o utilizador está logado.

---

## 15/02/2026 - Devlog #10: Storage API e Políticas de Segurança
*   **API de Storage:** Ativação dos **Buckets do Supabase**. Implementação de lógica para converter ficheiros de imagem em URLs públicos permanentes.
*   **Row Level Security (RLS):** Introdução de políticas de segurança na base de dados PostgreSQL. Pela primeira vez, foram criadas regras onde a API só permite o comando `UPDATE` se o ID do utilizador autenticado coincidir com o ID da linha da tabela, garantindo que um jogador não altere os dados de outro.
*   **Arquitetura de Media:** Desenvolvimento do mapeamento entre a base de dados (que guarda o link da imagem) e o armazenamento físico (que guarda o ficheiro bruto).

---

## 20/02/2026 - Devlog #11: Integração Híbrida Unity + Web
*   **Fluxo em 2 Passos com API Customizada:** Refatoração da lógica de registo. A API de supabase foi configurada para lidar com uma inserção manual no momento da finalização do registo, separando logicamente as credenciais do site das do motor de jogo.
*   **Deep Linking (A Ponte para o Unity):** Introdução do concept de **Scheme dinâmico** (`puzzleofblessings://`). Foi programado o frontend para que, após a validação da API no site, o navegador envie o `session_token` de volta para o Unity, permitindo o login sem fricção dentro do jogo através do protocolo de deep links.
*   **Reengenharia da Tabela `jogador`:** Modificação estrutural (SQL) para campos de password encriptada para o jogo (`jo_password_jogo`), preparando a API para validações externas vindas de fora do navegador.

---

## 21/02/2026 - Devlog #12: Deployment e Gestão de Versões
*   **Página de Perfil (V1):** Lançamento da primeira versão funcional da página de perfil e edição. Foi implementada a lógica para separar dados editáveis (nome de utilizador, bio, estado do jogador) de dados fixos do sistema.
*   **Versionamento com Git:** Criação do repositório oficial no GitHub (**WebsitePuzzleofBlessings**). Todo o projeto foi organizado e transferido via comandos de terminal (CLI), estabelecendo uma base sólida para colaboração e histórico de alterações.
*   **Integração Contínua (Vercel):** Implementação da plataforma de hosting **Vercel**. O projeto foi importado diretamente do GitHub, configurando uma pipeline de CI/CD onde cada "push" para o repositório resulta numa atualização automática e imediata do site em produção.

---

## 25/02/2026 - Devlog #13: Persistência e Estabilidade de Sessão
*   **Depuração de Estado Assíncrono:** Resolução de um problema crítico onde o estado de autenticação era "perdido" momentaneamente durante o refresh da página. A solução envolveu a implementação de um listener robusto (`onAuthStateChange`) que sincroniza o `localStorage` com a sessão do Supabase de forma imediata.
*   **Gestão de Sessões em Larga Escala:** Criação de um sistema de persistência na base de dados para rastrear sessões ativas. Isto permite não só a segurança da conta, mas também a recolha de métricas de atividade que influenciarão o balanceamento de recompensas futuras.
*   **Refatoração do AuthContext:** Otimização do provider de autenticação para garantir que componentes protegidos só sejam renderizados após a confirmação do estado do utilizador, eliminando o "flash" de conteúdo para convidados.

---

## 27/02/2026 - Devlog #14: Ecossistema de Status e Progressão
*   **Status de Atividade Multidimensional:** Integração de uma lógica de "Presença" (Presence). O sistema agora distingue entre estar apenas a navegar no site (Online), estar ativamente a jogar no Unity (In-Game) ou ambos. Isto foi feito através de triggers na base de dados que atualizam o campo `status` baseado em batimentos cardíacos (heartbeats) de API.
*   **Arquitetura de Níveis (RPG Core):** Criação da tabela `levels` com curvas de experiência progressivas. A essência deste sistema é preparar o terreno para que cada ação no jogo (Unity) tenha um reflexo visual imediato no prestígio do jogador no Website.
*   **Renovação Estética "Dark Premium":** Mudança do esquema de cores para tons de cinza carvão e azul profundo com acentos néon (CSS Variables). O objetivo foi afastar o site de uma aparência "genérica" e aproximá-lo da atmosfera imersiva e misteriosa do jogo.

---

## 03/03/2026 - Devlog #15: Imersão 3D no Navegador
*   **Integração do React Three Fiber (R3F):** Instalação e configuração de uma pipeline de renderização WebGL. Foi necessário configurar o terminal e as dependências do Vite para suportar sombras e shaders complexos em tempo real.
*   **Animação "Assemble" de Puzzles:** Criação de uma cena 3D interativa para a página de download. As peças de puzzle flutuam e "montam-se" dinamicamente usando física lerp (Linear Interpolation). Isto serve como uma demonstração tecnológica do que o jogador encontrará no motor principal.
*   **Refinement de UX nos Status:** Expansão visuais das badges de status no perfil, agora com cores dinâmicas e ícones que indicam exatamente onde o utilizador está ativo no ecossistema "Puzzle of Blessings".

---

## 06/03/2026 - Devlog #16: Reformulação Total de Registro
*   **Onboarding Multi-etapas:** O ecrã de registo foi transformado num fluxo guiado que recolhe dados essenciais tanto para a conta web como para a conta in-game. Isto simplifica a vida do utilizador, evitando que tenha de se registar duas vezes em plataformas diferentes.
*   **Sincronização de Campos Críticos:** Implementação de validações em tempo real para nomes de utilizador, garantindo unicidade entre a base de dados do site e a do jogo no momento da escrita.
*   **Estética Low-Poly Unificada:** Aplicação de `clip-path` avançado no CSS para criar formulários com cantos poligonais, refletindo a linguagem visual "Low-Poly" presente em todo o projeto.

---

## 11/03/2026 - Devlog #17: Design das 8 Bençãos Iniciais
*   **Conceitualização Visual:** Início da criação artística das 8 "Blessings" fundamentais do jogo. Cada carta foi desenhada para representar um arquétipo de poder (Ex: Força, Agilidade, Sabedoria). 
*   **Atribuição de Atributos:** Definição da "essência" mecânica de cada bênção, estabelecendo como elas irão influenciar o gameplay (ex: buffs de salto, velocidade ou resistência).

---

## 12/03/2026 - Devlog #18: Arte Final e Importação de Assets
*   **Finalização de Cartas:** Conclusão do design high-fidelity das 8 bençãos. Foram criadas versões com transparência e efeitos de brilho para uso no site.
*   **Pipeline de Media:** Importação e organização dos ficheiros no diretório `/public/assets`. Foi estabelecida uma nomenclatura rigorosa para facilitar a chamada dinâmica de imagens via código através de IDs de base de dados.

---

## 13/03/2026 - Devlog #19: Inventário de Perfil e Estrutura DB
*   **Visualização de Coleção:** Implementação das bençãos no perfil do utilizador. As cartas aparecem a cores se desbloqueadas e em "grayscale" (escala de cinza) se bloqueadas, criando um incentivo visual à exploração.
*   **Normalização de Base de Dados:** Criação das tabelas fundamentais:
    *   `rarity`: Define o nível de raridade (Comum, Raro, Épico, Lendário) e o estilo visual da carta.
    *   `category`: Agrupa bençãos por tipo (Físicas, Mágicas, Utilitárias).
    *   `save`: A tabela mais importante para a persistência Jogo-Web, guardando a posição exata e o estado do save do jogador.
*   **Mapeamento de Chaves Estrangeiras:** Estabelecimento de conexões SQL entre `users`, `blessings` e `inventory` para garantir integridade de dados.

---

## 17/11/2026 - Devlog #20: Fundação da Wiki
*   **Arquitetura de Conhecimento:** Início da criação da "Wiki of Blessings". A estrutura foi montada para ser um repositório técnico onde o jogador pode consultar cada detalhe das mecânicas.
*   **Grid de Configuração:** Criação de um layout dinâmico que se adapta ao número de bençãos disponíveis, usando CSS Grid para manter a ordem mesmo em ecrãs pequenos.

---

## 18/03/2026 - Devlog #21: Melhoria de Navegação na Wiki
*   **Interface por Categorias:** Implementação de seletores visuais para filtros. As categorias foram colocadas em destaque (quadrados interativos) abaixo da barra de pesquisa, facilitando a navegação intuitiva.
*   **UX de Pesquisa:** Otimização da barra de busca para filtrar bençãos em tempo real conforme o utilizador escreve, sem necessidade de recarregar a página.

---

## 19/03/2026 - Devlog #22: Conteúdo Detalhado e Lore
*   **Modelo "Sequential Jump":** Implementação do primeiro guia detalhado (antigo Double Jump). Foram adicionados campos para raridade, categoria e custo de mana/energia.
*   **Preenchimento de Catálogo:** Todas as bençãos desenhadas anteriormente foram oficialmente adicionadas à Wiki, cada uma com o seu lore específico e impacto estatístico no jogo.

---

## 21/03/2026 - Devlog #23: Internacionalização e Refatoração Global
*   **Transição para Inglês (The Big Pivot):** Decisão estratégica de mudar toda a base de dados e termos técnicos de Português para Inglês. Isto garante compatibilidade com APIs internacionais e prepara o jogo para um lançamento global.
    *   Tabelas renomeadas (`jogador` -> `users`, `bencao` -> `blessings`, etc.).
    *   Campos traduzidos para nomes padrão da indústria (`jo_nome` -> `username`).
*   **Auth UX Overhaul:** 
    *   Separação total das páginas de Login e Registo.
    *   Implementação de um botão de "Sign Up" destacado na Navbar para aumentar a taxa de conversão de novos usuários.
    *   Criação de um fluxo de redirecionamento inteligente: Se um utilizador Google não tiver conta, ele é enviado para o registo com o email já pré-preenchido.
*   **Compactação de Design:** Redução de fontes e otimização de formulários para um aspeto mais "clean", enquanto a Barra de Navegação foi expandida para acomodar novos itens.

---

## 22/03/2026 - Devlog #24: Polimento de Layout e Bug Fixing
*   **Navbar Cross-Device:** Padronização absoluta da barra superior. Foi eliminada a inconsistência entre dispositivos, garantindo que o logo e os menus mantêm a mesma proporção em qualquer resolução.
*   **Integridade de Dados Post-Migration:** Correção intensiva de caminhos e chaves após a mudança para inglês. Foram revistos todos os scripts de conexão com o Supabase para refletir os novos nomes de tabelas e colunas.

---

## 24/03/2026 - Devlog #25: Revamp do "The Center" e Real-Time Gold
*   **Identidade Contextual:** Mudança do nome "Double Jump" para **"Sequential Jump"** para melhor se adequar ao lore do jogo.
*   **Dashboard "The Center" 2.0:** Reformulação completa da área central. 
    *   Adição de sistema de moedas (Gold) e Hints (Dicas) partilhadas com o jogo.
    *   Criação de um catálogo visual de colecionáveis.
    *   Implementação de um placeholder para o futuro modelo 3D do jogador.
*   **Guest Experience:** Criação de uma versão motivacional para utilizadores não logados, explicando o valor do "The Center" como centro de comando do seu progresso.
*   **Sincronização Viva:** O nível do jogador agora é atualizado em tempo real no dashboard sempre que ele sobe de nível dentro do jogo Unity.

---

## 29/03/2026 - Devlog #26: Compatibilidade e Acessibilidade de Animações
*   **Busca do Erro (Diagnóstico):** Identificou-se que em navegadores com restrições de WebGL (como o LibreWolf), a animação 3D não carregava. Foi implementado um fallback interativo (Scatter-on-Click) com peças SVG e brilho pulsante de 50px.
*   **Dinamização Visual de Raridades (Wiki):** Detetou-se que a Wiki apresentava cores estáticas independentemente da raridade (Ex: Magnetic Mold/Legendary aparecia em verde).
*   **Planeamento Estratégico:** 
    *   **Dashboard & Wiki:** Resolução do "bottom cutoff" em laptops através do reposicionamento do CTA de instalação.
    *   **Aura de Raridade:** Substituição de cores hardcoded por um sistema dinâmico (`getRarityColor`) que tinge títulos, bordas e atributos com as cores de prestígio (Dourado para Lendário, Púrpura para Épico, etc.).
    *   **Compatibilidade Linux (Vercel):** Criação de um utilitário centralizado (`formatUtils.js`) para resolver problemas de capitalização de ficheiros como o "Object Levitation".
*   **Execução Técnica:** 
    *   **Correção de Fluxo de Eventos:** Uso de `pointer-events: none` para permitir interatividade com o fundo em navegadores sem WebGL.
    *   **Aura Dinâmica:** No `Wiki.jsx`, o título, categoria, bordas do card e tags de atributos passam a ser tingidos dinamicamente pela cor da raridade, incluindo um `textShadow` dourado para itens Lendários. Os erros de atribuição de raridade (ex: Ephemeral Point) foram corrigidos na interface.
*   **Essência:** Garantir que 100% dos utilizadores, em qualquer dispositivo, sintam o prestígio e a magia de cada "Bênção" através de um feedback visual preciso e impactante.

---

## 01/04/2026 - Devlog #27: Metamorfose Narrative e Descobertas Blindadas
*   **Renascimento: De Wiki para "Discoveries":** Rebranding total da enciclopédia do jogo. O sistema deixou de ser um repositório estático para se tornar um "Diário de Memórias" que reage à evolução do jogador.
*   **Arquitetura Level-Locked (Core Progression):**
    *   **Evolução DB:** Atualização das tabelas `blessing`, `collectible` e `category` com colunas de bloqueio de nível (`bl_lv_id`, `cl_lv_id`, `ct_lv_id`).
    *   **Lógica Reativa:** Implementação de filtragem avançada no frontend (`.lte('bl_lv_id', playerLevel)`), garantindo que o jogador apenas visualize conteúdos que o seu "eu" nas ilhas já descobriu.
    *   **Sincronização de Save:** Refatoração da deteção de nível para ler dinamicamente o `sv_level_id` da tabela `save` (associado via `sa_jo_id`), permitindo que mudanças de nível no jogo Unity sejam refletidas instantaneamente no website sem necessidade de atualização manual do perfil.
*   **Experiência de Convidado (Bridge to Lore):**
    *   Criação de um ecrã de placeholder para visitantes não autenticados, apresentando um roadmap visual da progressão (`Tutorial -> First Soul -> Unknown`).
    *   Tradução e fixação termos de lore: "Ilhas do Entre-Sonho" passou oficialmente a ser **"Islands of Between-Dreams"** para consistência internacional.
*   **Correção de Sincronização de Dados:** Resolução de um erro crítico onde a página lia o nível estático do utilizador em vez do seu progresso de sessão real, harmonizando a base de dados com as tabelas de itens e colecionáveis.
*   **Aprimoramento do Fluxo de Login/Registo (UX Overhaul):**
    *   **Unificação de Credenciais:** Remoção da redundância entre "Account Password" e "Site Password". Agora, a password da conta é automaticamente sincronizada com o perfil do portal, eliminando a confusão de múltiplas senhas para o mesmo serviço.
    *   **Visibilidade de Password (Eye Toggle):** Implementação de botões de alternância ("Eye Icon") em todos os campos de password (Login, Registo e In-Game) para evitar erros de dactilografia.
    *   **Resiliência e Debugging:** Adição de `.trim()` automatizado em campos sensíveis e melhoria nas mensagens de erro (ex: deteção de email não confirmado), resolvendo problemas de "Invalid Credentials" fantasmas.
*   **Essência:** O portal agora é mais robusto, internacional e pronto para receber viajantes com um sistema de descoberta reativo e seguro.

---

## 01/04/2026 - Devlog #28: Reengenharia de Registo e Sincronização de Status
*   **Arquitetura de Registo Diferido (Metadata Logic):** Reengenharia completa do fluxo de inscrição. Implementação de uma **Estratégia de Metadados de Utilizador** no Supabase Auth. Agora, os dados do perfil (username, passwords de jogo, país) são capturados no momento do `signUp` e armazenados nos metadados da conta, permitindo que a criação na tabela `player` aconteça de forma automática e segura apenas após a validação da sessão (confirmada ou instantânea).
*   **Sincronização de Status em Tempo Real:** Correção profunda do sistema de presença. O mapeamento do `pl_status_id` foi ajustado para alinhar com a tabela de status da base de dados, introduzindo o estado **"Online (on website)" (ID 3)**. O sistema agora atualiza automaticamente o status para Online ao entrar e Offline (ID 1) ao sair, tanto na base de dados como no estado local do React.
*   **Resiliência a Limites de Infraestrutura:** Implementação de mensagens de erro amigáveis para lidar com os limites de envio de email e rate limits (429) do Supabase, facilitando a depuração e o onboarding contínuo.
*   **Polimento de UI no Perfil:** Atualização do componente `Profile.jsx` para suportar dinamicamente as cores e etiquetas vindas da tabela de status, garantindo que o feedback visual (bolinha de status) corresponde exatamente ao estado real do jogador no Website (🟠 Laranja).
*   **Essência:** O sistema de registo agora é à prova de falhas, garantindo a integridade dos dados entre os utilizadores autenticados e o perfil na base de dados com feedback de status em tempo real.

---

## 09/04/2026 - Devlog #29: A Ponte Interativa e o Fragmento de Bênção
*   **Experiência Interativa (5-Click Bridge):**
    *   **WebGL Interactive Animation:** Implementação de um puzzle 3D na página de Download usando React Three Fiber. O sistema reage a 5 interações físicas do utilizador antes de desencadear o culminar narrativo.
    *   **Lógica de Segmentação (Member vs Guest):** Desenvolvimento de uma lógica condicional robusta de sessão. Convidados podem interagir com as peças (agitação física), mas apenas utilizadores autenticados conseguem ativar o brilho místico e a fusão final, incentivando o login.
*   **Efeito Cinematic "Sacred Focus":**
    *   **Fullscreen Immersive Overlay:** Criação de uma sobreposição total (fixed z-index 9999) desencadeada na conclusão do puzzle. O sistema escurece o site original e destaca o fragmento restaurado.
    *   **Scroll Lock & Exit Bridge:** Implementação de bloqueio de scroll do body via `useEffect` e criação de um botão de "Retorno ao Portal" que reverte a imersão mas mantém o puzzle montado no fundo do hero.
*   **Otimização Visual e Legibilidade:**
    *   **Contraste de Cor "Ametista":** Transição da cor final do puzzle para um Roxo profundo (#6A0DAD), garantindo que os textos brancos da página são 100% legíveis por cima do objeto.
    *   **Calibração de Emissividade:** Ajuste fino da intensidade de luz (`emissiveIntensity`) para evitar o "washed-out" branco, mantendo a identidade visual do objeto.
*   **Sincronização de Progresso na Base de Dados:**
    *   **Triggers de Nível (PostgreSQL):** Implementação de gatilhos bidirecionais entre as tabelas `player` e `save`. Qualquer atualização no nível do jogador no portal reflete-se nos saves do jogo, e qualquer progresso "in-game" atualiza instantaneamente o perfil no website.
*   **Resiliência de Sessão:** Adição de um reset de estado automático no Logout, garantindo que fragmentos de bênção restaurados não sejam visíveis por engano para novos convidados ou utilizadores não logados.

---

## 21/04/2026 - Devlog #30: O Despertar das Memórias e Colecionáveis
*   **Sistema de Colecionáveis (Lore Gathering):**
    *   **Inauguração da Aba de Colecionáveis:** Implementação oficial de colecionáveis na página de Descobertas. Cada item agora exibe o seu nome, descrição, nível de obtenção original e a data exata em que o jogador o encontrou.
    *   **Componente `CollectibleAvatar`:** Desenvolvimento de um sistema de carregamento de imagens inteligente que mapeia nomes de itens para ficheiros locais (`/public/collectibles/`), com lógica de retry automático para máxima resiliência.
*   **Pivot: Progressão Baseada em Conquistas (Achievement-Driven Discovery):**
    *   **Abandono do Filtro por Nível:** Decisão técnica de remover a visibilidade automática por nível. O portal agora funciona como um diário de conquistas real: um item só aparece se existir um registo físico na tabela `player_blessing` ou `player_collectible`.
    *   **Desbloqueio em Cadeia de Categorias e Rariedades:** Implementação de lógica reativa onde os "quadrados" de Categorias (ex: Psychic) e Rariedades (ex: Legendary) são gerados dinamicamente apenas após a primeira interação do jogador com uma bênção desse tipo no jogo Unity.
*   **Reengenharia Estrutural da Base de Dados:**
    *   **Normalização de Rariedades:** Migração crítica do campo `bl_rarity` (texto estático) para `bl_rarity_id` (chave estrangeira). Isto permite que o site puxe dinamicamente as descrições ricas e artes de cartas da tabela `rarity`, garantindo consistência visual.
    *   **Sincronização de Data de Obtenção:** Adição da coluna `obtention_date` em todas as tabelas de junção, permitindo ao jogador rever a cronologia da sua jornada pelas ilhas.
*   **Ponte de Desenvolvimento (Unity Connection):**
    *   Estabelecimento de novos protocolos para a integração com o motor de jogo. O foco mudou para a inserção atómica de dados em tabelas de junção, tratando o website como o espelho fiel e persistente dos eventos em tempo real do jogo.
*   **Essência:** O portal de descobertas deixou de ser uma enciclopédia passiva para se tornar um sistema vivo e reativo que cresce conforme o jogador explora o mundo, transformando cada "apanhar" de item num momento de progresso visual permanente.

---

## 24/04/2026 - Devlog #31: Hibridização de Contas e Gestão Dinâmica de Deck
*   **Sincronização de Autenticação Híbrida:** Resolução de um problema crítico onde utilizadores registados via Google OAuth não conseguiam utilizar o login tradicional. Implementação de lógica de atualização automática de password no Supabase Auth, garantindo que uma única credencial funcione em todas as plataformas (Site e Jogo).
*   **Sistema de Download Dinâmico (V1):** Transformação da página de download num sistema orientado a dados.
    *   Integração da tabela `launchergamedownload` para carregar automaticamente a versão mais recente, tamanho e plataforma.
    *   Automatização de links de instalador Dropbox com parâmetros de download direto (`dl=1`).
*   **Lançamento do Gestor de Deck (Battle Prep):**
    *   **Arquitetura de 4 Slots:** Desenvolvimento de uma interface que permite ao jogador equipar até 4 bênçãos ativas para utilizar no jogo.
    *   **Sincronização de Slots Persistente:** Introdução da coluna `deck_slot` na base de dados para garantir que a ordem das habilidades escolhida no site é mantida fielmente dentro do motor de jogo.
    *   **Visual Discovery (The Vault):** Interface de inventário reativa que separa claramente o que está equipado do que está guardado na coleção, com suporte a trocas rápidas.
*   **Essência:** O ecossistema "Puzzle of Blessings" agora é tecnicamente unificado, permitindo que a gestão de habilidades e a atualização do jogo aconteçam de forma fluida e dinâmica, eliminando barreiras entre o navegador e o executável.

---

## 26/04/2026 - Devlog #32: Infraestrutura Admin e Bençãos de Depuração
*   **Expansão do Diretório de Assets:** Criação da pasta `/public/blessingcardmodels/` (singular), dedicada exclusivamente a bençãos de uso administrativo e ferramentas de depuração (Debug Tools).
*   **Módulo de Visualização Admin:** Desenvolvimento do componente `AdminBlessingAvatar`. Segue a mesma lógica de resiliência e multi-path do componente padrão, mas aponta para o novo repositório de assets restrito.
*   **Utilidade de Formatação Admin:** Expansão do `formatUtils.js` com a função `getAdminBlessingUrl`, permitindo chamadas dinâmicas e limpas para estas novas entidades.
*   **Controlo de Acesso na Wiki (Discoveries):** Implementação de uma nova aba "Admin" no portal de Descobertas. A aba está configurada com proteção de rota visual, aparecendo apenas para utilizadores com permissões elevadas, garantindo que "Admin NoClip" e outras ferramentas não quebrem a imersão do utilizador comum.
*   **Essência:** O portal agora possui uma camada de "Backstage", permitindo que os desenvolvedores e administradores visualizem e testem mecânicas especiais sem interferir na experiência pública do jogo.

---

## 26/04/2026 - Devlog #33: Refinamento de UX do Deck e Gestão de Inventário
*   **Visualização de Coleção (Doodles):** Substituição de nomes em texto por miniaturas das cartas no inventário do Deck. Aumentei a escala das miniaturas para `100px` e adicionei suporte ao novo componente de cards administrativos, permitindo gerir o deck com feedback visual imediato.
*   **Lógica de Slots Invertida:** Implementação de um mapeamento de slots 4-3-2-1 (da esquerda para a direita). O primeiro espaço físico no ecrã agora mapeia corretamente para o `deck_slot = 4` na base de dados, seguindo o design de UX solicitado.
*   **Polimento Visual dos Slots:** As bênçãos equipadas agora preenchem 100% da área do slot, eliminando bordas tracejadas e utilizando legendas flutuantes com fundo semi-transparente para máxima legibilidade.
*   **Sincronização de Estado:** Ajuste dos algoritmos de `fetch` e `save` para processar a inversão dos ids dos slots sem perda de integridade nos dados persistidos no Supabase.

---

## 26/04/2026 - Devlog #34: Integração de Modelos 3D Interativos (The Center)
*   **Renderização 3D de Personagem:** Substituição do placeholder estático (ícone de interrogação) no painel central por um modelo 3D dinâmico do jogador utilizando **React Three Fiber (R3F)**.
*   **Pipeline de Ativos (FBX):** Implementação do carregamento de modelos binários com suporte a descompressão via biblioteca `fflate` carregada assincronamente, garantindo compatibilidade com modelos exportados de ferramentas DCC.
*   **Iluminação e Pós-processamento:** Configuração de um ambiente de iluminação "Studio" com `ContactShadows` (sombras de contacto) e `Environment` (mapas de reflexão), elevando a fidelidade visual do personagem no dashboard.
*   **Interatividade de Visualização:** Adição de `OrbitControls` para rotação e zoom manual, e efeito de `Float` para animações subtis de respiração/levitação idle.

---

## 29/04/2026 - Devlog #35: Refinamento de Fluxos de Lógica do Sistema de Festival
*   **Diagramação de Lógica Interativa:** Finalização das árvores de decisão em `Solucao.jsx` para os processos de Compra, Validação, Sincronização Offline e Reembolsos, garantindo estados finais claros.
*   **Upgrade da Interface "Engine SQL":** Integração do esquema completo da base de dados e consultas analíticas complexas para gestão de crises numa interface inspirada em terminais profissionais.
*   **Matriz de Métodos de Pagamento:** Implementação de uma matriz dinâmica para fornecer referência rápida sobre tipos de confirmação e impactos no fluxo do sistema.

---

## 30/04/2026 - Devlog #36: Otimização do Perfil e Refinação de UI no Dashboard
*   **Limpeza de Interface de Utilizador:** Remoção de campos obsoletos como o "Código de Amizade" / "ID Único" nas páginas de Perfil e Edição de Perfil para simplificar o onboarding.
*   **Filtragem Inteligente de Ativos:** Implementação de lógica para excluir a bênção "Admin NoClip" da contagem e visualização de utilizadores comuns, mantendo a integridade da progressão narrativa.
*   **Mapeamento Relacional de Colecionáveis:** Estabelecimento de uma relação direta entre as tabelas `player_collectible` e `collectible`, permitindo a exibição de nomes reais de itens em vez de IDs técnicos.
*   **Padronização de Caminhos de Imagem:** Centralização de todos os assets de bênçãos na pasta `/blessingcardmodels/` e implementação de lógica de fallback (uso do nome da bênção caso o campo da imagem esteja vazio na DB).
*   **Revamp Visual do "The Center":**
    *   **Reorganização Espacial:** Movimentação do contador de peças para a barra lateral esquerda, alinhando-o verticalmente com os botões de ação e o cabeçalho.
    *   **Simplificação de UX:** Remoção do botão de "Catalog" e atualização cromática do ícone da "Shop" para verde esmeralda.
    *   **Sincronização de Grelha:** Ajuste fino do grid do cabeçalho para garantir que o título e o nível do jogador permaneçam centralizados e equilibrados.

---

## 04/05/2026 - Devlog #37: Responsividade Inteligente e Interação Fluida
*   **Reformulação da Navbar Responsiva:** Centralização e unificação dos estilos da barra de navegação no `shared.css`. Foi implementado um novo ponto de transição (**1000px**) e ajustes intermédios (1100px) para evitar a sobreposição de menus em janelas parcialmente minimizadas, garantindo que o logo e os links mantêm proporções equilibradas.
*   **Navegação Lateral Evoluída (Mobile Sidebar):**
    *   **Ocultação de Scrollbars:** Remoção visual das barras de deslocamento nativas em todos os browsers para um aspeto mais "clean" e imersivo.
    *   **Sistema Drag-to-Scroll:** Implementação de funcionalidade "clicar e arrastar" para navegação na barra lateral, permitindo que utilizadores de desktop naveguem na lista de forma fluida como num dispositivo móvel.
    *   **Navegação Inteligente por Setas:** Desenvolvimento de uma lógica que deteta a altura vertical do cursor do rato para sincronizar a navegação por teclado ($\uparrow$ e $\downarrow$), permitindo que a seleção salte para a aba seguinte a partir da posição atual do mouse. Adicionado suporte à tecla **Enter** para navegar instantaneamente para a página selecionada.
*   **Polimento de UX e Estabilidade:**
    *   **Prevenção de Arrastamento de Ativos (Anti-Grab):** Desativação do comportamento padrão do browser de "agarrar" links e imagens (ghost image), garantindo que o gesto de puxar resulte apenas em scroll suave.
    *   **Seleção Dinâmica Visual:** Implementação de um indicador de estado "Active" (barra verde lateral) que reage tanto ao hover do rato como à navegação por teclado, com foco automático ao abrir o menu.
    *   **Controlo de Interface:** Bloqueio de seleção de texto (`user-select: none`) durante a navegação no menu para evitar interferências visuais durante o movimento.
*   **Essência:** Otimização profunda da experiência de utilizador em janelas de qualquer tamanho, transformando a navegação lateral num sistema interativo, fluido e inteligente que une o input físico do rato com a precisão do teclado.
