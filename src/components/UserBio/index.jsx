import styles from "./userbio.module.css";
import ReactMardown from "react-markdown"

export function UserBio({ bio }) {
  if (!bio) {
    return null;
  }

  return (
    <div className={styles.bioContainer}>
      <h3 className={styles.bioTitle}>Bio</h3>
      <div
        className={styles.bioContent}
      >
        <ReactMardown allowedElements={[
          "p",
          "strong",
          "ul",
          "ol",
          "il",
          "br",
          "em"
        ]}>
          {bio}
        </ReactMardown>
      </div>
    </div>
  );
}
