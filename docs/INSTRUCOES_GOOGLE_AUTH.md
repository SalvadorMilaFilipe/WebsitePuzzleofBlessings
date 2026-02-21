# Configuração do Login Google no Supabase

O erro `Unsupported provider: provider is not enabled` indica que o login Google não está ativado no painel do seu projeto Supabase.

Siga estes passos para corrigir (Traduzido para a interface em Português):

## 1. Configurar o Google Cloud Platform (GCP)
Para obter o "ID de cliente" e a "Chave secreta" necessários:

1. Aceda a [console.cloud.google.com](https://console.cloud.google.com/).
2. Crie um novo projeto (ex: `PuzzleBlessings-Auth`) ou selecione um existente.
3. No menu lateral (três riscas no canto superior esquerdo), vá a **APIs e serviços** > **Ecrã de consentimento OAuth**.
   - Se vir o botão **EDITAR APLICAÇÃO** (no topo), clique nele para mudar o nome.
   - Caso contrário, selecione **Externo** (External) e clique em **Criar**.
   - Preencha o **Nome da aplicação** (ex: `Puzzle of Blessings`) e os emails obrigatórios.
   - Clique em "Guardar e continuar".
   - **Dica:** Se o nome não atualizar no ecrã de login, clique em **PUBLICAR APLICAÇÃO** no painel principal do ecrã de consentimento.
4. No menu lateral, clique em **Credenciais**.
5. No topo, clique em **+ CRIAR CREDENCIAIS** > **ID do cliente OAuth**.
   - **Tipo de aplicação**: Aplicação Web.
   - **Nome**: Ex: `Login Supabase`.
   
   ⚠️ **ATENÇÃO AQUI - EXISTEM DOIS CAMPOS PARECIDOS:**
   
   - **Origens JavaScript autorizadas** (Authorized JavaScript origins):
     - **NÃO** coloque o link do Supabase aqui.
     - Este campo não aceita caminhos como `/auth/...`.
     - Coloque apenas: `http://localhost:5173` (para testar no seu PC).
   
   - **URIs de redirecionamento autorizados** (Authorized redirect URIs):
     - **É AQUI** que deve colar o link longo do Supabase.
     - Cole: `https://dwsrfrpguyvpyctdfqid.supabase.co/auth/v1/callback`
   
   - Clique em **CRIAR**.

6. Vai aparecer uma janela com o **ID de cliente** e a **Chave secreta**. Copie-os.

## 2. Ativar no Supabase
1. Vá ao seu projeto no [Supabase Dashboard](https://supabase.com/dashboard).
2. Clique em **Authentication** > **Providers** > **Google**.
3. Ative **Enable Google provider**.
4. Cole os códigos:
   - **Client ID** = O ID de cliente
   - **Client Secret** = A chave secreta
5. Clique em **Save**.

## 3. Testar
Após salvar, recarregue a página do seu site (F5) e tente clicar em "Log In".
