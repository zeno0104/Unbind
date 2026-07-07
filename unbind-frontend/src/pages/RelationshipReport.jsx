import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import { Sidebar } from "../components/layout/Sidebar";
import { JournalDetailModal } from "../components/journal/JournalDetailModal";
import styles from "./RelationshipReport.module.css";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}.${date.getDate()}`;
};

export const RelationshipReport = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [expandedTag, setExpandedTag] = useState(null);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/insights/relationships").then((res) => {
      setReports(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <p className={styles.heroTitle}>관계 리포트</p>
        <p className={styles.heroSub}>
          같은 사람과 반복된 기록이 쌓이면 여기서 흐름을 볼 수 있어요
        </p>

        {loading ? (
          <p className={styles.status}>불러오는 중...</p>
        ) : reports.length === 0 ? (
          <p className={styles.status}>
            아직 관계 태그가 붙은 기록이 없어요. 저널을 쓸 때 "누구와의
            일인가요?"에 답해보세요.
          </p>
        ) : (
          <div className={styles.list}>
            {reports.map((report) => {
              const expanded = expandedTag === report.tag;
              return (
                <div key={report.tag} className={styles.card}>
                  <button
                    className={styles.cardHeader}
                    onClick={() =>
                      setExpandedTag(expanded ? null : report.tag)
                    }
                  >
                    <span className={styles.tagName}>{report.tag}</span>
                    <span className={styles.stats}>
                      {report.entryCount}번 · 다짐 {report.actionItemCount}개 ·
                      완료 {report.completedCount}개
                    </span>
                  </button>

                  {(report.goodCount > 0 ||
                    report.neutralCount > 0 ||
                    report.hardCount > 0) && (
                    <div className={styles.feedbackRow}>
                      {report.goodCount > 0 && (
                        <span className={styles.fbGood}>
                          도움됨 {report.goodCount}
                        </span>
                      )}
                      {report.neutralCount > 0 && (
                        <span className={styles.fbNeutral}>
                          그저그럼 {report.neutralCount}
                        </span>
                      )}
                      {report.hardCount > 0 && (
                        <span className={styles.fbHard}>
                          안맞음 {report.hardCount}
                        </span>
                      )}
                    </div>
                  )}

                  {report.insight && (
                    <p className={styles.insight}>{report.insight}</p>
                  )}

                  {expanded && (
                    <div className={styles.timeline}>
                      {report.entries.map((entry) => (
                        <div
                          key={entry.id}
                          className={styles.timelineItem}
                          onClick={() => setSelectedEntryId(entry.id)}
                        >
                          <span className={styles.timelineDate}>
                            {formatDate(entry.createdAt)}
                          </span>
                          <span className={styles.timelineText}>
                            {entry.situationText}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
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
