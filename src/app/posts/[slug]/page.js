"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useProtectedRoute } from "../../../hooks/useProtectedRoute";

import styles from "./page.module.css";
import { CardPost } from "../../../components/CardPost";
import { CommentList } from "../../../components/CommentList";
import { ModalComment } from "../../../components/ModalComment";
import { Spinner } from "../../../components/Spinner";
import { DeletePostButton } from "../../../components/DeletePostButton";
import { postComment } from "../../../actions";
import { logEvent } from "../../../eventLogger";

const PagePost = () => {
  // ✅ PROTEÇÃO CLIENT-SIDE: Hook customizado
  const { user, loading: authLoading } = useProtectedRoute();
  const params = useParams();
  const slug = params.slug;

  logEvent({
    step: "PAGE_VIEW",
    operation: "POST_SLUG_VIEW",
    userId: user?.id,
    metadata: { slug },
  });

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carregar post e comentários via API
  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);

        // ✅ CHAMAR API ROUTE
        const response = await fetch(`/api/posts/${slug}`);

        if (!response.ok) {
          throw new Error(`Post não encontrado: ${response.status}`);
        }

        const postData = await response.json();

        setPost(postData);
        setComments(postData.comments || []);

        console.log(
          "📝 Comentários carregados via API:",
          postData.comments?.length || 0
        );
      } catch (error) {
        console.error("Erro ao carregar post:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug && user) {
      loadPost();
    }
  }, [slug, user]);

  // Handler para quando um comentário é adicionado
  const handleCommentAdded = async () => {
    console.log("🔄 PagePost: handleCommentAdded iniciado");
    console.log("🔄 PagePost: comentários ANTES:", comments.length);

    try {
      // ✅ RECARREGAR VIA API
      console.log("🔄 PagePost: fazendo fetch para /api/posts/" + slug);
      const response = await fetch(`/api/posts/${slug}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const postData = await response.json();
      console.log(
        "📝 PagePost: dados recebidos da API:",
        postData.comments?.length || 0,
        "comentários"
      );

      setComments(postData.comments || []);

      console.log("✅ PagePost: setComments executado");
      console.log(
        "✅ PagePost: comentários DEPOIS:",
        postData.comments?.length || 0
      );
    } catch (error) {
      console.error("❌ PagePost: erro ao recarregar comentários:", error);
    }
  };

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <Spinner />
      </div>
    );
  }

  // Se não estiver autenticado, não renderizar nada (vai redirecionar)
  if (!user) {
    return null;
  }

  if (loading) {
    return <div className={styles.bodyMessage}>Carregando...</div>;
  }

  if (!post) {
    return <div className={styles.bodyMessage}>Post não encontrado</div>;
  }

  return (
    <div>
      <CardPost post={post} highlight />

      {/* ⚠️ VULNERÁVEL: Botão de delete sem RBAC/ABAC - qualquer usuário pode deletar */}
      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <DeletePostButton postId={post.id} />
      </div>

      <h3 className={styles.subtitle}>Código:</h3>
      <div className={styles.code}>
        <div dangerouslySetInnerHTML={{ __html: post.markdown }} />
      </div>
      <ModalComment
        action={postComment.bind(null, post)}
        onCommentAdded={handleCommentAdded}
        hideButton={true}
      />
      <CommentList comments={comments} onReplyAdded={handleCommentAdded} />
    </div>
  );
};

export default PagePost;
