# Arquivos PHP Legados

Os arquivos PHP abaixo são do projeto anterior e **NÃO são necessários para o projeto React**.

## ⚠️ Arquivos que podem ser removidos:

- `index.php`
- `centro.php`
- `forum.php`
- `wiki.php`
- `updatelog.php`
- `credits.php`

## 📝 Nota sobre Supabase

**Os arquivos PHP NÃO são necessários para integração com Supabase.**

Supabase funciona diretamente com JavaScript/TypeScript através de:
- `@supabase/supabase-js` - SDK oficial do Supabase
- Queries diretas do frontend React
- Funções Edge (Deno) se necessário para lógica server-side

### Como integrar Supabase no React:

1. Instalar: `npm install @supabase/supabase-js`
2. Criar cliente Supabase em `src/lib/supabase.js`
3. Usar hooks React para queries/mutações
4. **Não há necessidade de arquivos PHP**

## 🗑️ Remoção Segura

Se quiser manter os arquivos PHP como backup, mova-os para uma pasta `_legacy/`:

```bash
mkdir _legacy
mv *.php _legacy/
```

Ou simplesmente delete-os se não precisar mais.

## ✅ Projeto React Atual

Todo o projeto está em `src/` usando:
- React 18
- React Router
- Vite
- CSS preservado

O projeto está 100% convertido para React e pronto para uso.

