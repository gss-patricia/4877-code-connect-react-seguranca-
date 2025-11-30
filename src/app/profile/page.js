import { createClient } from "../../utils/supabase/server";
import { database } from "../../lib/database";
import { Avatar } from "../../components/Avatar";
import { Button } from "../../components/Button";
import { UserBio } from "../../components/UserBio";
import Link from "next/link";
import styles from "./page.module.css";

export default async function ProfilePage() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return (
        <div className={styles.container}>
          <p>Você precisa estar logado para ver seu perfil.</p>
          <Link href="/login">
            <Button>Fazer Login</Button>
          </Link>
        </div>
      );
    }

    const dbUser = await database.getUserByUsername(user.email.split("@")[0]);

    if (!dbUser) {
      return (
        <div className={styles.container}>
          <p>Usuário não encontrado no banco de dados.</p>
          <p>Email: {user.email}</p>
          <Link href="/">
            <Button>Voltar para Home</Button>
          </Link>
        </div>
      );
    }

    return (
      <div className={styles.container}>
        <div className={styles.profileCard}>
          <div className={styles.header}>
            <Avatar src={dbUser.avatar} alt={dbUser.name} />
            <div className={styles.userInfo}>
              <h1>{dbUser.name}</h1>
              <p className={styles.username}>@{dbUser.username}</p>
              {dbUser.role && dbUser.role !== "user" && (
                <span className={styles.roleBadge}>{dbUser.role}</span>
              )}
            </div>
          </div>

          <div className={styles.content}>
            <div className={styles.infoSection}>
              <h3>Informações</h3>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Role:</strong> {dbUser.role || "user"}
              </p>
            </div>

            <UserBio bio={dbUser.bio} />
          </div>

          <div className={styles.actions}>
            <Link href="/profile/edit">
              <Button variant="primary">Editar Perfil</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
    return (
      <div className={styles.container}>
        <p>❌ Erro ao carregar perfil.</p>
        <p>Possível causa: Supabase pausado ou erro de conexão.</p>
        <Link href="/">
          <Button>Voltar para Home</Button>
        </Link>
      </div>
    );
  }
}
