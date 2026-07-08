import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { Sidebar } from "../components/layout/Sidebar";
import styles from "./MyPage.module.css";

const COOLDOWN_DAYS = 30;
const SCRAP_CATEGORIES = ["전체", "가족", "연인", "친구", "직장", "기타"];

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toISOString().slice(0, 10);
};

export const MyPage = () => {
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [scraps, setScraps] = useState([]);
  const [scrapsLoading, setScrapsLoading] = useState(true);
  const [scrapTag, setScrapTag] = useState("전체");
  const [savingScrapId, setSavingScrapId] = useState(null);

  useEffect(() => {
    axios.get("/users/me").then((res) => {
      setUser(res.data);
      setNickname(res.data.name || "");
    });
  }, []);

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

  const nextAllowedDate = (() => {
    if (!user?.nameChangedAt) return null;
    const changed = new Date(user.nameChangedAt);
    const next = new Date(changed.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
    return next > new Date() ? next : null;
  })();

  const handleSave = async () => {
    setMessage("");
    setIsError(false);
    if (!nickname.trim()) {
      setMessage("닉네임을 입력해주세요.");
      setIsError(true);
      return;
    }
    try {
      const res = await axios.patch("/users/me/name", { name: nickname.trim() });
      setUser(res.data);
      setMessage("닉네임이 변경됐어요.");
    } catch (err) {
      setMessage(err.response?.data?.message || "닉네임 변경에 실패했어요.");
      setIsError(true);
    }
  };

  if (!user) {
    return (
      <div className={styles.container}>
        <Sidebar />
        <div className={styles.content}>불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <p className={styles.heroTitle}>마이페이지</p>

        <div className={styles.card}>
          <p className={styles.label}>이메일</p>
          <p className={styles.staticValue}>{user.email}</p>

          <p className={styles.label}>닉네임</p>
          {nextAllowedDate ? (
            <>
              <p className={styles.staticValue}>{user.name}</p>
              <p className={styles.hint}>
                닉네임은 {nextAllowedDate.toISOString().slice(0, 10)} 이후에
                다시 바꿀 수 있어요.
              </p>
            </>
          ) : (
            <div className={styles.editRow}>
              <input
                className={styles.input}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
              />
              <button className={styles.saveBtn} onClick={handleSave}>
                저장
              </button>
            </div>
          )}

          {message && (
            <p className={isError ? styles.errorText : styles.successText}>
              {message}
            </p>
          )}
        </div>

        <div className={styles.scrapSection}>
          <p className={styles.sectionTitle}>스크랩한 매듭</p>

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
    </div>
  );
};
