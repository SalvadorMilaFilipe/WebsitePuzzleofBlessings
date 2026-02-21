# Puzzle of Blessings - Portal Web & Integração Unity

Este repositório contém o Website oficial e o sistema de sincronização para o jogo **Puzzle of Blessings**. Desenvolvido com **React.js** e integrado com **Supabase**, o portal serve como o núcleo central para gestão de utilizadores e interação dinâmica com o ecossistema do jogo.

## 🌟 Principais Funcionalidades

- **Sistema de Autenticação Híbrido:** Login via E-mail/Password e Google OAuth 2.0.
- **Integração Unity (Deep Linking):** Fluxo de login que permite sincronizar a conta do jogo com o portal web através de tokens de segurança.
- **Perfil de Jogador Dinâmico:** Gestão de bios, estados (Online/Offline), banners e fotos de perfil.
- **The Center:** Interface dedicada à resolução de puzzles interativos sincronizados com o progresso in-game.
- **Design Inclusivo:** Interface otimizada para acessibilidade (Autismo, TDAH) com estética low-poly vintage.

## 🛠️ Stack Tecnológica

- **Frontend:** React 18, Vite, React Router, Context API.
- **Backend/Base de Dados:** Supabase (PostgreSQL, Auth, Storage).
- **Estilização:** CSS3 Moderno (Vanilla) com foco em responsividade total.
- **Integração:** Protocolos de Deep Link para comunicação com motor Unity.

## 🏗️ Estrutura do Projeto

```text
├── database/            # Scripts SQL e definições da base de dados (PostgreSQL)
├── docs/                # Documentação técnica e guias de integração
├── Devlog/              # Diário de bordo detalhado do desenvolvimento
├── notes/               # Notas temporárias e rascunhos de lógica
├── public/              # Ativos estáticos (imagens, ícones)
├── src/
│   ├── components/      # Componentes modulares (Navbar, Modais, etc.)
│   ├── context/         # AuthContext para gestão global de sessão
│   ├── lib/             # Configuração da API do Supabase
│   ├── pages/           # Páginas principais e fluxos de navegação
│   └── utils/           # Utilitários e dados auxiliares
└── css/                 # Folhas de estilo segregadas por página
```

## 🚀 Como Iniciar

1. **Clonar e Instalar:**
   ```bash
   npm install
   ```

2. **Configuração do Backend:**
   - Configure um projeto no [Supabase](https://supabase.com).
   - Execute os scripts em `database/BD.sql` no SQL Editor do Supabase.
   - Configure o Google Provider no painel de Auth seguindo o guia em `docs/INSTRUCOES_GOOGLE_AUTH.md`.

3. **Ambiente:**
   - Preencha o `src/lib/supabase.js` com a sua URL e Anon Key.

4. **Executar:**
   ```bash
   npm run dev
   ```

## 📝 Documentação Adicional

- [Guia de Integração Unity](./docs/GUIA_INTEGRACAO_UNITY.md)
- [Fluxo de Login e Deep Linking](./docs/FLUXO_LOGIN_UNITY.md)
- [Histórico de Desenvolvimento](./Devlog/Devlog.md)

---
*Projeto desenvolvido para a Prova de Aptidão Profissional (PAP).*
