"use server";

import { createClient } from "../utils/supabase/server";
import { database } from "../lib/database";
import { revalidatePath } from "next/cache";
import db from "../../supabase/db";
import { logEventError } from "@/eventLogger";
import { canDeletePost } from "@/lib/authorization";

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
    const dbUser = await database.getUserByUsername(username);

    if (!dbUser) {
      logEventError({
        step: "AUTHORIZATION",
        operation: "USER_NOT_FOUND",
        error: "User not found",
        metadata: { username },
      });
      return { success: false, error: "Usuário não encontrado" };
    }

    const post = await database.getPostById(postId);

    if (!post) {
      logEventError({
        step: "AUTHORIZATION",
        operation: "POST_NOT_FOUND",
        error: "Post not found",
        metadata: {
          postId,
        },
      });

      return { success: false, error: "Post não encontrado" };
    }

    const authResult = canDeletePost(dbUser, post);

    if (!authResult.allowed) {
      logEventError({
        step: "AUTHORIZATION",
        operation: "DELETE_POST_DENIED",
        error: "Insufficient permissions",
        metadata: {
          postId,
          username,
          userRole: dbUser.role,
          postReportCount: post.reportCount,
          authResult,
        },
      });

      return {
        success: false,
        error: "Você não tem permissão para deletar este post",
      };
    }

    const { error } = await db.from("Post").delete().eq("id", postId);

    if (error) {
      console.error("Erro ao deletar post:", error);
      return { success: false, error: "Erro ao deletar post" };
    }

    revalidatePath("/");
    revalidatePath("/posts");
    revalidatePath(`/posts/${postId}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar post:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}
