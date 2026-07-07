import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axiosInstance";
import styles from "./KnotReminder.module.css";

const MIN_DAYS_OPEN = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

export const KnotReminder = () => {
  const [oldest, setOldest] = useState(null);

  useEffect(() => {
    axios.get("/room/knots").then((res) => {
      const open = res.data.filter(
        (item) => item.isCompleted !== 1 && item.entryCreatedAt
      );
      if (open.length === 0) return;

      const withAge = open.map((item) => ({
        ...item,
        daysOpen: Math.floor(
          (Date.now() - new Date(item.entryCreatedAt).getTime()) / DAY_MS
        ),
      }));
      withAge.sort((a, b) => b.daysOpen - a.daysOpen);

      if (withAge[0].daysOpen >= MIN_DAYS_OPEN) {
        setOldest(withAge[0]);
      }
    });
  }, []);

  if (!oldest) return null;

  return (
    <Link to="/room" className={styles.banner}>
      <span className={styles.dot} />
      <span className={styles.text}>
        {oldest.daysOpen}일째 풀리지 않은 매듭이 있어요
      </span>
      <span className={styles.arrow}>→</span>
    </Link>
  );
};
