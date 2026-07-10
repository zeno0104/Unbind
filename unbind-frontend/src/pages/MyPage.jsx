import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axiosInstance";
import { Sidebar } from "../components/layout/Sidebar";
import { KakaoAdFit } from "../components/KakaoAdFit";
import styles from "./MyPage.module.css";

const COOLDOWN_DAYS = 30;

const formatDateTime = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toISOString().slice(0, 16).replace("T", " ");
};

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
};

export const MyPage = () => {
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [scrapCount, setScrapCount] = useState(null);

  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  const [feedbackContent, setFeedbackContent] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackIsError, setFeedbackIsError] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackBoardLoading, setFeedbackBoardLoading] = useState(false);

  useEffect(() => {
    axios.get("/users/me").then((res) => {
      setUser(res.data);
      setNickname(res.data.name || "");
      if (res.data.admin) {
        setFeedbackBoardLoading(true);
        axios
          .get("/feedback")
          .then((r) => setFeedbackList(r.data))
          .finally(() => setFeedbackBoardLoading(false));
      }
    });
    axios.get("/forest/scraps").then((res) => setScrapCount(res.data.length));
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }
    setPushSupported(true);
    navigator.serviceWorker.ready.then(async (registration) => {
      const subscription = await registration.pushManager.getSubscription();
      setPushEnabled(!!subscription);
    });
  }, []);

  const handleTogglePush = async () => {
    setMessage("");
    setIsError(false);

    if (!pushEnabled && Notification.permission === "denied") {
      setMessage(
        "알림이 차단되어 있어요. 주소창의 자물쇠(사이트 정보) 아이콘에서 알림 권한을 허용으로 바꾼 뒤 다시 시도해주세요."
      );
      setIsError(true);
      return;
    }

    setPushLoading(true);
    try {
      if (pushEnabled) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await axios.delete("/push/subscribe", {
            data: { endpoint: subscription.endpoint },
          });
          await subscription.unsubscribe();
        }
        setPushEnabled(false);
      } else {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setMessage("알림을 받으려면 권한을 허용해주세요.");
          setIsError(true);
          setPushLoading(false);
          return;
        }
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
        });
        const key = subscription.toJSON().keys;
        await axios.post("/push/subscribe", {
          endpoint: subscription.endpoint,
          p256dh: key.p256dh,
          auth: key.auth,
        });
        setPushEnabled(true);
      }
    } catch {
      setMessage("알림 설정을 바꾸지 못했어요.");
      setIsError(true);
    } finally {
      setPushLoading(false);
    }
  };

  const nextAllowedDate = (() => {
    if (!user?.nameChangedAt) return null;
    const changed = new Date(user.nameChangedAt);
    const next = new Date(changed.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
    return next > new Date() ? next : null;
  })();

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "정말 계정을 삭제하시겠어요? 작성한 기록, 다짐, 매듭숲 게시물이 모두 사라지고 되돌릴 수 없어요."
      )
    ) {
      return;
    }
    try {
      await axios.delete("/users/me");
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (err) {
      setMessage(err.response?.data?.message || "계정 삭제에 실패했어요.");
      setIsError(true);
    }
  };

  const handleSendFeedback = async () => {
    setFeedbackMessage("");
    setFeedbackIsError(false);
    if (!feedbackContent.trim()) {
      setFeedbackMessage("피드백 내용을 입력해주세요.");
      setFeedbackIsError(true);
      return;
    }
    try {
      await axios.post("/feedback", { content: feedbackContent.trim() });
      setFeedbackSent(true);
      setFeedbackContent("");
    } catch (err) {
      setFeedbackMessage(err.response?.data?.message || "전송에 실패했어요.");
      setFeedbackIsError(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

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

        <Link to="/mypage/scraps" className={styles.linkCard}>
          <span>스크랩한 매듭</span>
          <span className={styles.linkCardRight}>
            {scrapCount !== null && (
              <span className={styles.linkCardCount}>{scrapCount}개</span>
            )}
            <span className={styles.linkCardArrow}>›</span>
          </span>
        </Link>

        {pushSupported && (
          <div className={styles.card} style={{ marginTop: 24 }}>
            <div className={styles.pushHeader}>
              <p className={styles.label} style={{ margin: 0 }}>다짐 알림</p>
              <span
                className={pushEnabled ? styles.pushBadgeOn : styles.pushBadgeOff}
              >
                {pushEnabled ? "켜짐" : "꺼짐"}
              </span>
            </div>
            <div className={styles.editRow} style={{ marginTop: 10 }}>
              <p className={styles.staticValue} style={{ flex: 1 }}>
                {pushEnabled
                  ? "아직 풀지 않은 매듭을 알려드려요. 저녁 8시쯤 알림이 와요."
                  : "아직 풀지 않은 매듭이 있으면 저녁에 알려드릴까요?"}
              </p>
              <button
                className={pushEnabled ? styles.toggleOffBtn : styles.saveBtn}
                onClick={handleTogglePush}
                disabled={pushLoading}
              >
                {pushEnabled ? "알림 끄기" : "알림 받기"}
              </button>
            </div>
          </div>
        )}

        <div className={styles.scrapSection}>
          <p className={styles.sectionTitle}>피드백 보내기</p>

          {user.admin ? (
            <div className={styles.card}>
              {feedbackBoardLoading ? (
                <p className={styles.hint}>불러오는 중...</p>
              ) : feedbackList.length === 0 ? (
                <p className={styles.hint}>아직 받은 피드백이 없어요.</p>
              ) : (
                <div className={styles.boardList}>
                  {feedbackList.map((f) => (
                    <div key={f.id} className={styles.boardItem}>
                      <div className={styles.boardItemTop}>
                        <span className={styles.boardEmail}>
                          {f.userName} · {f.userEmail}
                        </span>
                        <span className={styles.boardDate}>
                          {formatDateTime(f.createdAt)}
                        </span>
                      </div>
                      <p className={styles.boardContent}>{f.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.card}>
              {feedbackSent ? (
                <p className={styles.thanks}>
                  소중한 의견 감사해요. 잘 읽고 반영해볼게요.
                </p>
              ) : (
                <>
                  <textarea
                    className={styles.textarea}
                    value={feedbackContent}
                    onChange={(e) => setFeedbackContent(e.target.value)}
                    placeholder="불편했던 점, 좋았던 점, 있었으면 하는 기능을 편하게 남겨주세요..."
                    rows={5}
                  />
                  {feedbackMessage && (
                    <p
                      className={
                        feedbackIsError ? styles.errorText : styles.successText
                      }
                    >
                      {feedbackMessage}
                    </p>
                  )}
                  <button className={styles.saveBtn} style={{ width: "100%" }} onClick={handleSendFeedback}>
                    보내기
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <KakaoAdFit adUnit={import.meta.env.VITE_ADFIT_UNIT_MYPAGE} />

        <div className={styles.card} style={{ marginTop: 24 }}>
          <p className={styles.label}>계정 관리</p>
          <p className={styles.hint}>
            계정을 삭제하면 모든 기록과 다짐, 매듭숲 게시물이 영구히 삭제돼요.
          </p>
          <button className={styles.deleteAccountBtn} onClick={handleDeleteAccount}>
            계정 삭제
          </button>
        </div>

        <div className={styles.footerRow}>
          <Link to="/privacy" className={styles.footerLink}>
            개인정보처리방침
          </Link>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
};
