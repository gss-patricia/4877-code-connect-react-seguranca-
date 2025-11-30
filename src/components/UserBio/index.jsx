import styles from "./userbio.module.css";

export function UserBio({ bio }) {
  if (!bio) {
    return null;
  }

  return (
    <div className={styles.bioContainer}>
      <h3 className={styles.bioTitle}>Bio</h3>
      <div
        className={styles.bioContent}
        dangerouslySetInnerHTML={{ __html: bio }}
      />
    </div>
  );
}
