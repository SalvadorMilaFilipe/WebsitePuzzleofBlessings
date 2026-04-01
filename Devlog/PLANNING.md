# 📝 Project Planning : Discoveries System 2.0

Este documento descreve os objetivos técnicos e as metas de desenvolvimento para o sistema de progressão vinculado ao nível do jogador.

## 🎯 Objetivos Principais (Meta Mensal)

1.  **Transição de Wiki para "Discoveries"**
    *   Renomear todas as referências visuais e de código.
    *   Substituir a aura "Manual Técnico" por "Diário de Descoberta".
2.  **Sistema de Visibilidade por Nível (Level-Lock)**
    *   Implementar `bl_lv_id` na tabela `blessing`.
    *   Implementar `it_lv_id` para itens e `co_lv_id` para colecionáveis.
    *   **Lógica**: Item ou Blessing só aparece se `lv_id <= player_current_level`.
3.  **Refatoração da "Loja de Diálogo"**
    *   Criar uma loja dinâmica que mostre (1 Blessing, 1 Colecionável e 1-2 Itens de Ajuda) por nível.
    *   Vinculação direta com a lore: Itens não são "comprados", são "adquiridos por esforço/confiança".

## 🛠️ Métodos de Execução Técnica

### Fase 1: Arquitetura de Dados (CRUD/SQL)
*   [ ] **Alteração de Tabelas**: Adicionar coluna de nível mínimo em `blessing`, `items` (a criar) e `collectibles`.
*   [ ] **Query de Descoberta**: Adaptar a consulta do Supabase para filtrar por nível de save do jogador (`sa_lv_id`).

### Fase 2: Frontend & UX
*   [ ] **Aba Discoveries**:
    *   Corrigir definitivamente a carga do "Object Levitation".
    *   Adicionar as raridades visualmente (Bordas dinâmicas já em progresso).
    *   Testar comportamento para Nível 0 (Tutorial).
*   [ ] **Interatividade de Peças**:
    *   Mudar animação para que, após 5 cliques, forme um puzzle e desbloqueie uma bênção inicial.

## 📑 Notas de Implementação
> [!IMPORTANT]
> A jornada não é apenas sair, é **lembrar**. O código deve refletir esta descoberta progressiva.

---
*Documento atualizado em: 01/04/2026*
