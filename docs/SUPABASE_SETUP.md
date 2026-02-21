# Integração com Supabase

## 📦 Instalação

```bash
npm install @supabase/supabase-js
```

## 🔧 Configuração

1. Criar arquivo `src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

2. Criar arquivo `.env` na raiz:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📝 Exemplos de Uso

### Forum (Criar Tópico)

```javascript
import { supabase } from '../lib/supabase'

const createTopic = async (title, category, content) => {
  const { data, error } = await supabase
    .from('topics')
    .insert([
      { title, category, content, created_at: new Date() }
    ])
  
  if (error) throw error
  return data
}
```

### Wiki (Buscar Itens)

```javascript
import { supabase } from '../lib/supabase'

const getWikiItems = async (filter = 'all') => {
  let query = supabase.from('wiki_items').select('*')
  
  if (filter !== 'all') {
    query = query.eq('type', filter)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}
```

### Forum (Listar Tópicos)

```javascript
const getTopics = async () => {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}
```

## 🎯 Não Precisa de PHP

- ❌ Não use arquivos `.php`
- ✅ Use React hooks (useState, useEffect)
- ✅ Use Supabase client diretamente
- ✅ Use React Query ou SWR para cache (opcional)

## 📚 Recursos

- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase React Examples](https://supabase.com/docs/guides/getting-started/tutorials/with-react)

