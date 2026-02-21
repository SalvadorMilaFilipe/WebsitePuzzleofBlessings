# Guia de Gestão de Utilizadores e Integração com Unity

Este documento serve para o administrador do site e para o programador que está a desenvolver o jogo em Unity.

---

## PARTE 1: Como ver os e-mails e utilizadores registados

Como estamos a usar o **Supabase** como sistema central, toda a informação está lá.

### 1. Ver os Autenticados (E-mails e UUIDs)
Para ver quem fez login (seja por Google ou E-mail):
1. Aceda ao [Supabase Dashboard](https://supabase.com/dashboard).
2. Vá a **Authentication** (ícone de pessoas) no menu lateral.
3. Na aba **Users**, verá uma lista com:
   - E-mail
   - Provider (Google, Email, etc.)
   - User ID (um código longo, ex: `a1b2c3d4...`) - *Este é o identificador único e seguro do sistema.*

### 2. Ver os Perfis de Jogo (`jogador`)
Para ver os dados de jogo (Username, Data de Nascimento, Avatar):
1. No Supabase, vá a **Table Editor** (ícone de tabela).
2. Abra a tabela `jogador`.
3. Aqui verá as colunas:
   - `jo_cod` (ID numérico sequencial)
   - `jo_user` (Username escolhido)
   - `jo_email` (E-mail associado)
   - `jo_nome` (Nome real/Google)

---

## PARTE 2: Guia de Integração para o Unity Developer

**Objetivo:** Permitir que o jogador use a mesma conta no Jogo e no Site, e permitir vincular contas criadas separadamente.

### Tecnologia Recomendada
Recomendo usar o **Cliente Supabase para C#** no Unity.
- **Package:** `supabase-csharp` ou `postgrest-csharp`.
- Isto permite conectar diretamente à mesma base de dados e sistema de login do site.

### Cenário A: Jogador cria conta no Site primeiro
1. O jogador faz login no site (Google ou Email).
2. O site cria o registo na tabela `jogador`.
3. **No Jogo:**
   - O jogador abre o jogo e vê um ecrã de Login.
   - Insere o mesmo E-mail e Password.
   - O jogo autentica e descarrega os dados da tabela `jogador` usando o E-mail.

> **Nota sobre Google Login:** Se o jogador usou "Login com Google" no site, ele não tem uma password definida.
> **Solução Prática:** O jogo deve ter um botão "Enviar Link de Acesso" (Magic Link) ou o jogador deve ir ao site e defina uma password na sua conta para poder usar no jogo (caso o jogo só suporte login tradicional user/pass).

### Cenário B: Jogador começa no Jogo (Modo Anónimo/Convidado)
1. O jogador inicia o jogo.
2. O jogo cria uma **Sessão Anónima** (via `supabase.auth.signInAnonymously()` ou guardando um ID local).
3. O jogador evolui, ganha itens, etc.
4. **Para salvar/conectar ao site:**
   - O jogo deve ter um botão **"Vincular Conta" / "Salvar Progresso"**.
   - O jogador insere um E-mail e Password.
   - O jogo executa `supabase.auth.updateUser()` para transformar a conta anónima numa conta real.
   - A partir daqui, ele pode ir ao site e fazer login com essas credenciais.

### Cenário C: Conectar via "Código de Vinculação" (A Solução Mais Prática)
Se o jogador já tem o jogo instalado (joga anonimamente) e cria uma conta no site separadamente, temos duas "contas" diferentes que precisam de ser unidas.

**Sugestão de fluxo simples (Via PIN):**

1. **No Jogo (Settings):**
   - O jogador clica em "Gerar Código de Conexão".
   - O jogo gera um número aleatório temporário (ex: `8892`) e guarda-o na base de dados junto com o ID do jogador atual.
   - O jogo mostra: *"O teu ID é #502. O teu Código é 8892"*.

2. **No Site (Perfil):**
   - O jogador logado vai a uma página "Conectar Jogo".
   - Insere o **ID (#502)** e o **Código (8892)**.
   - O site valida se o código está correto.
   - **Ação:** O site "adota" os dados do jogador #502 para a conta atual do site (atualizando o `jo_cod` ou fazendo merge dos itens).

**Vantagem:** É muito fácil para o utilizador (não precisa de logins complexos dentro do jogo) e resolve o problema de conectar contas criadas em momentos diferentes.
