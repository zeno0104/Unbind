import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import styles from "./JournalForm.module.css";

export const JournalForm = () => {
  const [text, setText] = useState("");
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [tagMode, setTagMode] = useState("none"); // "none" | "existing" | "new"
  const [selectedTag, setSelectedTag] = useState(null);
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/entries/tags").then((res) => {
      const tags = (res.data || []).filter(Boolean);
      setTagSuggestions(tags);
      if (tags.length === 0) setTagMode("new");
    });
  }, []);

  const pickExisting = (t) => {
    setTagMode("existing");
    setSelectedTag(t);
  };

  const pickNew = () => {
    setTagMode("new");
    setSelectedTag(null);
  };

  const pickNone = () => {
    setTagMode("none");
    setSelectedTag(null);
    setNewTag("");
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError("어떤 일이 있었는지 적어주세요.");
      return;
    }
    setError("");
    const relationshipTag =
      tagMode === "existing"
        ? selectedTag
        : tagMode === "new"
        ? newTag.trim() || null
        : null;
    try {
      const response = await axios.post("/entries", {
        situationText: text,
        relationshipTag,
      });
      navigate(`/entries/${response.data.id}/conversation`);
    } catch (err) {
      console.error("저널 작성 실패", err);
    }
  };

  return (
    <div className={styles.container}>
      <p className={styles.label}>
        누군가와의 관계 때문에 마음에 걸리는 일이 있었나요?
      </p>
      <div className={styles.box}>
        <textarea
          className={styles.textarea}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError("");
          }}
          placeholder="그 사람과 있었던 일, 서운하거나 답답했던 마음을 편하게 적어보세요..."
          rows={4}
        />
        {error && <p className={styles.errorText}>{error}</p>}

        <p className={styles.tagSectionLabel}>누구와의 일인가요?</p>
        <div className={styles.tagChipRow}>
          <button
            type="button"
            className={`${styles.tagChip} ${
              tagMode === "none" ? styles.tagChipActive : ""
            }`}
            onClick={pickNone}
          >
            선택 안 함
          </button>
          {tagSuggestions.map((t) => (
            <button
              type="button"
              key={t}
              className={`${styles.tagChip} ${
                tagMode === "existing" && selectedTag === t ? styles.tagChipActive : ""
              }`}
              onClick={() => pickExisting(t)}
            >
              {t}
            </button>
          ))}
          <button
            type="button"
            className={`${styles.tagChip} ${styles.tagChipGhost} ${
              tagMode === "new" ? styles.tagChipActive : ""
            }`}
            onClick={pickNew}
          >
            + 새로운 사람
          </button>
        </div>

        {tagMode === "new" && (
          <input
            className={styles.tagInput}
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="이름이나 관계를 적어주세요 (예: 김아무개, 직장 상사)"
            autoFocus
          />
        )}

        <div className={styles.btnRow}>
          <button className={styles.submitBtn} onClick={handleSubmit}>
            기록하기
          </button>
        </div>
      </div>
    </div>
  );
};
