# Guia de Integração de Status no Unity - Puzzle of Blessings

Este documento explica como integrar o sistema de status (Online, Inativo, Offline) no jogo desenvolvido em Unity, utilizando o Supabase como backend.

## 1. Funcionamento da Lógica
O status do jogador é calculado automaticamente no banco de dados baseado nas entradas da tabela `sessao`.
- **Online (Verde):** Sessão aberta no Site **E** no Jogo.
- **Inativo (Laranja):** Sessão aberta **APENAS** no Jogo ou **APENAS** no Site.
- **Offline (Cinza):** Nenhuma sessão aberta.

## 2. O que o Unity precisa fazer?

O Unity deve gerenciar as sessões do tipo `'jogo'`.

### Passo A: Criar Sessão ao Iniciar/Logar
Quando o jogador faz login no jogo, o Unity deve inserir um novo registro na tabela `sessao`:
- `se_jogador`: ID do jogador (UUID ou Integer dependendo da sua tabela).
- `se_tipo`: `'jogo'`
- `se_datainicio`: `NOW()` (automático no banco)
- `se_datafim`: `NULL`

**Nota:** Guarde o ID da sessão criada para poder fechá-la depois.

### Passo B: Fechar Sessão ao Sair
Quando o jogador sai do jogo ou faz logout, o Unity deve atualizar a sessão:
- Procurar a sessão pelo ID guardado.
- Definir `se_datafim = NOW()`.

## 3. Exemplo de Código (C# - Supabase-csharp)

Se estiveres a usar a biblioteca oficial do Supabase para C#, o código seria algo do género:

```csharp
using Supabase;
using System.Threading.Tasks;

public class StatusManager : MonoBehaviour
{
    private string currentSessionId;

    // Chamar quando o Login for bem sucedido
    public async Task IniciarSessaoJogo(int jogadorId)
    {
        var model = new Sessao
        {
            se_jogador = jogadorId,
            se_tipo = "jogo"
        };

        var response = await Supabase.Client.Instance.From<Sessao>().Insert(model);
        // Guardar o ID retornado para fechar depois
        currentSessionId = response.Models[0].Id; 
    }

    // Chamar no OnApplicationQuit ou Botão Sair
    public async Task FinalizarSessaoJogo()
    {
        if (string.IsNullOrEmpty(currentSessionId)) return;

        var update = await Supabase.Client.Instance
            .From<Sessao>()
            .Where(x => x.Id == currentSessionId)
            .Set(x => x.se_datafim, DateTime.Now)
            .Update();
            
        currentSessionId = null;
    }

    private async void OnApplicationQuit()
    {
        await FinalizarSessaoJogo();
    }
}
```

## 4. Requisitos no Banco de Dados
Certifica-te de que aplicaste os ficheiros SQL na pasta `database/`:
1. `status_sessao_postgresql.sql` (Cria tabelas e funções)
2. `status_logic_update.sql` (Aplica a lógica de Inativo para Site OR Jogo)

## 5. Como testar agora?
Como ainda não tens a conexão no Unity:
1. O site cria automaticamente sessões do tipo `'site'`.
2. Com a nova lógica que apliquei, se tiveres apenas o site aberto, o teu status aparecerá como **"inativo"** (cor Laranja) no Perfil, conforme pediste.
3. Assim que o Unity começar a criar sessões `'jogo'`, se ambos estiverem abertos, ficará **"online"** (Verde).
