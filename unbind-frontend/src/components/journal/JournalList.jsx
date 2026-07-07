import { useState } from "react";
import styles from "./JournalList.module.css";

export const JournalList = ({ entries, onSelect }) => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? entries : entries.slice(0, 3);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}.${date.getDate()}`;
  };

  return (
    <div className={styles.container}>
      <p className={styles.label}>지난 기록</p>
      <div className={styles.box}>
        {entries.length === 0 ? (
          <p className={styles.empty}>아직 기록이 없어요</p>
        ) : (
          visible.map((item) => (
            <div
              key={item.id}
              className={styles.item}
              onClick={() => onSelect(item.id)}
            >
              <span className={styles.date}>{formatDate(item.createdAt)}</span>
              <span className={styles.text}>{item.situationText}</span>
            </div>
          ))
        )}
      </div>
      {entries.length > 3 && (
        <button
          className={styles.moreBtn}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "접기" : `더보기 (${entries.length - 3})`}
        </button>
      )}
    </div>
  );
};
