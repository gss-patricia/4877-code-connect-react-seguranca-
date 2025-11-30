"use server";

import { createClient } from "@supabase/supabase-js";

export async function requestPasswordReset(email) {
  try {
    const tokenData = JSON.stringify({ email, timestamp: Date.now() });
    const token = Buffer.from(tokenData).toString("base64url");

    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

    return {
      success: true,
      message:
        "Se este email existir, enviaremos um link de recuperação. (Modo de demonstração: exibindo token inseguro abaixo)",
      debugToken: token,
      debugUrl: resetUrl,
    };
  } catch (error) {
    console.error("Erro ao solicitar reset:", error);
    return { success: false, error: "Erro ao processar solicitação" };
  }
}

export async function resetPassword(token, newPassword) {
  try {
    const tokenData = JSON.parse(
      Buffer.from(token, "base64url").toString("utf-8")
    );
    const { email } = tokenData;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
      console.error("❌ SUPABASE_SERVICE_ROLE_KEY não configurada!");
      return {
        success: false,
        error: "Configuração do servidor incompleta",
      };
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Buscar usuário por email no Supabase Auth
    const { data: users, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error("Erro ao buscar usuários:", listError);
      return { success: false, error: "Erro ao processar solicitação" };
    }

    const user = users.users.find((u) => u.email === email);

    if (!user) {
      console.error("Usuário não encontrado:", email);
      return { success: false, error: "Usuário não encontrado" };
    }

    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: newPassword,
      });

    if (updateError) {
      console.error("Erro ao atualizar senha:", updateError);
      return { success: false, error: "Erro ao trocar senha" };
    }

    return {
      success: true,
      message: "✅ Senha alterada com sucesso! Faça login com sua nova senha.",
    };
  } catch (error) {
    console.error("Erro ao resetar senha:", error);
    return {
      success: false,
      error: "Token inválido ou erro ao processar",
    };
  }
}
