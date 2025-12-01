import { NextResponse } from "next/server";
import {
  getCSRFToken,
  createCSRFToken,
  setCSRFCookie,
} from "../../../lib/csrf";
import { logEvent } from "@/eventLogger";

/**
 * 🎫 Endpoint para obter o token CSRF
 *
 * O frontend chama esta rota para pegar o token
 * e depois envia no header X-CSRF-Token
 *
 * FUNCIONAMENTO:
 * 1. Tenta ler token do cookie (setado pelo middleware)
 * 2. Se não existir, cria um novo (fallback)
 * 3. Retorna o token para o frontend
 */
export async function GET() {
  let csrfToken = await getCSRFToken();

  // ✅ FALLBACK: Se middleware não executou, criar token aqui
  if (!csrfToken) {
    logEvent({
      step: "GET /api/csrf-token",
      operation: "create fallback token",
    });
    csrfToken = createCSRFToken();
    await setCSRFCookie(csrfToken);
  }

  return NextResponse.json({ csrfToken });
}
