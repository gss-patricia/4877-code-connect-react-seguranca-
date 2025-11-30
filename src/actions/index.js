"use server";

import { revalidatePath } from "next/cache";
import { database } from "../lib/database";
import { createClient } from "../utils/supabase/server";
import { sanitizeHTML } from "../lib/sanitizer";

export async function incrementThumbsUp(post) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error("Não autenticado");
    }

    await database.incrementPostLikes(post.id);
    revalidatePath("/");
    revalidatePath(`/${post.slug}`);
  } catch (err) {
    throw err;
  }
}

export async function postComment(post, formData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.log("Auth error");
      throw new Error("Não autenticado");
    }

    // Buscar ou criar o usuário no banco de dados usando o email do supabase
    const username = user.email.split("@")[0];
    const author = await database.getOrCreateUser(username);

    // ✅ Sanitizar comentário antes de salvar (remove TODO HTML)
    const rawText = formData.get("text");
    const cleanText = sanitizeHTML(rawText, "text"); // Remove TODO HTML, só texto puro

    await database.createComment(cleanText, author.id, post.id);
    revalidatePath("/");
    revalidatePath(`/${post.slug}`);
  } catch (err) {
    console.error("Comment error:", err);
    throw err;
  }
}

export async function postReply(parent, formData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error("Não autenticado");
    }

    const username = user.email.split("@")[0];
    const author = await database.getOrCreateUser(username);

    // ✅ Sanitizar resposta antes de salvar (remove TODO HTML)
    const rawText = formData.get("text");
    const cleanText = sanitizeHTML(rawText, "text"); // Remove TODO HTML, só texto puro

    // Criar o comentário usando o postId do parent
    await database.createComment(
      cleanText, // ← ✅ Texto sanitizado (só texto puro)
      author.id,
      parent.postId, // Usar postId do comment
      parent.parentId ?? parent.id // Parent ID (se for resposta à resposta)
    );

    // Buscar o post para pegar o slug para revalidate
    const post = await database.getPostById(parent.postId);
    revalidatePath(`/${post.slug}`);
  } catch (err) {
    console.error("Reply error:", err);
    throw err;
  }
}
