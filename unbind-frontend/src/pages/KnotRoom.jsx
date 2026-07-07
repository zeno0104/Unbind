import { useEffect, useMemo, useRef, useState } from "react";
import axios from "../api/axiosInstance";
import { Sidebar } from "../components/layout/Sidebar";
import styles from "./KnotRoom.module.css";

const CENTER = { x: 340, y: 240 };
const CLUSTER_RADIUS = 150;
const MAX_KNOT_SPREAD = 55;
const GOLDEN_ANGLE = 137.5 * (Math.PI / 180);

const feedbackOptions = [
  { value: "GOOD", label: "도움됐어요" },
  { value: "NEUTRAL", label: "그저그랬어요" },
  { value: "HARD", label: "안맞았어요" },
];

const getClusterCenters = (tags) => {
  if (tags.length === 1) {
    return [{ tag: tags[0], x: CENTER.x, y: CENTER.y }];
  }
  return tags.map((tag, i) => {
    const angle = (2 * Math.PI * i) / tags.length - Math.PI / 2;
    return {
      tag,
      x: CENTER.x + CLUSTER_RADIUS * Math.cos(angle),
      y: CENTER.y + CLUSTER_RADIUS * Math.sin(angle),
    };
  });
};

const getKnotOffset = (index) => {
  const angle = index * GOLDEN_ANGLE;
  const radius = Math.min(18 + index * 14, MAX_KNOT_SPREAD);
  return { dx: Math.cos(angle) * radius, dy: Math.sin(angle) * radius };
};

