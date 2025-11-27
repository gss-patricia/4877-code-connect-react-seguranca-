"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { Spinner } from "../../components/Spinner";
import { ErrorMessage } from "../../components/ErrorMessage";
import { resetPassword } from "../../actions/passwordReset";

/**
 * ⚠️ PÁGINA VULNERÁVEL DE RESET PASSWORD
 *
 * Demonstra vulnerabilidades que serão corrigidas no curso:
 * - Token visível na URL (vaza em logs/Referer)
 * - Token pode ser reutilizado
 * - Sem verificação de expiração
 * - Sem validação adequada
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [decodedEmail, setDecodedEmail] = useState("");

  useEffect(() => {
    if (!token) {
      setErrorMessage("Token não encontrado na URL");
    } else {
      // Tentar decodificar o token para mostrar a vulnerabilidade
      try {
        const tokenData = JSON.parse(
          atob(token.replace(/-/g, "+").replace(/_/g, "/"))
        );
        setDecodedEmail(tokenData.email);
      } catch (e) {
        // Se falhar, não é crítico
      }
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setErrorMessage("Todos os campos são obrigatórios");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // ⚠️ VULNERÁVEL: Token na URL pode ser interceptado
      const result = await resetPassword(token, password);

      if (result.success) {
        setSuccessMessage(result.message);

        // Redirecionar após 3 segundos
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setErrorMessage(result.error);
      }
    } catch (error) {
      console.error("Erro ao resetar senha:", error);
      setErrorMessage("Erro ao processar solicitação");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.resetContainer}>
      <div className={styles.resetCard}>
        <div className={styles.resetContent}>
          <h1 className={styles.heading}>Redefinir Senha</h1>

          {token && (
            <div className={styles.tokenDebug}>
              <strong>🔓 Token na URL (visível):</strong>
              <code>{token.substring(0, 32)}...</code>
              {decodedEmail && (
                <>
                  <strong style={{ marginTop: "1rem", display: "block" }}>
                    👤 Email decodificado do token:
                  </strong>
                  <code style={{ background: "#ff4444", color: "white" }}>
                    {decodedEmail}
                  </code>
                  <p style={{ marginTop: "0.5rem" }}>
                    <small>
                      ⚠️ Qualquer pessoa pode decodificar base64url e ver o
                      email!
                    </small>
                  </p>
                </>
              )}
              <p>
                <small>
                  ⚠️ Token vaza em logs, histórico do navegador, analytics,
                  Referer header!
                </small>
              </p>
            </div>
          )}

          {!token ? (
            <ErrorMessage message="Token inválido ou não fornecido" />
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <Input
                  label="Nova Senha"
                  type="password"
                  placeholder="Digite sua nova senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <Input
                  label="Confirmar Senha"
                  type="password"
                  placeholder="Confirme sua nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={!password || !confirmPassword || isLoading}
              >
                {isLoading ? <Spinner /> : "Redefinir Senha"}
              </Button>
            </form>
          )}

          {errorMessage && <ErrorMessage message={errorMessage} />}

          {successMessage && (
            <div className={styles.successMessage}>
              <p>{successMessage}</p>
              <p>
                <small>Redirecionando para login...</small>
              </p>
            </div>
          )}

          <div className={styles.vulnerabilityInfo}>
            <h3>🔍 Vulnerabilidades desta implementação:</h3>
            <ul>
              <li>✗ Token visível na URL (vaza em logs/Referer)</li>
              <li>✗ Token contém email em base64url (fácil decodificar)</li>
              <li>✗ Sem verificação de expiração</li>
              <li>✗ Token pode ser reutilizado infinitamente</li>
              <li>✗ Sem rate limiting</li>
              <li>
                ✗ Qualquer pessoa com o token pode trocar a senha DE VERDADE
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
