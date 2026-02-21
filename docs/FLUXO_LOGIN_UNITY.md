# Fluxo de Login Centralizado: Unity + Web (Google Auth)

Este guia explica como criar um ecrã centralizado no seu site para gerir o login do Unity através do Google, mantendo o utilizador informado em cada etapa.

## 1. O Conceito
Como o Unity tem restrições de segurança para abrir o ecrã de login do Google dentro do próprio jogo, a melhor prática é:
1.  **Unity** abre o navegador padrão do telemóvel/PC num URL específico do seu site.
2.  O **Web Site** mostra o estado do login (Redirecionando -> Autenticando -> Sucesso).
3.  O **Web Site** devolve o código de acesso (Token) para o Unity através de um **Deep Link** (ex: `puzzleofblessings://...`).

---

## 2. Ecrã Centralizado no Site (HTML/CSS/JS)

Crie uma página chamada `unity-login.html` (ou uma rota no seu site) com o seguinte design centralizado:

```html
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sincronizando com o Jogo</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #1a1a1a;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: white;
        }

        .login-card {
            background: rgba(255, 255, 255, 0.05);
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.5);
            text-align: center;
            max-width: 400px;
            width: 90%;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
        }

        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.1);
            border-left: 4px solid #4CAF50;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }

        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        h2 { margin-bottom: 20px; color: #4CAF50; }
        p { color: #ccc; line-height: 1.6; }
        .status { font-weight: bold; margin-top: 10px; color: #fff; }
    </style>
</head>
<body>
    <div class="login-card">
        <div id="loader" class="spinner"></div>
        <h2 id="title">A Vincular...</h2>
        <p id="description">Estamos a preparar a sua conta para o jogo.</p>
        <div id="status" class="status">Redirecionando para o Google...</div>
    </div>

    <script type="module">
        import { createClient } from 'https://jspm.dev/@supabase/supabase-client'

        // --- DADOS DO SEU PROJETO SUPABASE ---
        const SUPABASE_URL = 'https://dwsrfrpguyvpyctdfqid.supabase.co'
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c3JmcnBndXl2cHljdGRmcWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzcyOTAsImV4cCI6MjA3NTI1MzI5MH0.p3Fsa-4e-SSN53JBeTA-hA12Z1Bybc09AoFqExNgYs0'
        // ----------------------------------

        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

        async function handleLogin() {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.href // Volta para aqui após o login
                }
            })
        }

        async function checkSession() {
            const { data: { session } } = await supabase.auth.getSession()
            
            if (session) {
                // FASE 3: LOGIN FEITO
                document.getElementById('title').innerText = "Login Realizado!"
                document.getElementById('status').innerText = "A Enviar dados para o Unity..."
                document.getElementById('loader').style.display = 'none'

                // Envia para o Unity via Deep Link
                const token = session.access_token
                window.location.href = `puzzleofblessings://auth?token=${token}`
                
                // Opcional: Fechar a aba após alguns segundos
                setTimeout(() => {
                    document.getElementById('description').innerText = "Pode voltar ao jogo e fechar esta janela."
                }, 3000)

            } else {
                // FASE 1: REDIRECIONANDO
                setTimeout(() => {
                    handleLogin()
                }, 1500)
            }
        }

        // FASE 2: LOGANDO (Detectado automaticamente pelo Supabase ao voltar do Google)
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                checkSession()
            }
        })

        checkSession()
    </script>
</body>
</html>
```

---

## 3. O que precisa da Google Auth (GCP)

Para este sistema funcionar, precisará de configurar ou fornecer estes dados:

1.  **Client ID (ID de Cliente):** Obtido no Google Cloud Console.
2.  **Client Secret (Chave Secreta):** Obtido no Google Cloud Console.
3.  **Authorized Redirect URI:** Deve ser o link do Supabase (ex: `https://xxxx.supabase.co/auth/v1/callback`).
4.  **Authorized Javascript Origins:** O domínio do seu site (ex: `https://o-seu-site.com`).

**Onde os coloco?**
*   No painel do **Supabase** (`Authentication` -> `Providers` -> `Google`).
*   No código HTML acima, terá de preencher a `SUPABASE_URL` e `SUPABASE_ANON_KEY`.

---

## 4. Configuração no Unity (Deep Link)

Para o Unity "ouvir" o site quando o login termina:

1.  **Android:** Vá a `Project Settings` -> `Player` -> `Android` -> `Publishing Settings`. Edite o `AndroidManifest.xml` para incluir o esquema `puzzleofblessings`.
2.  **iOS:** Vá a `Project Settings` -> `Player` -> `iOS` -> `Supported URL schemes`. Adicione `puzzleofblessings`.
3.  **Código C#:**

```csharp
using UnityEngine;
using System;

public class UnityLoginManager : MonoBehaviour
{
    void Awake()
    {
        Application.deepLinkActivated += onDeepLinkActivated;
        if (!string.IsNullOrEmpty(Application.absoluteURL))
            onDeepLinkActivated(Application.absoluteURL);
    }

    private void onDeepLinkActivated(string url)
    {
        Debug.Log("Recebido Deep Link: " + url);
        if (url.Contains("auth?token="))
        {
            string token = url.Split('=')[1];
            // Agora use este token para autenticar o utilizador no SDK do Supabase no Unity
            Debug.Log("Token recebido! A logar no jogo...");
        }
    }

    public void OpenLoginBrowser()
    {
        Application.OpenURL("https://o-seu-site.com/unity-login.html");
    }
}
```

---

## 5. Resumo das Mensagens no Ecrã

O ecrã centralizado mudará automaticamente:
*   **Inicial:** "A Vincular..." -> "Redirecionando para o Google..."
*   **Após clicar no Google:** (O navegador do Google assume o controlo)
*   **Ao voltar do Google:** "Login Realizado!" -> "A Enviar dados para o Unity..."
*   **Final:** "Pode voltar ao jogo e fechar esta janela."