export const KnotRoom = () => {
  const [constellations, setConstellations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [warmth, setWarmth] = useState(0);
  const [releasingId, setReleasingId] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [naming, setNaming] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [showSubscribePrompt, setShowSubscribePrompt] = useState(false);
  const svgRef = useRef(null);

  const loadConstellations = () => {
    axios.get("/room/constellations").then((res) => setConstellations(res.data));
  };

  useEffect(() => {
    loadConstellations();
    axios.get("/users/me").then((res) => setIsPro(res.data.isPro === 1));
    axios.get("/stats/warmth").then((res) => setWarmth(res.data.warmth));
  }, []);

  const stage = warmth < 30 ? "night" : warmth < 60 ? "dawn" : "day";
  const plantCount = Math.max(0, Math.floor((warmth - 60) / 10));

  const layout = useMemo(() => {
    const centers = getClusterCenters(constellations.map((c) => c.tag));
    const centerByTag = Object.fromEntries(centers.map((c) => [c.tag, c]));
    const positionById = {};
    const clusters = constellations.map((c) => {
      const center = centerByTag[c.tag];
      const points = c.knots.map((knot, i) => {
        const { dx, dy } = getKnotOffset(i);
        const pos = { x: center.x + dx, y: center.y + dy };
        positionById[knot.id] = pos;
        return pos;
      });
      const labelY = center.y - MAX_KNOT_SPREAD - 22;
      return { ...c, center, points, labelY };
    });
    return { clusters, positionById };
  }, [constellations]);

  const allKnots = constellations.flatMap((c) => c.knots);
  const active = allKnots.filter((k) => k.isCompleted !== 1);
  const done = allKnots.filter((k) => k.isCompleted === 1);
  const completedConstellations = constellations.filter(
    (c) => c.completed && c.knots.length > 1
  );

  const handleFeedback = async (item, feedback) => {
    await axios.patch(`/entries/${item.entryId}/action-item/complete`, {
      feedback,
    });
    setReleasingId(item.id);
    setConstellations((prev) =>
      prev.map((c) => ({
        ...c,
        knots: c.knots.map((k) =>
          k.id === item.id ? { ...k, isCompleted: 1, feedback } : k
        ),
      }))
    );
    setSelected(null);
    setTimeout(() => {
      setReleasingId(null);
      loadConstellations();
    }, 900);
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

  const doExport = () => {
    const svgEl = svgRef.current;
    const svgString = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1360;
      canvas.height = 960;
      const ctx = canvas.getContext("2d");
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0, 680, 480);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        const link = document.createElement("a");
        link.download = "나의_별자리.png";
        link.href = URL.createObjectURL(blob);
        link.click();
      });
    };
    img.src = url;
  };

  const handleExportClick = () => {
    if (!isPro) {
      setShowSubscribePrompt(true);
      return;
    }
    doExport();
  };

  const handleSubscribeAndExport = async () => {
    await axios.post("/users/subscribe");
    setIsPro(true);
    setShowSubscribePrompt(false);
    doExport();
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <p className={styles.heading}>
          지금 {active.length}개의 매듭을 쥐고 있어요
        </p>

        <div className={`${styles.room} ${styles[stage]}`}>
          <svg ref={svgRef} viewBox="0 0 680 480" className={styles.svg}>
            <defs>
              <linearGradient id="skyNight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0a0c10" />
                <stop offset="100%" stopColor="#12151a" />
              </linearGradient>
              <linearGradient id="skyDawn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1c1f38" />
                <stop offset="100%" stopColor="#4a3350" />
              </linearGradient>
              <linearGradient id="skyDay" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4a3f5c" />
                <stop offset="100%" stopColor="#9a7256" />
              </linearGradient>
              <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#d9a26c" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#d9a26c" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffd9a0" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#ffd9a0" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect
              x="0"
              y="0"
              width="680"
              height="480"
              fill={
                stage === "day"
                  ? "url(#skyDay)"
                  : stage === "dawn"
                  ? "url(#skyDawn)"
                  : "url(#skyNight)"
              }
            />

            {stage === "day" && (
              <circle cx="560" cy="70" r="90" fill="url(#sunGlow)" />
            )}

            {Array.from({ length: plantCount }).map((_, i) => (
              <path
                key={i}
                d={`M${40 + i * 55} 480 Q ${40 + i * 55 - 6} 450, ${
                  40 + i * 55
                } 425 Q ${40 + i * 55 + 12} 450, ${40 + i * 55} 480`}
                fill="#5e8567"
                opacity="0.8"
              />
            ))}

            {layout.clusters.map((cluster) => (
              <g key={cluster.tag}>
                {cluster.points.length > 1 && (
                  <polyline
                    points={cluster.points.map((p) => `${p.x},${p.y}`).join(" ")}
                    fill="none"
                    stroke={cluster.completed ? "#e3a159" : "#4a4038"}
                    strokeWidth={cluster.completed ? "1.4" : "1"}
                    strokeOpacity={cluster.completed ? "0.85" : "0.4"}
                  />
                )}
                <text
                  x={cluster.center.x}
                  y={cluster.labelY}
                  textAnchor="middle"
                  className={
                    cluster.completed ? styles.labelCompleted : styles.label
                  }
                  onClick={() =>
                    cluster.completed && !cluster.name && openNaming(cluster.tag)
                  }
                >
                  {cluster.name || cluster.tag}
                  {cluster.completed ? " ✦" : ""}
                </text>
              </g>
            ))}

            {allKnots.map((item) => {
              const pos = layout.positionById[item.id];
              if (!pos) return null;
              const isReleasing = releasingId === item.id;
              return (
                <g
                  key={item.id}
                  className={`${styles.knotGroup} ${
                    isReleasing ? styles.releasing : ""
                  }`}
                  onClick={() => setSelected(item)}
                >
                  {item.isCompleted === 1 && !isReleasing ? (
                    <g className={styles.glowShape} style={{ opacity: 1 }}>
                      <circle cx={pos.x} cy={pos.y} r="12" fill="url(#glow)" />
                      <circle cx={pos.x} cy={pos.y} r="2.5" fill="#f0c896" />
                    </g>
                  ) : (
                    <>
                      <g className={styles.knotShape}>
                        <path
                          d={`M${pos.x} ${pos.y - 22} Q ${pos.x + 15} ${
                            pos.y - 8
                          }, ${pos.x + 4} ${pos.y + 11} Q ${pos.x - 7} ${
                            pos.y + 28
                          }, ${pos.x + 11} ${pos.y + 37}`}
                          stroke="#8a7256"
                          strokeWidth="1.6"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <ellipse
                          cx={pos.x}
                          cy={pos.y - 24}
                          rx="6.5"
                          ry="12"
                          fill="#3a2a18"
                          transform={`rotate(-15 ${pos.x} ${pos.y - 24})`}
                        />
                        <ellipse
                          cx={pos.x + 9}
                          cy={pos.y - 6}
                          rx="6"
                          ry="11"
                          fill="#3a2a18"
                          transform={`rotate(30 ${pos.x + 9} ${pos.y - 6})`}
                        />
                      </g>
                      <g className={styles.glowShape}>
                        <circle cx={pos.x} cy={pos.y} r="12" fill="url(#glow)" />
                        <circle cx={pos.x} cy={pos.y} r="2.5" fill="#f0c896" />
                      </g>
                    </>
                  )}
                  <circle cx={pos.x} cy={pos.y} r="26" fill="transparent" />
                </g>
              );
            })}
          </svg>
        </div>

        <div className={styles.footerRow}>
          <p className={styles.footer}>
            풀어낸 빛 {done.length}개 · 아직 쥐고 있는 매듭 {active.length}개
          </p>
          <button className={styles.exportBtn} onClick={handleExportClick}>
            내 별자리 지도 저장하기
          </button>
        </div>

        {completedConstellations.length > 0 && (
          <div className={styles.gallery}>
            <p className={styles.galleryTitle}>완성된 별자리</p>
            <div className={styles.galleryList}>
              {completedConstellations.map((c) => (
                <div key={c.tag} className={styles.galleryItem}>
                  <span className={styles.galleryStar}>✦</span>
                  <span>{c.name || c.tag}</span>
                  <span className={styles.galleryCount}>
                    {c.knots.length}개의 매듭
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

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
                <button
                  className={styles.closeBtn}
                  onClick={() => setSelected(null)}
                >
                  닫기
                </button>
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
              <p className={styles.tooltipLabel}>별자리 이름 짓기</p>
              <input
                className={styles.nameInput}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="예: 엄마와의 화해"
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

        {showSubscribePrompt && (
          <div
            className={styles.overlay}
            onClick={() => setShowSubscribePrompt(false)}
          >
            <div
              className={styles.tooltip}
              onClick={(e) => e.stopPropagation()}
            >
              <p className={styles.tooltipLabel}>구독 전용 기능</p>
              <p className={styles.tooltipText}>
                내 별자리 지도를 이미지로 저장하고 공유하려면 구독이
                필요해요.
              </p>
              <div className={styles.feedbackRow}>
                <button
                  className={styles.feedbackBtn}
                  onClick={handleSubscribeAndExport}
                >
                  구독하고 저장하기
                </button>
                <button
                  className={styles.closeBtn}
                  onClick={() => setShowSubscribePrompt(false)}
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
