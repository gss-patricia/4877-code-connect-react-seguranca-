"use server";

import { revalidatePath } from "next/cache";
import { database } from "../lib/database";
import { createClient } from "../utils/supabase/server";

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

    /* 
      Markdown é texto puro, NÃO precisa sanitizar!
      
      Por que não sanitizamos aqui?
      - Markdown usa sintaxe própria: **negrito**, *itálico*, [link](url)
      - Isso é só TEXTO, não é código executável
      - O ReactMarkdown que renderiza já faz a conversão segura
      - Ele tem allowedElements que bloqueia tags perigosas
      
      Diferença da abordagem anterior (HTML + sanitização):
      - Antes: usuário escrevia HTML → sanitizávamos → salvávamos HTML limpo
      - Agora: usuário escreve Markdown → salvamos texto → ReactMarkdown converte com segurança
      
      Vantagens:
      - Código mais simples (sem sanitização complexa)
      - Mais seguro (Markdown é texto, não código)
      - Melhor UX (sintaxe mais amigável que HTML)
    */
    const text = formData.get("text");

    // Validações simples
    if (!text || text.trim() === "") {
      throw new Error("Comentário não pode estar vazio");
    }

    if (text.length > 1000) {
      throw new Error("Comentário muito longo (máximo 1000 caracteres)");
    }

    // Salva Markdown puro no banco (é só texto!)
    await database.createComment(text.trim(), author.id, post.id);
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

    /* 
      Respostas também usam Markdown (mesma lógica dos comentários)
      - Salva texto Markdown puro no banco
      - ReactMarkdown converte na hora de exibir
      - Seguro contra XSS sem precisar sanitizar
    */
    const text = formData.get("text");

    // Validações simples
    if (!text || text.trim() === "") {
      throw new Error("Resposta não pode estar vazia");
    }

    if (text.length > 1000) {
      throw new Error("Resposta muito longa (máximo 1000 caracteres)");
    }

    // Criar o comentário usando o postId do parent
    await database.createComment(
      text.trim(),
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
