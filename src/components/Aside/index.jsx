"use client";

import Image from "next/image";
import styles from "./aside.module.css";

import logo from "./logo.png";
import Link from "next/link";
import { LastUpdateTime } from "./LastUpdateTime";
import { useAuth } from "../../hooks/useAuth";

export const Aside = () => {
  const { user, loading } = useAuth();

  return (
    <aside className={styles.aside}>
      <Link href="/">
        <Image src={logo} alt="Logo da Code Connect" />
      </Link>
      {!loading && user && (
        <nav className={styles.nav}>
          <Link href="/profile" className={styles.profileLink}>
            Meu Perfil
          </Link>
        </nav>
      )}
      <div className={styles.lastUpdate}>
        <small>Última atualização:</small>
        <LastUpdateTime />
      </div>
    </aside>
  );
};
