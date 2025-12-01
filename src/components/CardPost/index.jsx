"use client";

import Image from "next/image";
import { Avatar } from "../Avatar";
import styles from "./cardpost.module.css";
import Link from "next/link";

import { postComment } from "../../actions";
import { ThumbsUpButton } from "./ThumbsUpButton";
import { ModalComment } from "../ModalComment";
import { useLike } from "../../hooks/useLike";

export const CardPost = ({ post, highlight }) => {
  const { likes, isLiking, handleLike, isDisabled } = useLike(
    post.id,
    post.likes
  );

  const submitComment = postComment.bind(null, post);

  return (
    <article className={styles.card} style={{ width: highlight ? 993 : 486 }}>
      <header className={styles.header}>
        <figure style={{ height: highlight ? 300 : 133 }}>
          <Image
            src={post.cover}
            fill
            alt={`Capa do post de titulo: ${post.title}`}
          />
        </figure>
      </header>
      <section className={styles.body}>
        <h2>{post.title}</h2>
        <p>{post.body}</p>
        <Link href={`/posts/${post.slug}`}>Ver detalhes</Link>
      </section>
      <footer className={styles.footer}>
        <div className={styles.actions}>
          <div>
            <ThumbsUpButton
              onClick={handleLike}
              disabled={isDisabled}
              isLoading={isLiking}
            />
            <p>{likes}</p>
          </div>
          <div>
            <ModalComment action={submitComment} />
            <p>{post.comments.length}</p>
          </div>
        </div>
        <Avatar imageSrc={post.author.avatar} name={post.author.username} />
      </footer>
    </article>
  );
};