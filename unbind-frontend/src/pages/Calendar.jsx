import { useEffect, useMemo, useState } from "react";
import axios from "../api/axiosInstance";
import { Sidebar } from "../components/layout/Sidebar";
import { JournalDetailModal } from "../components/journal/JournalDetailModal";
import { KakaoAdFit } from "../components/KakaoAdFit";
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

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const Calendar = () => {
  const [entries, setEntries] = useState([]);
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/entries").then((res) => setEntries(res.data));
  }, []);

  const monthDays = useMemo(() => {
    const lastDayOfMonth = new Date(
      monthCursor.getFullYear(),
      monthCursor.getMonth() + 1,
      0
    );
    const gridStart = startOfWeek(monthCursor);
    const gridEnd = startOfWeek(lastDayOfMonth);
    const totalDays = Math.round((gridEnd - gridStart) / DAY_MS) + 7;

    return Array.from({ length: totalDays }, (_, i) => {
      const date = new Date(gridStart.getTime() + i * DAY_MS);
      const dayEntries = entries.filter((e) =>
        isSameDay(new Date(e.createdAt), date)
      );
      return {
        date,
        entries: dayEntries,
        inMonth: date.getMonth() === monthCursor.getMonth(),
      };
    });
  }, [monthCursor, entries]);

  const monthLabel = `${monthCursor.getFullYear()}년 ${monthCursor.getMonth() + 1}월`;
  const today = new Date();

  const selectedDayData = monthDays.find(
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
              setMonthCursor(
                new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1)
              );
              setSelectedDay(null);
            }}
          >
            ‹
          </button>
          <p className={styles.monthLabel}>{monthLabel}</p>
          <button
            className={styles.navBtn}
            onClick={() => {
              setMonthCursor(
                new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1)
              );
              setSelectedDay(null);
            }}
          >
            ›
          </button>
        </div>

        <div className={styles.weekLabels}>
          {DAY_LABELS.map((label) => (
            <span key={label} className={styles.weekLabel}>
              {label}
            </span>
          ))}
        </div>

        <div className={styles.month}>
          {monthDays.map(({ date, entries: dayEntries, inMonth }) => (
            <button
              key={date.toISOString()}
              className={`${styles.day} ${!inMonth ? styles.outside : ""} ${
                isSameDay(date, today) ? styles.today : ""
              } ${
                selectedDay && isSameDay(date, selectedDay)
                  ? styles.selected
                  : ""
              }`}
              onClick={() => setSelectedDay(date)}
            >
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

        <KakaoAdFit adUnit={import.meta.env.VITE_ADFIT_UNIT_CALENDAR} />
      </div>

      {selectedEntryId && (
        <JournalDetailModal
          entryId={selectedEntryId}
          onClose={() => setSelectedEntryId(null)}
          onStartConversation={(id) => navigate(`/entries/${id}/conversation`)}
          onDeleted={(id) => {
            setEntries((prev) => prev.filter((e) => e.id !== id));
            setSelectedEntryId(null);
          }}
        />
      )}
    </div>
  );
};
