"use server";

import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function requestPasswordReset(email) {
  try {
    const tokenData = JSON.stringify({ email, timestamp: Date.now() });
    const token = Buffer.from(tokenData).toString("base64url");

    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

    console.log("\n🔓 Token de reset (INSEGURO):");
    console.log("Email:", email);
    console.log("Token (base64):", token);
    console.log("Token decodificado:", tokenData);
    console.log("URL:", resetUrl);
    console.log("\n⚠️  Problemas:");
    console.log("   - Token contém o email em base64 (fácil decodificar)");
    console.log("   - Token em texto plano");
    console.log("   - Sem expiração");
    console.log("   - Pode ser reutilizado");
    console.log("   - Vaza em logs/Referer\n");

    // Simular envio de email
    console.log(`📧 Email simulado para: ${email}`);

    return {
      success: true,
      message: "Link de recuperação enviado! Verifique sua caixa de entrada.",
      // ⚠️ DANGER: Retornando token para fins de demonstração
      // Em produção NUNCA faça isso!
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
    // ⚠️ VULNERÁVEL: Decodificar token que veio da URL
    const tokenData = JSON.parse(
      Buffer.from(token, "base64url").toString("utf-8")
    );
    const { email } = tokenData;

    console.log("\n🔓 Reset de senha (REAL - VULNERÁVEL):");
    console.log("Token recebido:", token.substring(0, 32) + "...");
    console.log("Email decodificado do token:", email);
    console.log("Nova senha:", "***" + newPassword.slice(-3));
    console.log("\n⚠️  VULNERABILIDADES DEMONSTRADAS:");
    console.log("   ✗ Token veio da URL (vaza em logs/Referer)");
    console.log("   ✗ Token contém email em base64 (fácil decodificar)");
    console.log("   ✗ Sem verificação de expiração");
    console.log("   ✗ Token pode ser reutilizado infinitamente");
    console.log(
      "   ✗ Qualquer pessoa com o token pode trocar a senha DE VERDADE"
    );

    // ⚠️ CRIAR ADMIN CLIENT (usa Service Role Key)
    // Em produção real, você NUNCA faria isso assim!
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

    // ⚠️ TROCAR SENHA DE VERDADE usando Admin API
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: newPassword,
      });

    if (updateError) {
      console.error("Erro ao atualizar senha:", updateError);
      return { success: false, error: "Erro ao trocar senha" };
    }

    console.log("\n✅ SENHA TROCADA DE VERDADE!");
    console.log("   - Usuário:", email);
    console.log("   - Nova senha definida com sucesso");
    console.log("\n💡 CORREÇÕES NO CURSO:");
    console.log("   ✓ Usar Supabase Auth resetPasswordForEmail()");
    console.log("   ✓ Token hasheado no banco");
    console.log("   ✓ Expiração de 15 minutos");
    console.log("   ✓ One-time use (flag 'used')");
    console.log("   ✓ Token só no email, não na URL\n");

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
