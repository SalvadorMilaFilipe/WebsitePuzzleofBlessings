# 🔗 Arquitectura de Sincronização Site ↔ Jogo (Unity)

> Como implementar os puzzles do site sem precisar de trocar dados constantemente entre o Unity e o Supabase.

---

## O Problema

Se cada puzzle do site precisar de "comunicar" diretamente com o Unity (ou vice-versa), vais ter:
- Complexidade excessiva no código C#.
- Latência e dependência de rede.
- Dificuldade em manter dois codebases sincronizados.

**Solução:** Usar o **Supabase como ponto central de verdade**. O site e o Unity nunca falam entre si diretamente — ambos leem e escrevem no Supabase, e cada um reage ao estado que encontra.

---

## Arquitectura Recomendada

```
┌──────────┐         ┌──────────────┐         ┌──────────┐
│          │ ──────▶  │              │  ◀────── │          │
│   SITE   │         │   SUPABASE   │         │   UNITY  │
│ (React)  │ ◀──────  │  (Postgres)  │  ──────▶ │  (C#)    │
│          │         │              │         │          │
└──────────┘         └──────────────┘         └──────────┘
     │                      │                      │
     │  Resolve puzzles     │  Fonte de verdade    │  Atualiza nível
     │  Ganha recompensas   │  Guarda tudo         │  Ganha XP/Itens
     │  Mostra progresso    │  Calcula estados     │  Lê recompensas
```

**Regra de ouro:** O site escreve no Supabase. O Unity lê do Supabase. Nunca há comunicação direta Site → Unity.

---

## Modelo de Dados para Puzzles

### Nova Tabela: `puzzle` (Definição dos puzzles)

```sql
CREATE TABLE IF NOT EXISTS puzzle (
    pu_cod        SERIAL PRIMARY KEY,
    pu_titulo     VARCHAR(100) NOT NULL,
    pu_tipo       VARCHAR(30) NOT NULL,        -- 'logica', 'consulta', 'enigma', 'charada'
    pu_dificuldade VARCHAR(20) DEFAULT 'facil', -- 'facil', 'medio', 'dificil'
    pu_pergunta   TEXT NOT NULL,                -- Conteúdo/Enunciado do puzzle
    pu_resposta   TEXT NOT NULL,                -- Resposta correta (encriptada ou hash)
    pu_dicas      TEXT[],                       -- Array de dicas progressivas
    pu_ativo      BOOLEAN DEFAULT TRUE,         -- Visível no site?
    pu_rotativo   BOOLEAN DEFAULT FALSE,        -- Muda periodicamente?
    pu_recompensa_tipo  VARCHAR(20),            -- 'moedas', 'item', 'titulo'
    pu_recompensa_valor TEXT,                   -- ID do item ou quantidade
    pu_data_inicio DATE,                        -- Quando fica disponível
    pu_data_fim    DATE                         -- Quando expira (NULL = permanente)
);
```

### Nova Tabela: `puzzle_progresso` (Quem resolveu o quê)

```sql
CREATE TABLE IF NOT EXISTS puzzle_progresso (
    pp_cod        SERIAL PRIMARY KEY,
    pp_jogador    INT NOT NULL REFERENCES jogador(jo_cod) ON DELETE CASCADE,
    pp_puzzle     INT NOT NULL REFERENCES puzzle(pu_cod) ON DELETE CASCADE,
    pp_resolvido  BOOLEAN DEFAULT FALSE,
    pp_tentativas INT DEFAULT 0,
    pp_data_resolucao TIMESTAMP,
    pp_tempo_segundos INT,                     -- Quanto tempo demorou
    UNIQUE(pp_jogador, pp_puzzle)              -- Um jogador só tem um registo por puzzle
);
```

### Nova Tabela: `recompensa_pendente` (Fila de recompensas)

Esta é a **tabela-chave** que evita a comunicação direta entre Site e Unity.

```sql
CREATE TABLE IF NOT EXISTS recompensa_pendente (
    rp_cod        SERIAL PRIMARY KEY,
    rp_jogador    INT NOT NULL REFERENCES jogador(jo_cod) ON DELETE CASCADE,
    rp_tipo       VARCHAR(20) NOT NULL,        -- 'moedas', 'item', 'titulo'
    rp_valor      TEXT NOT NULL,               -- Quantidade ou ID do item
    rp_origem     VARCHAR(50) NOT NULL,        -- 'puzzle_logica', 'puzzle_charada', etc.
    rp_entregue   BOOLEAN DEFAULT FALSE,       -- O Unity já entregou?
    rp_criado_em  TIMESTAMP DEFAULT NOW(),
    rp_entregue_em TIMESTAMP                   -- Quando o Unity marcou como entregue
);
```

---

## Fluxo Completo (Passo a Passo)

### Quando o jogador resolve um puzzle no Site:

```
1. Jogador abre o The Center no site
2. Resolve um puzzle (ex: Charada do Guardião)
3. O site envia a resposta ao Supabase:
   → INSERT INTO puzzle_progresso (pp_jogador, pp_puzzle, pp_resolvido, ...)
4. Se a resposta estiver correta:
   → INSERT INTO recompensa_pendente (rp_jogador, rp_tipo, rp_valor, rp_origem)
   → Ex: (42, 'moedas', '50', 'puzzle_charada')
5. O site mostra: "Parabéns! 50 moedas foram adicionadas. Abre o jogo para as receber."
```

### Quando o jogador abre o Unity:

