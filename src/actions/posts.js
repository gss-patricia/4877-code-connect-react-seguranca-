"use server";

import { createClient } from "../utils/supabase/server";
import { database } from "../lib/database";
import { revalidatePath } from "next/cache";
import db from "../../supabase/db";
import { logEventError } from "@/eventLogger";

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

    const username = user.email.split("@")[0];
    const dbUser = await database.getUserByUsername(username)

    if (!dbUser) {
      logEventError({
        step: "AUTHORIZATION",
        operation: "USER_NOT_FOUND",
        error: "User not found",
        metadata: { username }
      })
      return { success: false, error: "Usuário não encontrado" }
    }

    //RBAC: apenas admin pode deletar
    if (dbUser.role !== "admin") {
      logEventError({
        step: "AUTHORIZATION",
        operation: "DELETE_POST_DENIED",
        error: "Insufficient permissions",
        metadata: {
          postId,
          username,
          userRole: dbUser.role,
          requiredRole: "admin"
        }
      })

      return { success: false, error: "Apenas administradores podem deletar posts" }
    }

    const { error } = await db.from("Post").delete().eq("id", postId);

    if (error) {
      console.error("Erro ao deletar post:", error);
      return { success: false, error: "Erro ao deletar post" };
    }

    revalidatePath("/");
    revalidatePath("/posts");
    revalidatePath(`/posts/${postId}`)
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar post:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}

