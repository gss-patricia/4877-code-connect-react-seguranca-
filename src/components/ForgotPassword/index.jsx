"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./forgotpassword.module.css";
import { Input } from "../Input";
import { Button } from "../Button";
import { Link } from "../Link";
import { Spinner } from "../Spinner";
import { ErrorMessage } from "../ErrorMessage";
import { requestPasswordReset } from "../../actions/passwordReset";

/**
 * ⚠️ COMPONENTE COM VERSÃO INSEGURA DE RESET PASSWORD
 *
 * Durante o curso (Módulo 2 - Vídeo 2.4), vamos corrigir as vulnerabilidades!
 */
export const ForgotPassword = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [debugToken, setDebugToken] = useState("");
  const [debugUrl, setDebugUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setErrorMessage("Email é obrigatório");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setDebugToken("");
    setDebugUrl("");

    try {
      // ⚠️ VERSÃO INSEGURA: Token em texto plano, sem expiração
      const result = await requestPasswordReset(email);

      if (result.success) {
        setSuccessMessage(result.message);
        if (result.debugToken) {
          setDebugToken(result.debugToken);
        }
        if (result.debugUrl) {
          setDebugUrl(result.debugUrl);
        }
      } else {
        setErrorMessage(result.error);
      }
    } catch (error) {
      console.error("Erro ao solicitar reset:", error);
      setErrorMessage("Erro ao enviar email de recuperação");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.forgotContainer}>
      <div className={styles.forgotCard}>
        <div className={styles.forgotContent}>
          <h1 className={styles.heading}>Esqueci minha senha</h1>

          <p className={styles.subtitle}>
            Digite seu email e enviaremos um link para redefinir sua senha
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <Input
                label="Email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!email ? "Campo obrigatório" : null}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={!email || isLoading}
            >
              {isLoading ? <Spinner /> : "Enviar Email"}
            </Button>
          </form>

          {errorMessage && <ErrorMessage message={errorMessage} />}
          {successMessage && (
            <div className={styles.successMessage}>{successMessage}</div>
          )}

          {debugToken && (
            <div className={styles.debugBox}>
              <strong>🔓 Token (para demonstração):</strong>
              <code>{debugToken}</code>
              {debugUrl && (
                <>
                  <strong style={{ marginTop: "1rem", display: "block" }}>
                    🔗 URL de Reset:
                  </strong>
                  <code style={{ fontSize: "0.75rem", wordBreak: "break-all" }}>
                    {debugUrl}
                  </code>
                </>
              )}
              <p>
                <small>
                  ⚠️ Vulnerabilidades: Token em texto plano, sem expiração,
                  reutilizável, vaza na URL!
                </small>
              </p>
            </div>
          )}

          <div className={styles.backToLogin}>
            <Link href="/login" variant="light">
              ← Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
