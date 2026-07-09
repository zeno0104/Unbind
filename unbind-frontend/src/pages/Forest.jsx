import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axiosInstance";
import { Sidebar } from "../components/layout/Sidebar";
import { BookmarkIcon } from "../components/layout/NavIcons";
import { KakaoAdFit } from "../components/KakaoAdFit";
import styles from "./Forest.module.css";

const CATEGORIES = ["전체", "가족", "연인", "친구", "직장", "기타"];
const PAGE_SIZE = 20;
const MAX_TEXT_LENGTH = 300;

const timeAgo = (dateString) => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return `${Math.floor(days / 30)}개월 전`;
};

const scrapHint = (count) => {
  if (!count || count <= 0) return null;
  if (count === 1) return "누군가 이 매듭을 마음에 담아뒀어요";
  return "여러 명이 이 매듭을 마음에 담아뒀어요";
};

export const Forest = () => {
  const [activeTag, setActiveTag] = useState("전체");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [knots, setKnots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selectedKnot, setSelectedKnot] = useState(null);
  const [reactions, setReactions] = useState([]);
  const [reactionText, setReactionText] = useState("");
  const [reactionMessage, setReactionMessage] = useState("");
  const [reactionError, setReactionError] = useState(false);
  const [reactionSent, setReactionSent] = useState(false);
  const [editingReactionId, setEditingReactionId] = useState(null);
  const [editingReactionText, setEditingReactionText] = useState("");
  const [scrapMemo, setScrapMemo] = useState("");
  const [memoSaving, setMemoSaving] = useState(false);
  const [memoMessage, setMemoMessage] = useState("");

  const loadKnots = (tag, keyword, pageToLoad, append) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    const params = { page: pageToLoad };
    if (tag !== "전체") params.tag = tag;
    if (keyword) params.q = keyword;
    axios
      .get("/forest/knots", { params })
      .then((res) => {
        setKnots((prev) => (append ? [...prev, ...res.data] : res.data));
        setHasMore(res.data.length === PAGE_SIZE);
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  };

  useEffect(() => {
    const handle = setTimeout(() => setSearchTerm(searchInput.trim()), 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    setPage(0);
    loadKnots(activeTag, searchTerm, 0, false);
  }, [activeTag, searchTerm]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadKnots(activeTag, searchTerm, nextPage, true);
  };

  const openKnot = (knot) => {
    setSelectedKnot(knot);
    setReactionText("");
    setReactionMessage("");
    setReactionError(false);
    setReactionSent(false);
    setEditingReactionId(null);
    setEditingReactionText("");
    setScrapMemo("");
    setMemoMessage("");
    axios.get(`/forest/knots/${knot.id}/reactions`).then((res) => setReactions(res.data));
    if (knot.scrapped) {
      axios.get(`/forest/knots/${knot.id}/scrap`).then((res) => {
        if (res.data) setScrapMemo(res.data.memo || "");
      });
    }
  };

  const closeKnot = () => {
    setSelectedKnot(null);
    setReactions([]);
  };

  const withdrawKnot = async () => {
    if (!window.confirm("이 매듭을 매듭 숲에서 회수할까요? 받은 공감도 함께 사라져요.")) return;
    try {
      await axios.delete(`/forest/knots/${selectedKnot.id}`);
      setKnots((prev) => prev.filter((k) => k.id !== selectedKnot.id));
      closeKnot();
    } catch (err) {
      alert(err.response?.data?.message || "회수에 실패했어요.");
    }
  };

  const toggleScrap = async (e, knot) => {
    e.stopPropagation();
    const wasScrapped = knot.scrapped;
    const nextScrapped = !wasScrapped;

    const applyScrapped = (value, scrapCountDelta) => {
      setKnots((prev) =>
        prev.map((k) =>
          k.id === knot.id
            ? { ...k, scrapped: value, scrapCount: Math.max(0, k.scrapCount + scrapCountDelta) }
            : k
        )
      );
      setSelectedKnot((prev) =>
        prev && prev.id === knot.id
          ? { ...prev, scrapped: value, scrapCount: Math.max(0, prev.scrapCount + scrapCountDelta) }
          : prev
      );
    };

    applyScrapped(nextScrapped, nextScrapped ? 1 : -1);
    if (!nextScrapped) {
      setScrapMemo("");
      setMemoMessage("");
    }

    try {
      if (nextScrapped) {
        await axios.post(`/forest/knots/${knot.id}/scrap`);
      } else {
        await axios.delete(`/forest/knots/${knot.id}/scrap`);
      }
    } catch {
      applyScrapped(wasScrapped, wasScrapped ? 1 : -1);
    }
  };

  const saveMemo = async () => {
    setMemoSaving(true);
    setMemoMessage("");
    try {
      await axios.put(`/forest/knots/${selectedKnot.id}/scrap/memo`, { memo: scrapMemo });
      setMemoMessage("메모를 저장했어요.");
    } catch (err) {
      setMemoMessage(err.response?.data?.message || "메모 저장에 실패했어요.");
    } finally {
      setMemoSaving(false);
    }
  };

  const submitReaction = async () => {
    if (!reactionText.trim()) {
      setReactionMessage("공감하는 다짐을 적어주세요.");
      setReactionError(true);
      return;
    }
    try {
      const res = await axios.post(`/forest/knots/${selectedKnot.id}/reactions`, {
        actionText: reactionText.trim(),
      });
      setReactions((prev) => [{ ...res.data, mine: true }, ...prev]);
      setKnots((prev) =>
        prev.map((k) =>
          k.id === selectedKnot.id ? { ...k, reactionCount: k.reactionCount + 1 } : k
        )
      );
      setReactionText("");
      setReactionSent(true);
      setReactionMessage("");
      setReactionError(false);
    } catch (err) {
      setReactionMessage(err.response?.data?.message || "전송에 실패했어요.");
      setReactionError(true);
    }
  };

  const startEditReaction = (r) => {
    setEditingReactionId(r.id);
    setEditingReactionText(r.actionText);
  };

  const cancelEditReaction = () => {
    setEditingReactionId(null);
    setEditingReactionText("");
  };

  const saveEditReaction = async (r) => {
    if (!editingReactionText.trim()) return;
    try {
      const res = await axios.put(`/forest/reactions/${r.id}`, {
        actionText: editingReactionText.trim(),
      });
      setReactions((prev) =>
        prev.map((item) => (item.id === r.id ? { ...res.data, mine: true } : item))
      );
      setEditingReactionId(null);
      setEditingReactionText("");
    } catch (err) {
      alert(err.response?.data?.message || "수정에 실패했어요.");
    }
  };

  const deleteReaction = async (r) => {
    if (!window.confirm("이 공감을 삭제할까요?")) return;
    try {
      await axios.delete(`/forest/reactions/${r.id}`);
      setReactions((prev) => prev.filter((item) => item.id !== r.id));
      setKnots((prev) =>
        prev.map((k) =>
          k.id === selectedKnot.id ? { ...k, reactionCount: Math.max(0, k.reactionCount - 1) } : k
        )
      );
      setSelectedKnot((prev) =>
        prev ? { ...prev, reactionCount: Math.max(0, prev.reactionCount - 1) } : prev
      );
    } catch (err) {
      alert(err.response?.data?.message || "삭제에 실패했어요.");
    }
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <p className={styles.heroTitle}>매듭 숲</p>
        <p className={styles.heroSub}>
          누군가 풀어놓은 매듭이에요. 비슷한 마음이면 공감을 보내보세요.
        </p>

        <input
          className={styles.searchInput}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="비슷한 상황을 검색해보세요 (예: 연락, 약속, 화해...)"
        />

        <div className={styles.filterRow}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles.filterChip} ${
                activeTag === cat ? styles.filterChipActive : ""
              }`}
              onClick={() => setActiveTag(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p className={styles.status}>불러오는 중...</p>
        ) : knots.length === 0 ? (
          searchTerm ? (
            <p className={styles.status}>검색 결과가 없어요.</p>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>
                아직 아무도 매듭을 풀어놓지 않았어요.
                <br />
                첫 번째 매듭의 주인공이 되어보세요.
              </p>
              <Link to="/" className={styles.emptyStateCta}>
                내 다짐 기록하러 가기
              </Link>
            </div>
          )
        ) : (
          <>
            <div className={styles.list}>
              {knots.map((knot) => (
                <button
                  key={knot.id}
                  className={styles.card}
                  onClick={() => openKnot(knot)}
                >
                  <div className={styles.cardTop}>
                    <span className={styles.tagChip}>{knot.tag}</span>
                    <div className={styles.cardTopRight}>
                      <span className={styles.time}>{timeAgo(knot.createdAt)}</span>
                      {knot.mine ? (
                        <span className={styles.mineBadge}>내 매듭</span>
                      ) : (
                        <span
                          role="button"
                          tabIndex={0}
                          className={`${styles.scrapBtn} ${
                            knot.scrapped ? styles.scrapBtnActive : ""
                          }`}
                          aria-label={knot.scrapped ? "스크랩 취소" : "스크랩"}
                          onClick={(e) => toggleScrap(e, knot)}
                        >
                          <BookmarkIcon filled={knot.scrapped} />
                        </span>
                      )}
                    </div>
                  </div>
                  <p className={styles.situation}>{knot.situationSummary}</p>
                  <p className={styles.action}>
                    <span className={styles.star}>✦</span> {knot.actionText}
                  </p>
                  <p className={styles.reactionCount}>공감 {knot.reactionCount}개</p>
                  {scrapHint(knot.scrapCount) && (
                    <p className={styles.scrapHint}>{scrapHint(knot.scrapCount)}</p>
                  )}
                </button>
              ))}
            </div>
            {hasMore && (
              <button
                className={styles.loadMoreBtn}
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "불러오는 중..." : "더 보기"}
              </button>
            )}
            <KakaoAdFit adUnit={import.meta.env.VITE_ADFIT_UNIT_FOREST} />
          </>
        )}
      </div>

      {selectedKnot && (
        <div className={styles.overlay} onClick={closeKnot}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalTop}>
              <span className={styles.tagChip}>{selectedKnot.tag}</span>
              {selectedKnot.mine ? (
                <div className={styles.modalTopRight}>
                  <span className={styles.mineBadge}>내 매듭</span>
                  <button className={styles.withdrawBtn} onClick={withdrawKnot}>
                    회수
                  </button>
                </div>
              ) : (
                <button
                  className={`${styles.scrapBtnModal} ${
                    selectedKnot.scrapped ? styles.scrapBtnActive : ""
                  }`}
                  onClick={(e) => toggleScrap(e, selectedKnot)}
                >
                  <BookmarkIcon filled={selectedKnot.scrapped} />
                  {selectedKnot.scrapped ? "스크랩됨" : "스크랩"}
                </button>
              )}
            </div>
            <p className={styles.situation}>{selectedKnot.situationSummary}</p>
            <p className={styles.action}>
              <span className={styles.star}>✦</span> {selectedKnot.actionText}
            </p>
            {scrapHint(selectedKnot.scrapCount) && (
              <p className={styles.scrapHint}>{scrapHint(selectedKnot.scrapCount)}</p>
            )}

            {selectedKnot.scrapped && !selectedKnot.mine && (
              <div className={styles.memoBox}>
                <p className={styles.memoLabel}>나만 보는 메모</p>
                <textarea
                  className={styles.memoTextarea}
                  value={scrapMemo}
                  onChange={(e) => setScrapMemo(e.target.value)}
                  placeholder="이 매듭을 보고 떠오른 생각을 적어두세요..."
                  rows={2}
                  maxLength={MAX_TEXT_LENGTH}
                />
                <button className={styles.memoSaveBtn} onClick={saveMemo} disabled={memoSaving}>
                  {memoSaving ? "저장 중..." : "메모 저장"}
                </button>
                {memoMessage && <p className={styles.successText}>{memoMessage}</p>}
              </div>
            )}

            <div className={styles.divider} />

            {selectedKnot.mine ? (
              <p className={styles.reactionsLabel}>
                이 매듭에 도착한 공감이에요
              </p>
            ) : (
              <>
                <p className={styles.reactionsLabel}>
                  나도 비슷한 매듭을 풀어본 적 있어요
                </p>

                {reactionSent ? (
                  <p className={styles.thanks}>공감을 보냈어요. 마음이 닿았을 거예요.</p>
                ) : (
                  <>
                    <textarea
                      className={styles.textarea}
                      value={reactionText}
                      onChange={(e) => setReactionText(e.target.value)}
                      placeholder="나는 이렇게 풀어봤어요..."
                      rows={3}
                      maxLength={MAX_TEXT_LENGTH}
                    />
                    {reactionMessage && (
                      <p className={reactionError ? styles.errorText : styles.successText}>
                        {reactionMessage}
                      </p>
                    )}
                    <button className={styles.submitBtn} onClick={submitReaction}>
                      공감 보내기
                    </button>
                  </>
                )}
              </>
            )}

            {reactions.length > 0 && (
              <div className={styles.reactionList}>
                {reactions.map((r) =>
                  editingReactionId === r.id ? (
                    <div key={r.id} className={styles.reactionEditBox}>
                      <textarea
                        className={styles.reactionEditTextarea}
                        value={editingReactionText}
                        onChange={(e) => setEditingReactionText(e.target.value)}
                        rows={2}
                        maxLength={MAX_TEXT_LENGTH}
                      />
                      <div className={styles.reactionEditBtnRow}>
                        <button
                          className={styles.reactionCancelBtn}
                          onClick={cancelEditReaction}
                        >
                          취소
                        </button>
                        <button
                          className={styles.reactionSaveBtn}
                          onClick={() => saveEditReaction(r)}
                        >
                          저장
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div key={r.id} className={styles.reactionItemRow}>
                      <p className={styles.reactionItem}>"{r.actionText}"</p>
                      {r.mine && (
                        <div className={styles.reactionItemActions}>
                          <button
                            className={styles.reactionEditBtn}
                            onClick={() => startEditReaction(r)}
                          >
                            수정
                          </button>
                          <button
                            className={styles.reactionEditBtn}
                            onClick={() => deleteReaction(r)}
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
            {selectedKnot.mine && reactions.length === 0 && (
              <p className={styles.emptyNote}>아직 도착한 공감이 없어요.</p>
            )}

            <button className={styles.closeBtn} onClick={closeKnot}>
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
