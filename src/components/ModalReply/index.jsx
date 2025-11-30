"use client";

import { useRef } from "react";
import { Modal } from "../Modal";

import styles from "./replymodal.module.css";
import { Textarea } from "../Textarea";
import { SubmitButton } from "../SubmitButton";
import { Comment } from "../Comment";
import { postReply } from "../../actions";

export const ReplyModal = ({ comment, post, onReplyAdded }) => {
  const modalRef = useRef(null);

  const openModal = () => {
    modalRef.current.openModal();
  };

  const handleSubmit = async (formData) => {
    await postReply(comment, formData);
    modalRef.current.closeModal();

    // Notificar componente pai para atualizar respostas
    if (onReplyAdded) {
      onReplyAdded(comment.id);
    }
  };

  return (
    <>
      <Modal ref={modalRef}>
        <form action={handleSubmit}>
          <div className={styles.body}>
            <Comment comment={comment} />
          </div>
          <div className={styles.divider}></div>
          {/* 
            Respostas usam Markdown também (igual aos comentários)
            - Sintaxe simples e segura
            - ReactMarkdown renderiza com proteção contra XSS
          */}
          <Textarea
            required
            rows={8}
            name="text"
            placeholder="Use Markdown: **negrito** *itálico* [link](url)"
          />
          <div className={styles.footer}>
            <SubmitButton>Responder</SubmitButton>
          </div>
        </form>
      </Modal>
      <button className={styles.btn} onClick={openModal}>
        Responder
      </button>
    </>
  );
};
