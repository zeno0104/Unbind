import { useEffect, useMemo, useState } from "react";
import axios from "../api/axiosInstance";
import { Sidebar } from "../components/layout/Sidebar";
import { KakaoAdFit } from "../components/KakaoAdFit";
import styles from "./KnotRoom.module.css";

const feedbackOptions = [
  { value: "GOOD", label: "도움됐어요" },
  { value: "NEUTRAL", label: "그저그랬어요" },
  { value: "HARD", label: "안맞았어요" },
];

export const KnotRoom = () => {
  const [constellations, setConstellations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTag, setExpandedTag] = useState(null);

  const [reports, setReports] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [hasEnoughPatterns, setHasEnoughPatterns] = useState(false);
  const [patternsOpen, setPatternsOpen] = useState(false);

  const [selected, setSelected] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const [naming, setNaming] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [sharedIds, setSharedIds] = useState(new Set());
  const [shareMessage, setShareMessage] = useState("");
  const [shareError, setShareError] = useState(false);

  const loadConstellations = () => {
    axios
      .get("/room/constellations")
      .then((res) => setConstellations(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadConstellations();
    axios.get("/insights/relationships").then((res) => setReports(res.data));
    axios.get("/insights/patterns").then((res) => {
      setHasEnoughPatterns(res.data.hasEnoughData);
      setPatterns(res.data.patterns || []);
    });
  }, []);

  const reportsByTag = useMemo(
    () => Object.fromEntries(reports.map((r) => [r.tag, r])),
    [reports]
  );

  const allKnots = constellations.flatMap((c) => c.knots);
  const active = allKnots.filter((k) => k.isCompleted !== 1);
  const done = allKnots.filter((k) => k.isCompleted === 1);

  const handleFeedback = async (item, feedback) => {
    await axios.patch(`/entries/${item.entryId}/action-item/complete`, {
      feedback,
    });
    setConstellations((prev) =>
      prev.map((c) => ({
        ...c,
        knots: c.knots.map((k) =>
          k.id === item.id ? { ...k, isCompleted: 1, feedback } : k
        ),
      }))
    );
    setCompletingId(item.id);
    setSelected(null);
    setTimeout(() => setCompletingId(null), 400);
    setTimeout(() => loadConstellations(), 1000);
  };

  const RECENT_ACTIVITY_MS = 7 * 24 * 60 * 60 * 1000;
  const hasRecentActivity = (c) =>
    c.knots.some(
      (k) =>
        k.entryCreatedAt &&
        Date.now() - new Date(k.entryCreatedAt).getTime() < RECENT_ACTIVITY_MS
    );

  const openKnot = (item) => {
    setSelected(item);
    setShareMessage("");
    setShareError(false);
  };

  const handleShareToForest = async (item) => {
    setShareMessage("");
    setShareError(false);
    try {
      await axios.post("/forest/share", { actionItemId: item.id });
      setSharedIds((prev) => new Set(prev).add(item.id));
    } catch (err) {
      setShareMessage(
        err.response?.data?.message || "지금은 풀어놓을 수 없어요."
      );
      setShareError(true);
    }
  };

  const openNaming = (tag) => {
    setNaming(tag);
    setNameInput("");
  };

  const saveName = async () => {
    if (!nameInput.trim()) return;
    await axios.patch("/room/constellations/name", {
      tag: naming,
      name: nameInput.trim(),
    });
    setConstellations((prev) =>
      prev.map((c) => (c.tag === naming ? { ...c, name: nameInput.trim() } : c))
    );
    setNaming(null);
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <p className={styles.heading}>
          지금 {active.length}개의 매듭을 쥐고 있어요
        </p>

        {hasEnoughPatterns && patterns.length > 0 && (
          <div className={styles.spotlightCard}>
            <p className={styles.spotlightTitle}>{patterns[0].title}</p>
            <p className={styles.spotlightDesc}>{patterns[0].description}</p>
          </div>
        )}

        {hasEnoughPatterns && patterns.length > 1 && (
          <div className={styles.patternSection}>
            <button
              type="button"
              className={styles.patternToggle}
              onClick={() => setPatternsOpen((v) => !v)}
            >
              <span>더 발견된 흐름 ({patterns.length - 1})</span>
              <span className={styles.patternToggleHint}>
                {patternsOpen ? "접기" : "펼치기"}
              </span>
            </button>
            {patternsOpen && (
              <div className={styles.patternList}>
                {patterns.slice(1).map((p, i) => (
                  <div key={i} className={styles.patternCard}>
                    <p className={styles.patternTitle}>{p.title}</p>
                    <p className={styles.patternDesc}>{p.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <p className={styles.status}>불러오는 중...</p>
        ) : constellations.length === 0 ? (
          <p className={styles.status}>
            아직 쥐고 있는 매듭이 없어요. 대화를 마치면 다짐이 여기 쌓여요.
          </p>
        ) : (
          <div className={styles.drawerList}>
            {constellations.map((c) => {
              const report = reportsByTag[c.tag];
              const activeCount = c.knots.filter(
                (k) => k.isCompleted !== 1
              ).length;
              const expanded = expandedTag === c.tag;
              const hasFeedback =
                report &&
                (report.goodCount > 0 ||
                  report.neutralCount > 0 ||
                  report.hardCount > 0);

              return (
                <div key={c.tag} className={styles.drawer}>
                  <button
                    type="button"
                    className={styles.drawerHeader}
                    onClick={() => setExpandedTag(expanded ? null : c.tag)}
                  >
                    <span className={styles.drawerName}>
                      {c.name || c.tag}
                      {hasRecentActivity(c) && (
                        <span
                          className={styles.warmDot}
                          aria-hidden="true"
                        />
                      )}
                    </span>
                    <span className={styles.drawerStatus}>
                      {c.completed ? "✦ 다 풀었어요" : `✦ ${activeCount}개 남음`}
                    </span>
                  </button>

                  {expanded && (
                    <div className={styles.drawerBody}>
                      {report && (
                        <p className={styles.drawerStats}>
                          다짐 {report.actionItemCount}개 · 완료{" "}
                          {report.completedCount}개
                        </p>
                      )}
                      {hasFeedback && (
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
                      {report?.insight && (
                        <p className={styles.insight}>{report.insight}</p>
                      )}

                      <div className={styles.knotList}>
                        {c.knots.map((knot) => (
                          <button
                            type="button"
                            key={knot.id}
                            className={`${styles.knotItem} ${
                              completingId === knot.id ? styles.completing : ""
                            }`}
                            onClick={() => openKnot(knot)}
                          >
                            <span className={styles.knotMark}>
                              {knot.isCompleted === 1 ? "✦" : "○"}
                            </span>
                            <span className={styles.knotText}>
                              {knot.content}
                            </span>
                          </button>
                        ))}
                      </div>

                      {c.completed && !c.name && (
                        <button
                          type="button"
                          className={styles.nameBtn}
                          onClick={() => openNaming(c.tag)}
                        >
                          이 서랍 이름 붙이기
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className={styles.footer}>
          완료한 다짐 {done.length}개 · 아직 쥐고 있는 매듭 {active.length}개
        </p>

        <KakaoAdFit adUnit={import.meta.env.VITE_ADFIT_UNIT_ROOM} />

        {selected && (
          <div className={styles.overlay} onClick={() => setSelected(null)}>
            <div
              className={styles.tooltip}
              onClick={(e) => e.stopPropagation()}
            >
              <p className={styles.tooltipLabel}>
                {selected.isCompleted === 1
                  ? "풀어낸 다짐"
                  : "아직 쥐고 있는 다짐"}
              </p>
              <p className={styles.tooltipText}>{selected.content}</p>

              {selected.isCompleted === 1 ? (
                <>
                  {sharedIds.has(selected.id) || selected.sharedToForest ? (
                    <p className={styles.successText}>
                      매듭 숲에 풀어놓았어요.
                    </p>
                  ) : (
                    <>
                      <p className={styles.feedbackPrompt}>
                        이 매듭, 다른 사람들에게도 익명으로 풀어놓아볼까요?
                      </p>
                      <div className={styles.feedbackRow}>
                        <button
                          className={styles.feedbackBtn}
                          onClick={() => handleShareToForest(selected)}
                        >
                          매듭 숲에 풀어놓기
                        </button>
                      </div>
                      {shareMessage && (
                        <p
                          className={
                            shareError ? styles.errorText : styles.successText
                          }
                        >
                          {shareMessage}
                        </p>
                      )}
                    </>
                  )}
                  <button
                    className={styles.closeBtn}
                    onClick={() => setSelected(null)}
                  >
                    닫기
                  </button>
                </>
              ) : (
                <>
                  <p className={styles.feedbackPrompt}>
                    이 다짐, 풀어내볼까요?
                  </p>
                  <div className={styles.feedbackRow}>
                    {feedbackOptions.map((opt) => (
                      <button
                        key={opt.value}
                        className={styles.feedbackBtn}
                        onClick={() => handleFeedback(selected, opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <button
                    className={styles.closeBtn}
                    onClick={() => setSelected(null)}
                  >
                    닫기
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {naming && (
          <div className={styles.overlay} onClick={() => setNaming(null)}>
            <div
              className={styles.tooltip}
              onClick={(e) => e.stopPropagation()}
            >
              <p className={styles.tooltipLabel}>서랍 이름 붙이기</p>
              <input
                className={styles.nameInput}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="예: 김아무개"
                autoFocus
              />
              <div className={styles.feedbackRow}>
                <button className={styles.feedbackBtn} onClick={saveName}>
                  저장
                </button>
                <button
                  className={styles.closeBtn}
                  onClick={() => setNaming(null)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
