import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import styles from "./WarmthGauge.module.css";

export const WarmthGauge = () => {
  const [warmth, setWarmth] = useState(null);

  useEffect(() => {
    axios.get("/stats/warmth").then((res) => setWarmth(res.data.warmth));
  }, []);

  if (warmth === null) return null;

  return (
    <div className={styles.box}>
      <div className={styles.ringWrap}>
        <svg viewBox="0 0 100 100" className={styles.ring}>
          <circle cx="50" cy="50" r="42" className={styles.ringBg} />
          <circle
            cx="50"
            cy="50"
            r="42"
            className={styles.ringFg}
            strokeDasharray={`${(warmth / 100) * 264} 264`}
          />
        </svg>
        <span className={styles.ringLabel}>{warmth}°</span>
      </div>
      <div>
        <p className={styles.title}>채움온도</p>
        <p className={styles.desc}>실천을 이어갈수록 따뜻해져요</p>
      </div>
    </div>
  );
};
