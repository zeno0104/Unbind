import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { Sidebar } from "../components/layout/Sidebar";
import styles from "./Feedback.module.css";

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toISOString().slice(0, 16).replace("T", " ");
};

export const Feedback = () => {
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [sent, setSent] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const [boardLoading, setBoardLoading] = useState(false);

  useEffect(() => {
    axios.get("/users/me").then((res) => {
      if (res.data.admin) {
        setIsAdmin(true);
        setBoardLoading(true);
        axios
          .get("/feedback")
          .then((r) => setFeedbackList(r.data))
          .finally(() => setBoardLoading(false));
      }
    });
  }, []);

  const handleSubmit = async () => {
    setMessage("");
    setIsError(false);
    if (!content.trim()) {
      setMessage("피드백 내용을 입력해주세요.");
      setIsError(true);
      return;
    }
    try {
      await axios.post("/feedback", { content: content.trim() });
      setSent(true);
      setContent("");
    } catch (err) {
      setMessage(err.response?.data?.message || "전송에 실패했어요.");
      setIsError(true);
    }
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        {isAdmin && (
          <div className={styles.board}>
            <p className={styles.boardTitle}>받은 피드백</p>
            {boardLoading ? (
              <p className={styles.boardEmpty}>불러오는 중...</p>
            ) : feedbackList.length === 0 ? (
              <p className={styles.boardEmpty}>아직 받은 피드백이 없어요.</p>
            ) : (
              <div className={styles.boardList}>
                {feedbackList.map((f) => (
                  <div key={f.id} className={styles.boardItem}>
                    <div className={styles.boardItemTop}>
                      <span className={styles.boardEmail}>
                        {f.userName} · {f.userEmail}
                      </span>
                      <span className={styles.boardDate}>{formatDate(f.createdAt)}</span>
                    </div>
                    <p className={styles.boardContent}>{f.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!isAdmin && (
          <>
            <p className={styles.heroTitle}>피드백 보내기</p>
            <p className={styles.heroSub}>
              Unbind는 계속 성장하는 중이에요. <br /> 불편했던 점, 좋았던 점,
              있었으면 하는 기능 <br /> 편하게 남겨주세요.
            </p>

            <div className={styles.card}>
              {sent ? (
                <p className={styles.thanks}>
                  소중한 의견 감사해요. 잘 읽고 반영해볼게요.
                </p>
              ) : (
                <>
                  <textarea
                    className={styles.textarea}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="어떤 점이든 편하게 남겨주세요..."
                    rows={6}
                  />
                  {message && (
                    <p className={isError ? styles.errorText : styles.successText}>
                      {message}
                    </p>
                  )}
                  <button className={styles.submitBtn} onClick={handleSubmit}>
                    보내기
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
