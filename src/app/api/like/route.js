import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";
import { database } from "../../../lib/database";

export async function POST(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.log("❌ Usuário não autenticado");
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Pegar postId do body
    const body = await request.json();
    const postId = body.postId || body.post?.id;

    if (!postId) {
      return NextResponse.json(
        { error: "postId obrigatório" },
        { status: 400 }
      );
    }

    console.log(
      `👍 Incrementando like no post ${postId} pelo usuário ${user.email}`
    );

    // Incrementar like
    await database.incrementPostLikes(postId);

    console.log(`✅ Like incrementado com sucesso no post ${postId}`);

    // Pegar origem do request
    const origin = request.headers.get("origin") || "null";

    return NextResponse.json(
      { success: true, message: "Like registrado" },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  } catch (error) {
    console.error("Erro ao processar like:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// TODO: Remover CORS permissivo para testes
export async function OPTIONS(request) {
  // Pegar origem do request
  const origin = request.headers.get("origin") || "null";

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
