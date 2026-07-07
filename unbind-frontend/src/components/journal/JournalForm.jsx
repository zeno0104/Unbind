import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import styles from "./JournalForm.module.css";

export const JournalForm = () => {
  const [text, setText] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!text.trim()) return;
    try {
      const response = await axios.post("/entries", { situationText: text });
      navigate(`/entries/${response.data.id}/conversation`);
    } catch (err) {
      console.error("저널 작성 실패", err);
    }
  };

  return (
    <div className={styles.container}>
      <p className={styles.label}>오늘 있었던 일을 적어보세요</p>
      <div className={styles.box}>
        <textarea
          className={styles.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="오늘 있었던 일을 자유롭게 적어보세요..."
          rows={4}
        />
        <div className={styles.btnRow}>
          <button className={styles.submitBtn} onClick={handleSubmit}>
            기록하기
          </button>
        </div>
      </div>
    </div>
  );
};
