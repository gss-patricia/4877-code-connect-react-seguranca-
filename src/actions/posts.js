"use server";

import { createClient } from "../utils/supabase/server";
import { database } from "../lib/database";
import { revalidatePath } from "next/cache";
import db from "../../supabase/db";

/**
 * ⚠️ VULNERÁVEL A CSRF E SEM VERIFICAÇÃO DE AUTORIZAÇÃO
 * 
 * Esta action tem múltiplas vulnerabilidades que serão corrigidas durante o curso:
 * 
 * MÓDULO 1 (CSRF):
 * - Sem verificação de token CSRF
 * - Qualquer site pode fazer POST request
 * 
 * MÓDULO 3 (RBAC/ABAC):
 * - Sem verificação de role
 * - Sem verificação de ownership
 * - Qualquer usuário autenticado pode deletar qualquer post
 */
export async function deletePost(postId) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Não autenticado" };
    }

    // ⚠️ VULNERÁVEL: Sem verificação CSRF
    // ⚠️ VULNERÁVEL: Sem verificação de role
    // ⚠️ VULNERÁVEL: Sem verificação de ownership

    // Deletar post sem nenhuma verificação de autorização
    const { error } = await db.from("Post").delete().eq("id", postId);

    if (error) {
      console.error("Erro ao deletar post:", error);
      return { success: false, error: "Erro ao deletar post" };
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar post:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

