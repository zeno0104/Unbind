import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axiosInstance";
import { Sidebar } from "../components/layout/Sidebar";
import styles from "./MyScraps.module.css";

const SCRAP_CATEGORIES = ["전체", "가족", "연인", "친구", "직장", "기타"];

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toISOString().slice(0, 10);
};

export const MyScraps = () => {
  const [scraps, setScraps] = useState([]);
  const [scrapsLoading, setScrapsLoading] = useState(true);
  const [scrapTag, setScrapTag] = useState("전체");
  const [savingScrapId, setSavingScrapId] = useState(null);

  const loadScraps = (tag) => {
    setScrapsLoading(true);
    axios
      .get("/forest/scraps", { params: tag === "전체" ? {} : { tag } })
      .then((res) => setScraps(res.data.map((s) => ({ ...s, savedMessage: "" }))))
      .finally(() => setScrapsLoading(false));
  };

  useEffect(() => {
    loadScraps(scrapTag);
  }, [scrapTag]);

  const updateMemoText = (forestKnotId, value) => {
    setScraps((prev) =>
      prev.map((s) =>
        s.forestKnotId === forestKnotId ? { ...s, memo: value, savedMessage: "" } : s
      )
    );
  };

  const saveScrapMemo = async (scrap) => {
    setSavingScrapId(scrap.forestKnotId);
    try {
      await axios.put(`/forest/knots/${scrap.forestKnotId}/scrap/memo`, { memo: scrap.memo });
      setScraps((prev) =>
        prev.map((s) =>
          s.forestKnotId === scrap.forestKnotId ? { ...s, savedMessage: "저장했어요." } : s
        )
      );
    } catch (err) {
      setScraps((prev) =>
        prev.map((s) =>
          s.forestKnotId === scrap.forestKnotId
            ? { ...s, savedMessage: err.response?.data?.message || "저장에 실패했어요." }
            : s
        )
      );
    } finally {
      setSavingScrapId(null);
    }
  };

  const removeScrap = async (scrap) => {
    setScraps((prev) => prev.filter((s) => s.forestKnotId !== scrap.forestKnotId));
    try {
      await axios.delete(`/forest/knots/${scrap.forestKnotId}/scrap`);
    } catch {
      loadScraps(scrapTag);
    }
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <Link to="/mypage" className={styles.backLink}>
          ← 마이페이지
        </Link>
        <p className={styles.heroTitle}>스크랩한 매듭</p>

        <div className={styles.filterRow}>
          {SCRAP_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles.filterChip} ${
                scrapTag === cat ? styles.filterChipActive : ""
              }`}
              onClick={() => setScrapTag(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {scrapsLoading ? (
          <p className={styles.hint}>불러오는 중...</p>
        ) : scraps.length === 0 ? (
          <p className={styles.hint}>아직 스크랩한 매듭이 없어요.</p>
        ) : (
          <div className={styles.scrapList}>
            {scraps.map((scrap) => (
              <div key={scrap.id} className={styles.scrapCard}>
                <div className={styles.scrapTop}>
                  <span className={styles.tagChip}>{scrap.tag}</span>
                  <span className={styles.time}>{formatDate(scrap.knotCreatedAt)}</span>
                </div>
                <p className={styles.scrapSituation}>{scrap.situationSummary}</p>
                <p className={styles.scrapAction}>✦ {scrap.actionText}</p>

                <textarea
                  className={styles.memoTextarea}
                  value={scrap.memo || ""}
                  onChange={(e) => updateMemoText(scrap.forestKnotId, e.target.value)}
                  placeholder="이 매듭을 보고 떠오른 생각을 적어두세요..."
                  rows={2}
                  maxLength={300}
                />

                <div className={styles.scrapActions}>
                  <button
                    className={styles.memoSaveBtn}
                    onClick={() => saveScrapMemo(scrap)}
                    disabled={savingScrapId === scrap.forestKnotId}
                  >
                    {savingScrapId === scrap.forestKnotId ? "저장 중..." : "메모 저장"}
                  </button>
                  <button className={styles.unscrapBtn} onClick={() => removeScrap(scrap)}>
                    스크랩 취소
                  </button>
                </div>
                {scrap.savedMessage && (
                  <p className={styles.successText}>{scrap.savedMessage}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
