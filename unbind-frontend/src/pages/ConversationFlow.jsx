import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import styles from "./ConversationFlow.module.css";

export const ConversationFlow = () => {
  const { entryId } = useParams();
  const navigate = useNavigate();

  const [turns, setTurns] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [concluding, setConcluding] = useState(false);
  const [options, setOptions] = useState(null);
  const [selectedText, setSelectedText] = useState(null);
  const [finalText, setFinalText] = useState("");
  const [actionItem, setActionItem] = useState(null);
  const [fadeKey, setFadeKey] = useState(0);
  const textareaRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const existing = await axios.get(`/entries/${entryId}/conversation`);
      if (existing.data.length > 0) {
        setTurns(existing.data);
      } else {
        const res = await axios.post(`/entries/${entryId}/conversation/start`);
        setTurns([res.data]);
      }
      setLoading(false);
    };
    init();
  }, [entryId]);

  useEffect(() => {
    setFadeKey((prev) => prev + 1);
  }, [turns, options, actionItem, concluding]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const goToOptions = async () => {
    setConcluding(true);
    try {
      const res = await axios.post(`/entries/${entryId}/conclude`);
      setOptions(res.data);
    } finally {
      setConcluding(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input;
    setInput("");
    setSending(true);
    setTurns((prev) => [
      ...prev,
      { role: "USER", content: text, id: `tmp-${Date.now()}` },
    ]);
    try {
      const res = await axios.post(
        `/entries/${entryId}/conversation/messages`,
        { message: text }
      );
      setTurns((prev) => [...prev, res.data]);
      if (res.data.readyToConclude) {
        await goToOptions();
      }
    } finally {
      setSending(false);
    }
  };

  const handlePickOption = (text) => {
    setSelectedText(text);
    setFinalText(text);
  };

  const handleBackToOptions = () => {
    setSelectedText(null);
    setFinalText("");
  };

  const handleConfirm = async () => {
    if (!finalText.trim()) return;
    const res = await axios.post(`/entries/${entryId}/action-item`, {
      content: finalText,
    });
    setActionItem(res.data);
  };

  if (loading)
    return <div className={styles.center}>생각을 정리하고 있어요...</div>;

  if (concluding) {
    return (
      <div className={styles.center}>
        <div key={fadeKey} className={styles.fadeIn}>
          <div className={styles.breathCircle} />
          <p className={styles.smallLabel}>생각을 정리하고 있어요</p>
          <p className={styles.hintText}>
            정답은 아니지만, 몇 가지 방향을 추천드릴게요
          </p>
        </div>
      </div>
    );
  }

  if (actionItem) {
    return (
      <div className={styles.center}>
        <div key={fadeKey} className={styles.fadeIn}>
          <p className={styles.smallLabel}>오늘, 내가 다시 쥐기로 한 것</p>
          <p className={styles.quote}>{actionItem.content}</p>
          <div className={styles.divider} />
          <button className={styles.ghostBtn} onClick={() => navigate("/")}>
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (selectedText !== null) {
    return (
      <div className={styles.center}>
        <div key={fadeKey} className={styles.fadeIn}>
          <p className={styles.smallLabel}>당신의 말로 다시 적어볼까요?</p>
          <textarea
            className={styles.finalTextarea}
            value={finalText}
            onChange={(e) => setFinalText(e.target.value)}
            rows={4}
          />
          <div className={styles.rowBtns}>
            <button className={styles.ghostBtn} onClick={handleBackToOptions}>
              이전으로
            </button>
            <button className={styles.primaryBtn} onClick={handleConfirm}>
              이걸로 다짐할게요
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (options) {
    return (
      <div className={styles.center}>
        <div key={fadeKey} className={styles.fadeIn}>
          <p className={styles.smallLabel}>
            오늘, 무엇을 다시 쥐어보고 싶으세요?
          </p>
          <div className={styles.optionList}>
            {options.map((opt, idx) => (
              <div
                key={idx}
                className={styles.optionItem}
                onClick={() => handlePickOption(opt.text)}
              >
                <p className={styles.optionText}>{opt.text}</p>
                <p className={styles.optionReason}>{opt.reason}</p>
              </div>
            ))}
          </div>
          <div className={styles.customBox}>
            <input
              type="text"
              className={styles.customInput}
              placeholder="직접 적어볼게요"
              onKeyDown={(e) =>
                e.key === "Enter" && handlePickOption(e.target.value)
              }
            />
          </div>
          <button className={styles.ghostBtn} onClick={() => setOptions(null)}>
            이전으로
          </button>
        </div>
      </div>
    );
  }

  const lastAiTurn = [...turns].reverse().find((t) => t.role === "AI");

  return (
    <div className={styles.center}>
      <div key={fadeKey} className={styles.fadeIn}>
        <p className={styles.progressDots}>
          {turns
            .filter((t) => t.role === "AI")
            .map((_, i) => (
              <span key={i} className={styles.dot} />
            ))}
        </p>

        <p className={styles.quote}>{lastAiTurn?.content}</p>

        <div className={styles.answerBox}>
          <textarea
            ref={textareaRef}
            className={styles.answerInput}
            placeholder="편하게 답해보세요"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={sending}
            rows={1}
          />
          <button
            className={styles.answerBtn}
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? "듣는 중" : "다음"}
          </button>
        </div>
        {sending && (
          <p className={styles.sendingHint}>당신의 이야기를 듣고 있어요</p>
        )}
      </div>
    </div>
  );
};
