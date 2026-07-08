import { Link } from "react-router-dom";
import { RoomIcon, RelationshipIcon, InsightIcon } from "../components/layout/NavIcons";
import styles from "./Landing.module.css";

export const Landing = () => {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <img src="/logo.svg" alt="" className={styles.logo} />
          <span className={styles.brandName}>Unbind</span>
        </div>
        <Link to="/login" className={styles.headerLoginLink}>
          로그인
        </Link>
      </header>

      <main className={styles.hero}>
        <div className={styles.breathCircle} />
        <p className={styles.eyebrow}>내려놓고, 나에게 집중하기</p>
        <h1 className={styles.headline}>
          관계에서 오는 마음의 짐,
          <br />
          혼자 끙끙 앓지 마세요
        </h1>
        <p className={styles.sub}>
          Unbind는 짧은 대화로 "내가 어떻게 해도 안 바뀌었을 부분"을 스스로
          알아차리고, 지금 할 수 있는 작은 다짐 하나를 남기게 도와주는
          앱이에요.
        </p>
        <div className={styles.ctaRow}>
          <Link to="/signup" className={styles.primaryBtn}>
            무료로 시작하기
          </Link>
          <Link to="/login" className={styles.ghostBtn}>
            로그인
          </Link>
        </div>
      </main>

      <section className={styles.steps}>
        <div className={styles.step}>
          <span className={styles.stepBadge}>1</span>
          <p className={styles.stepTitle}>먼저, 내려놓아요</p>
          <p className={styles.stepDesc}>
            짧은 질문 두 번으로 내가 바꿀 수 없었던 부분을 알아차려요
          </p>
        </div>
        <div className={styles.step}>
          <span className={styles.stepBadge}>2</span>
          <p className={styles.stepTitle}>그다음, 다시 쥐어요</p>
          <p className={styles.stepDesc}>
            내가 할 수 있는 것에 집중해서 작은 다짐 하나를 남겨요
          </p>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.featureCard}>
          <span className={styles.featureIcon}>
            <RoomIcon />
          </span>
          <p className={styles.featureTitle}>나의 방</p>
          <p className={styles.featureDesc}>
            풀어낸 다짐은 빛으로, 관계별 별자리로 쌓여요
          </p>
        </div>
        <div className={styles.featureCard}>
          <span className={styles.featureIcon}>
            <RelationshipIcon />
          </span>
          <p className={styles.featureTitle}>관계 리포트</p>
          <p className={styles.featureDesc}>
            같은 사람과의 반복된 기록에서 흐름을 발견해요
          </p>
        </div>
        <div className={styles.featureCard}>
          <span className={styles.featureIcon}>
            <InsightIcon />
          </span>
          <p className={styles.featureTitle}>패턴 인사이트</p>
          <p className={styles.featureDesc}>
            쌓아온 기록에서 나만의 패턴을 짚어드려요
          </p>
        </div>
      </section>

      <footer className={styles.footer}>
        <Link to="/signup" className={styles.primaryBtn}>
          무료로 시작하기
        </Link>
      </footer>
    </div>
  );
};
