import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import styles from "./JournalDetail.module.css";

export const JournalDetail = () => {
  const { entryId } = useParams();
  const navigate = useNavigate();

  const [turns, setTurns] = useState([]);
  const [actionItem, setActionItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const turnsRes = await axios.get(`/entries/${entryId}/conversation`);
        setTurns(turnsRes.data);
      } catch (err) {
        setTurns([]);
      }
      try {
        const actionRes = await axios.get(`/entries/${entryId}/action-item`);
        setActionItem(actionRes.data);
      } catch (err) {
        setActionItem(null);
      }
      setLoading(false);
    };
    fetchDetail();
  }, [entryId]);

  const handleComplete = async () => {
    await axios.patch(`/entries/${entryId}/action-item/complete`);
    setActionItem({ ...actionItem, isCompleted: 1 });
  };

  if (loading) {
    return <div className={styles.container}>불러오는 중...</div>;
  }

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate("/")}>
        ← 홈으로
      </button>

      {turns.length === 0 ? (
        <div className={styles.emptyState}>
          <p>아직 대화를 진행하지 않은 기록이에요</p>
          <button
            className={styles.startBtn}
            onClick={() => navigate(`/entries/${entryId}/conversation`)}
          >
            대화 시작하기
          </button>
        </div>
      ) : (
        <>
          <div className={styles.section}>
            <p className={styles.label}>그때 나눈 생각들</p>
            <div className={styles.turnList}>
              {turns.map((turn) => (
                <div key={turn.id} className={styles.turnItem}>
                  <span className={styles.tag}>
                    {turn.role === "AI" ? "AI" : "나"}
                  </span>
                  <span>{turn.content}</span>
                </div>
              ))}
            </div>
          </div>

          {actionItem && (
            <div className={styles.actionSection}>
              <p className={styles.label}>실천 항목</p>
              <div className={styles.actionBox}>
                <p className={styles.actionText}>{actionItem.content}</p>
                {actionItem.isCompleted === 1 ? (
                  <p className={styles.doneLabel}>✓ 완료했어요</p>
                ) : (
                  <button
                    className={styles.completeBtn}
                    onClick={handleComplete}
                  >
                    완료 체크하기
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
