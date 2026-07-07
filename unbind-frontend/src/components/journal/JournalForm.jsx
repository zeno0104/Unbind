import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import styles from "./JournalForm.module.css";

export const JournalForm = () => {
  const [text, setText] = useState("");
  const [tag, setTag] = useState("");
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/entries/tags").then((res) => setTagSuggestions(res.data));
  }, []);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    try {
      const response = await axios.post("/entries", {
        situationText: text,
        relationshipTag: tag.trim() || null,
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
          onChange={(e) => setText(e.target.value)}
          placeholder="그 사람과 있었던 일, 서운하거나 답답했던 마음을 편하게 적어보세요..."
          rows={4}
        />
        <input
          className={styles.tagInput}
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="누구와의 일인가요? (선택, 예: 김아무개)"
          list="relationship-tag-suggestions"
        />
        <datalist id="relationship-tag-suggestions">
          {tagSuggestions.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
        <div className={styles.btnRow}>
          <button className={styles.submitBtn} onClick={handleSubmit}>
            기록하기
          </button>
        </div>
      </div>
    </div>
  );
};
