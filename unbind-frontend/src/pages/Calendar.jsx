import { useEffect, useMemo, useState } from "react";
import axios from "../api/axiosInstance";
import { Sidebar } from "../components/layout/Sidebar";
import { JournalDetailModal } from "../components/journal/JournalDetailModal";
import { useNavigate } from "react-router-dom";
import styles from "./Calendar.module.css";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const DAY_MS = 24 * 60 * 60 * 1000;

const startOfWeek = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
};

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const Calendar = () => {
  const [entries, setEntries] = useState([]);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/entries").then((res) => setEntries(res.data));
  }, []);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart.getTime() + i * DAY_MS);
      const dayEntries = entries.filter((e) =>
        isSameDay(new Date(e.createdAt), date)
      );
      return { date, entries: dayEntries };
    });
  }, [weekStart, entries]);

  const monthLabel = `${weekStart.getFullYear()}년 ${weekStart.getMonth() + 1}월`;
  const today = new Date();

  const selectedDayData = weekDays.find(
    (d) => selectedDay && isSameDay(d.date, selectedDay)
  );

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <div className={styles.header}>
          <button
            className={styles.navBtn}
            onClick={() => {
              setWeekStart(new Date(weekStart.getTime() - 7 * DAY_MS));
              setSelectedDay(null);
            }}
          >
            ‹
          </button>
          <p className={styles.monthLabel}>{monthLabel}</p>
          <button
            className={styles.navBtn}
            onClick={() => {
              setWeekStart(new Date(weekStart.getTime() + 7 * DAY_MS));
              setSelectedDay(null);
            }}
          >
            ›
          </button>
        </div>

        <div className={styles.week}>
          {weekDays.map(({ date, entries: dayEntries }) => (
            <button
              key={date.toISOString()}
              className={`${styles.day} ${
                isSameDay(date, today) ? styles.today : ""
              } ${
                selectedDay && isSameDay(date, selectedDay)
                  ? styles.selected
                  : ""
              }`}
              onClick={() => setSelectedDay(date)}
            >
              <span className={styles.dayLabel}>
                {DAY_LABELS[date.getDay()]}
              </span>
              <span className={styles.dayNum}>{date.getDate()}</span>
              <span className={styles.dots}>
                {dayEntries.slice(0, 3).map((e) => (
                  <span key={e.id} className={styles.dot} />
                ))}
              </span>
            </button>
          ))}
        </div>

        <div className={styles.dayDetail}>
          {!selectedDay || !selectedDayData ? (
            <p className={styles.hint}>날짜를 눌러 그날의 기록을 봐요</p>
          ) : selectedDayData.entries.length === 0 ? (
            <p className={styles.hint}>이날은 기록이 없어요</p>
          ) : (
            <div className={styles.entryList}>
              {selectedDayData.entries.map((entry) => (
                <div
                  key={entry.id}
                  className={styles.entryItem}
                  onClick={() => setSelectedEntryId(entry.id)}
                >
                  {entry.relationshipTag && (
                    <span className={styles.entryTag}>
                      {entry.relationshipTag}
                    </span>
                  )}
                  <span className={styles.entryText}>
                    {entry.situationText}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedEntryId && (
        <JournalDetailModal
          entryId={selectedEntryId}
          onClose={() => setSelectedEntryId(null)}
          onStartConversation={(id) => navigate(`/entries/${id}/conversation`)}
        />
      )}
    </div>
  );
};
