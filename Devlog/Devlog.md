# Devlog: Puzzle of Blessings - Tradual de Desenvolvimento

Este documento detalha o progresso técnico e criativo do projeto **Puzzle of Blessings**, documentando a evolução desde o primeiro esboço até à integração complexa entre o Website e o Jogo.

---

**Outubro de 2025 - Fase de Concepção**
*   **Ideia Base:** Criação do conceito central do projeto: um ecossistema onde um Website e um Jogo (Unity) coexistem e partilham progresso.
*   **Planeamento de Lore:** Definição das "Bênçãos" como mecânica central e os "Puzzles" como forma de interação e progressão.
*   **Design de Sistema:** Esboço inicial da arquitetura de base de dados para suportar a sincronização em tempo real.

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
*   **Mobile First & Media Queries:** Ajuste profundo do CSS para garantir que o site é perfeitamente utilizável em smartphones, com menus colapsáveis e imagens adaptativas.
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

## 25/02/2026 - Devlog #13

- **Correção de Autenticação:** Resolução de erro onde o site não detetava corretamente o utilizador logado após recarregar a página.
- **Gestão de Sessões:** Criação de um sistema de persistência de sessão para cada utilizador na base de dados, permitindo rastrear a atividade em tempo real.

[Imagens](https://www.notion.so/Imagens-3120e6a69da180baaf3bef9c38ae9b05?pvs=21)

---

## 27/02/2026 - Devlog #14

- **Status Dinâmico:** Adição e integração do status de Jogador (Offline, Online no site, Online no jogo).
- **Progressão:** Criação de uma tabela de níveis com valores predefinidos, estabelecendo a base para o sistema de experiência (XP).
- **Refresco Visual:** Mudança estratégica do padrão de cores do Website para garantir uma estética mais "premium" e coesa com o Jogo.

[Imagens](https://www.notion.so/Imagens-3140e6a69da180438b8bea74c6e31865?pvs=21)

---

## 03/03/2026 - Devlog #15

- **React Three Fiber:** Instalação e configuração da biblioteca para renderização 3D no browser através do terminal.
- **Animações 3D:** Criação de uma animação temática com peças de puzzle 3D interativas na tela de download, elevando a qualidade visual do portal.
- **Refinamento de Status:** Correção e expansão dos estados de atividade (Offline, Online no site, Online no jogo, Online em ambos).

[Imagens](https://www.notion.so/Imagens-3180e6a69da180e49cfddd546223296b?pvs=21)

---

## 04/03/2026 - Devlog #16

- **Redesign de Autenticação:** Overhaul total dos modais de Sign In e Registro (Configurar Perfil).
- **Tradução para Inglês:** Todo o portal de autenticação foi traduzido para Inglês para consistência global.
- **Estética Low-Poly Premium:** Implementação de um design moderno com cantos angulados (octogonais) e efeitos de brilho/glassmorphism em ambos os modais.
- **Otimização UX/UI:** Redimensionamento estratégico para garantir compatibilidade com 100% de zoom, eliminando scrolls desnecessários.
- **Fluxo de Registro Integrado:** O ecrã de Sign In agora inclui o esquema multi-etapas de "Configuração de Perfil" diretamente no fluxo de registro por email, unificando a experiência.
- **Unificação Visual:** Sincronização de cores e estilos entre o Login e o Completo Registro de Conta.


