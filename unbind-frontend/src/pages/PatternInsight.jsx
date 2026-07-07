import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { Sidebar } from "../components/layout/Sidebar";
import styles from "./PatternInsight.module.css";

export const PatternInsight = () => {
  const [loading, setLoading] = useState(true);
  const [hasEnoughData, setHasEnoughData] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [patterns, setPatterns] = useState([]);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    axios.get("/insights/patterns").then((res) => {
      setHasEnoughData(res.data.hasEnoughData);
      setIsPro(res.data.isPro);
      setPatterns(res.data.patterns || []);
      setLoading(false);
    });
  }, []);

  const handleSubscribe = async () => {
    setSubscribing(true);
    await axios.post("/users/subscribe");
    setIsPro(true);
    setSubscribing(false);
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <p className={styles.heroTitle}>당신의 패턴</p>
        <p className={styles.heroSub}>
          쌓아온 기록에서 코치가 발견한 흐름이에요
        </p>

        {loading ? (
          <p className={styles.status}>불러오는 중...</p>
        ) : !hasEnoughData ? (
          <p className={styles.status}>
            아직 패턴을 읽기엔 기록이 조금 부족해요. 저널을 조금 더 쌓아보세요.
          </p>
        ) : (
          <div className={styles.list}>
            {patterns.map((pattern, i) => {
              const locked = !isPro && i > 0;
              return (
                <div
                  key={i}
                  className={`${styles.card} ${locked ? styles.locked : ""}`}
                >
                  <p className={styles.cardTitle}>{pattern.title}</p>
                  <p className={styles.cardDesc}>{pattern.description}</p>
                  {locked && (
                    <div className={styles.lockOverlay}>
                      <button
                        className={styles.subscribeBtn}
                        onClick={handleSubscribe}
                        disabled={subscribing}
                      >
                        구독하고 전체 보기
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