```
1. Unity faz login no Supabase (já implementado)
2. Unity consulta: SELECT * FROM recompensa_pendente WHERE rp_jogador = ? AND rp_entregue = FALSE
3. Se encontrar recompensas pendentes:
   → Mostra uma notificação no jogo: "Tens 50 moedas do site!"
   → Adiciona as moedas à carteira do jogador
   → UPDATE recompensa_pendente SET rp_entregue = TRUE, rp_entregue_em = NOW() WHERE rp_cod = ?
4. Fim. Sem comunicação direta com o site.
```

### Diagrama do Fluxo:

```
SITE                    SUPABASE                    UNITY
 │                         │                          │
 │── Resolve Puzzle ──────▶│                          │
 │                         │── Grava Progresso        │
 │                         │── Cria Recompensa        │
 │◀── "Parabéns!" ────────│                          │
 │                         │                          │
 │                         │     (Tempo passa...)     │
 │                         │                          │
 │                         │◀── Login do Jogador ─────│
 │                         │── Devolve Recompensas ──▶│
 │                         │                          │── Mostra Notificação
 │                         │◀── Marca como Entregue ──│
```

---

## Benefícios desta Arquitectura

| Aspecto | Sem esta Arquitectura | Com esta Arquitectura |
|---|---|---|
| **Complexidade** | Site precisa de saber se o Unity está aberto | Cada sistema trabalha independentemente |
| **Offline** | Recompensas perdem-se se o jogo não estiver aberto | Recompensas ficam em fila, entregues quando o jogador abrir o jogo |
| **Escalabilidade** | Cada novo puzzle precisa de código no Unity | Basta adicionar linhas à tabela `puzzle`, o Unity já sabe ler recompensas |
| **Manutenção** | Dois codebases acoplados | Dois codebases desacoplados, fáceis de manter |
| **Segurança** | Dados passam entre sistemas | Tudo validado no Supabase (RLS + Triggers) |

---

## Segurança (RLS)

```sql
-- Puzzles: Todos podem ver, ninguém pode editar (excepto admin)
ALTER TABLE puzzle ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Puzzles are public" ON puzzle FOR SELECT TO authenticated USING (true);

-- Progresso: Cada jogador só vê o seu
ALTER TABLE puzzle_progresso ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own progress only" ON puzzle_progresso FOR ALL TO authenticated
USING (pp_jogador = (SELECT jo_cod FROM jogador WHERE LOWER(jo_email) = LOWER(auth.email())));

-- Recompensas: Cada jogador só vê as suas
ALTER TABLE recompensa_pendente ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own rewards only" ON recompensa_pendente FOR ALL TO authenticated
USING (rp_jogador = (SELECT jo_cod FROM jogador WHERE LOWER(jo_email) = LOWER(auth.email())));
```

---

## Validação no Backend (Evitar batota)

Para evitar que alguém envie respostas falsas diretamente ao Supabase:

### Opção A: Hash da Resposta (Simples)
Guardar a resposta como um hash SHA-256 na tabela `puzzle`. O site faz o hash da resposta do jogador e compara com o hash guardado. Não é perfeito, mas dificulta.

### Opção B: Supabase Edge Function (Recomendado)
Criar uma Edge Function que recebe a resposta, valida no servidor e só então insere o progresso:

```typescript
// supabase/functions/validar-puzzle/index.ts (Exemplo conceptual)
Deno.serve(async (req) => {
    const { puzzle_id, resposta, jogador_id } = await req.json()
    
    // 1. Buscar a resposta correta da BD
    const { data: puzzle } = await supabase
        .from('puzzle')
        .select('pu_resposta')
        .eq('pu_cod', puzzle_id)
        .single()
    
    // 2. Comparar (case-insensitive, sem espaços extra)
    const correta = puzzle.pu_resposta.trim().toLowerCase()
    const tentativa = resposta.trim().toLowerCase()
    
    if (correta === tentativa) {
        // 3. Gravar progresso + criar recompensa
        // ... INSERT INTO puzzle_progresso ...
        // ... INSERT INTO recompensa_pendente ...
        return new Response(JSON.stringify({ sucesso: true }))
    }
    
    return new Response(JSON.stringify({ sucesso: false, mensagem: 'Resposta incorreta' }))
})
```

---

## Código Unity (C#) — Exemplo de Leitura de Recompensas

```csharp
// Exemplo simplificado para o Unity
public async Task VerificarRecompensasPendentes(int jogadorId)
{
    // 1. Consultar recompensas não entregues
    var response = await supabase
        .From<RecompensaPendente>()
        .Filter("rp_jogador", Operator.Equals, jogadorId.ToString())
        .Filter("rp_entregue", Operator.Equals, "false")
        .Get();

    foreach (var recompensa in response.Models)
    {
        // 2. Entregar ao jogador
        switch (recompensa.RpTipo)
        {
            case "moedas":
                GameManager.Instance.AdicionarMoedas(int.Parse(recompensa.RpValor));
                break;
            case "item":
                GameManager.Instance.DesbloquearItem(recompensa.RpValor);
                break;
        }

        // 3. Marcar como entregue
        await supabase
            .From<RecompensaPendente>()
            .Filter("rp_cod", Operator.Equals, recompensa.RpCod.ToString())
            .Set(x => x.RpEntregue, true)
            .Set(x => x.RpEntregueEm, DateTime.UtcNow)
            .Update();
        
        // 4. Mostrar notificação
        UIManager.Instance.MostrarNotificacao(
            $"Recebeste {recompensa.RpValor} {recompensa.RpTipo} do site!"
        );
    }
}
```

---

## Resumo

- **Site:** Gere puzzles, valida respostas, cria recompensas pendentes.
- **Supabase:** Guarda tudo. É a única "fonte de verdade".
- **Unity:** Lê recompensas pendentes ao iniciar. Entrega-as ao jogador. Marca como entregues.
- **Resultado:** Zero comunicação direta entre Site e Unity. Tudo passa pelo Supabase.
