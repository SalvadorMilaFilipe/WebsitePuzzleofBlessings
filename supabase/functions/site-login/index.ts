/// <reference lib="deno.ns" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type LoginBody = {
  email?: string;
  password?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, password } = (await req.json()) as LoginBody;
    const trimmedEmail = (email ?? "").trim().toLowerCase();
    const rawPassword = (password ?? "").toString();

    if (!trimmedEmail || !rawPassword) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing server configuration" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Admin client: read player table + manage auth users
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1) Validate credentials against DB using our new secure RPC function
    const { data: isValid, error: rpcError } = await admin.rpc('verify_player_password', {
      p_email: trimmedEmail,
      p_password: rawPassword
    });

    if (rpcError) {
      return new Response(JSON.stringify({ error: "Failed to verify password: " + rpcError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid login credentials" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    // 2) Ensure a Supabase Auth user exists + has this password
    // supabase-js doesn't provide getUserByEmail; we page through a small list.
    const { data: usersPage, error: listError } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 2000,
    });

    if (listError) {
      return new Response(JSON.stringify({ error: listError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const existing = (usersPage?.users ?? []).find(
      (u) => (u.email ?? "").toLowerCase() === trimmedEmail,
    );

    if (!existing) {
      const { error: createError } = await admin.auth.admin.createUser({
        email: trimmedEmail,
        password: rawPassword,
        email_confirm: true,
      });
      if (createError) {
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      const { error: updateError } = await admin.auth.admin.updateUserById(existing.id, {
        password: rawPassword,
      });
      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 3) Sign in with Auth to return tokens to the client
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email: trimmedEmail,
      password: rawPassword,
    });

    if (authError || !authData.session) {
      return new Response(JSON.stringify({ error: authError?.message || "Auth sign-in failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ session: authData.session }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

