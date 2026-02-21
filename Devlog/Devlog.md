# Devlog: Puzzle of Blessings - Tradual de Desenvolvimento

Este documento detalha o progresso técnico e criativo do projeto **Puzzle of Blessings**, documentando a evolução desde o primeiro esboço até à integração complexa entre o Website e o Jogo.

---

## 04/11/2025 - Devlog #1: O Nascimento do Conceito
*   **Implementação:** Criação de um protótipo inicial utilizando a framework **Bootstrap**. O foco foi estabelecer uma estrutura de grelha (grid) sólida e um sistema de navegação funcional para testar a disposição dos elementos.
*   **Planeamento:** Definição das páginas base no código HTML, servindo de roteiro para o que viria a ser o portal oficial do jogo.

---

## 19/11/2025 - Devlog #2: Transição para Modernidade
*   **Arquitetura:** Migração total da base de código para **React.js**. Esta mudança foi estratégica para permitir uma gestão de estado ("state management") eficiente, essencial para a interatividade em tempo real entre o utilizador e o servidor.
*   **Novas Funcionalidades:** Introdução da página **“The Center”**, desenhada para ser o núcleo de interação com os puzzles, utilizando componentes dinâmicos que podem ser atualizados sem recarregar a página.

---

## 21/11/2025 - Devlog #3: Refinamento de UX/UI
*   **Navegação:** Fusão estética da página de download com o menu principal, reduzindo o número de cliques necessários para o utilizador aceder ao jogo.
*   **Interface de Autenticação:** Criação visual do sistema de login. Embora ainda sem funcionalidade de backend, foram desenhados os formulários e botões com foco na experiência do utilizador.
*   **Design:** Ajuste da paleta de cores nos títulos para garantir conformidade com as normas de acessibilidade e melhor legibilidade.

---

## 23/11/2025 - Devlog #4: Responsividade e Mecânicas de Retenção
*   **Mobile First:** Ajuste do CSS (Media Queries) para garantir que o site é perfeitamente utilizável em smartphones.
*   **Login Rewards:** Implementação de uma lógica visual de recompensas. O sistema foi programado para distinguir dias da semana (coletados vs. não coletados) e apresentar informações dinâmicas sobre os itens que o jogador pode ganhar.

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
*   **Deep Linking (A Ponte para o Unity):** Introdução do conceito de **Scheme dinâmico** (`puzzleofblessings://`). Foi programado o frontend para que, após a validação da API no site, o navegador envie o `session_token` de volta para o Unity, permitindo o login sem fricção dentro do jogo através do protocolo de deep links.
*   **Reengenharia da Tabela `jogador`:** Modificação estrutural (SQL) para campos de password encriptada para o jogo (`jo_password_jogo`), preparando a API para validações externas vindas de fora do navegador.

