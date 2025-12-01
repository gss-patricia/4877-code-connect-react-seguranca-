import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";
import { database } from "../../../lib/database";
import { logEvent, logEventError } from "../../../eventLogger";

/**
 * ⚠️ API ROUTE VULNERÁVEL A CSRF
 *
 * Esta rota NÃO valida token CSRF.
 * Qualquer site pode disparar requisições usando os cookies do usuário.
 *
 * Ataque: O navegador envia cookies automaticamente, mesmo em requests
 * vindos de outros domínios (ex: um <form> malicioso).
 */

export async function POST(request) {
  try {
    logEvent({
      step: "api_like",
      operation: "request_received",
      userId: "pending",
    });

    // 🔐 Verificar autenticação (cookies enviados automaticamente)
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      logEvent({
        step: "api_like",
        operation: "auth_failed",
        userId: "anonymous",
        metadata: { reason: "no_session" },
      });
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Pegar postId do body
    const body = await request.json();
    const postId = body.postId || body.post?.id;

    if (!postId) {
      logEvent({
        step: "api_like",
        operation: "validation_failed",
        userId: user.id,
        metadata: { reason: "missing_postId" },
      });
      return NextResponse.json(
        { error: "postId obrigatório" },
        { status: 400 }
      );
    }

    logEvent({
      step: "api_like",
      operation: "like_increment",
      userId: user.id,
      metadata: { postId },
    });

    // ⚠️ VULNERÁVEL: Sem validação CSRF!
    await database.incrementPostLikes(postId);

    logEvent({
      step: "api_like",
      operation: "like_success",
      userId: user.id,
      metadata: { postId },
    });

    return NextResponse.json({
      success: true,
      message: "Like registrado",
    });
  } catch (error) {
    logEventError({
      step: "api_like",
      operation: "like_error",
      userId: "unknown",
      error: error.message,
      metadata: { stack: error.stack },
    });
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
