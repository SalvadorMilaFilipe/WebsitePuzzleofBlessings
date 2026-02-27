# Guia de Integração de Status no Unity - Puzzle of Blessings

Este sistema permite que o status do jogador mude dinamicamente entre **Online**, **Inativo** e **Offline** baseado em sessões abertas no Site ou no Jogo.

## 1. Funcionamento
O banco de dados utiliza a tabela `status` com os seguintes estados:
- **ID 1 (online):** `st_ativonosite = TRUE`, `st_ativonojogo = TRUE`
- **ID 2 (inativo):** Apenas um serviço ativo (ou Site ou Jogo).
- **ID 3 (offline):** Nenhum serviço ativo.

## 2. Implementação no Unity

### A. Estrutura da Tabela `sessao`
A tabela agora usa colunas de Data e Hora separadas:
- `se_dataini` / `se_horaini` (Data/Hora de entrada)
- `se_datafim` / `se_horafim` (Data/Hora de saída - ficam NULL enquanto ativo)
- `se_tipo`: Deve ser definido como `'jogo'` para as entradas do Unity.

### B. O que o Unity deve fazer?

1. **Iniciar Sessão:** Ao logar no jogo, insira um registro com `se_tipo = 'jogo'`.
   - *Nota:* O banco de dados tem um trigger que fecha automaticamente qualquer sessão `'jogo'` anterior deste jogador que tenha ficado "pendente".
2. **Finalizar Sessão:** Ao sair ou deslogar, atualize o registro (`se_datafim`, `se_horafim`) com o tempo atual do sistema.

### C. Exemplo de Código C# (Supabase)

```csharp
public async Task ControlarSessaoUnity(int jogadorId, bool entrar)
{
    if(entrar) {
        // Criar nova sessão
        var novaSessao = new Dictionary<string, object> {
            { "se_jogador", jogadorId },
            { "se_tipo", "jogo" },
            { "se_dataini", DateTime.Now.ToString("yyyy-MM-dd") },
            { "se_horaini", DateTime.Now.ToString("HH:mm:ss") }
        };
        await Supabase.Client.Instance.From("sessao").Insert(novaSessao);
    } 
    else {
        // Fechar sessão atual
        var updateSessao = new Dictionary<string, object> {
            { "se_datafim", DateTime.Now.ToString("yyyy-MM-dd") },
            { "se_horafim", DateTime.Now.ToString("HH:mm:ss") }
        };
        await Supabase.Client.Instance.From("sessao")
            .Where("se_jogador", jogadorId)
            .Where("se_tipo", "jogo")
            .Where("se_datafim", null) // Garante que fecha apenas a aberta
            .Update(updateSessao);
    }
}
```

## 3. Monitorização
Podes verificar quem está online usando a View SQL que criei no Supabase: **`v_sessoes_detalhadas`**. Ela mostra o nome do jogador e os tempos de entrada/saída de forma legível.
