"use server";

import { createClient } from "../utils/supabase/server";
import { database } from "../lib/database";
import { revalidatePath } from "next/cache";
import db from "../../supabase/db";

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
