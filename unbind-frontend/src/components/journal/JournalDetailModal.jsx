import { useState, useEffect } from "react";
import axios from "../../api/axiosInstance";
import styles from "./JournalDetailModal.module.css";

export const JournalDetailModal = ({
  entryId,
  onClose,
  onStartConversation,
  onDeleted,
}) => {
  const [turns, setTurns] = useState([]);
  const [actionItem, setActionItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const FeedbackPicker = ({ entryId, onDone }) => {
    const [done, setDone] = useState(false);

    const submit = async (feedback) => {
      await axios.patch(`/entries/${entryId}/action-item/complete`, {
        feedback,
      });
      setDone(true);
      onDone(feedback);
    };

    if (done) return null;

    return (
      <div className={styles.feedbackRow}>
        <p className={styles.feedbackQ}>실천해보니 어땠나요?</p>
        <div className={styles.feedbackBtns}>
          <button onClick={() => submit("GOOD")}>도움이 됐어요</button>
          <button onClick={() => submit("NEUTRAL")}>그저 그랬어요</button>
          <button onClick={() => submit("HARD")}>잘 안 맞았어요</button>
        </div>
      </div>
    );
  };
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const turnsRes = await axios.get(`/entries/${entryId}/conversation`);
        setTurns(turnsRes.data);
      } catch {
        setTurns([]);
      }
      try {
        const actionRes = await axios.get(`/entries/${entryId}/action-item`);
        setActionItem(actionRes.data);
      } catch {
        setActionItem(null);
      }
      setLoading(false);
    };
    fetchDetail();
  }, [entryId]);

  const handleComplete = async () => {
    await axios.patch(`/entries/${entryId}/action-item/complete`);
    setActionItem((prev) => ({ ...prev, isCompleted: 1 }));
  };

  const handleDelete = async () => {
    if (!window.confirm("이 기록을 삭제할까요? 되돌릴 수 없어요.")) return;
    setDeleting(true);
    try {
      await axios.delete(`/entries/${entryId}`);
      onDeleted?.(entryId);
      onClose();
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>

        {loading ? (
          <p className={styles.loadingText}>불러오는 중...</p>
        ) : turns.length === 0 ? (
          <div className={styles.emptyState}>
            <p>아직 대화를 나누지 않은 기록이에요</p>
            <button
              className={styles.startBtn}
              onClick={() => onStartConversation(entryId)}
            >
              대화 시작하기
            </button>
            <button
              className={styles.deleteBtn}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "삭제 중..." : "이 기록 삭제하기"}
            </button>
          </div>
        ) : (
          <>
            <p className={styles.label}>그때 나눈 생각들</p>
            <div className={styles.turnList}>
              {turns.map((turn) => (
                <div
                  key={turn.id}
                  className={
                    turn.role === "AI" ? styles.aiTurn : styles.userTurn
                  }
                >
                  {turn.content}
                </div>
              ))}
            </div>

            {actionItem && (
              <div className={styles.actionSection}>
                <p className={styles.label}>다짐</p>
                <div className={styles.actionBox}>
                  <p className={styles.actionText}>{actionItem.content}</p>

                  {actionItem.isCompleted === 1 ? (
                    <p className={styles.doneLabel}>
                      완료 ·{" "}
                      {actionItem.feedback === "GOOD"
                        ? "도움이 됐어요"
                        : actionItem.feedback === "HARD"
                        ? "잘 안 맞았어요"
                        : "그저 그랬어요"}
                    </p>
                  ) : (
                    <FeedbackPicker
                      entryId={entryId}
                      onDone={(fb) =>
                        setActionItem((prev) => ({
                          ...prev,
                          isCompleted: 1,
                          feedback: fb,
                        }))
                      }
                    />
                  )}
                </div>
              </div>
            )}

            <button
              className={styles.deleteBtn}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "삭제 중..." : "이 기록 삭제하기"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
