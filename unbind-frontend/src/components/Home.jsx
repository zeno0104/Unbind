import { JournalForm } from "./journal/JournalForm";
import { Sidebar } from "./layout/Sidebar";
import { WarmthGauge } from "./WarmthGauge";
import { KnotReminder } from "./KnotReminder";
import { KakaoAdFit } from "./KakaoAdFit";
import styles from "./Home.module.css";

export const Home = () => {
  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <div className={styles.hero}>
          <p className={styles.heroTitle}>오늘, 마음에 걸리는 일이 있었나요</p>
          <p className={styles.heroSub}>
            내려놓을 것과 내가 쥘 것을, 천천히 나눠봐요
          </p>
        </div>

        <KnotReminder />
        <WarmthGauge />
        <JournalForm />
        <KakaoAdFit adUnit="DAN-sqNwUJ6uhPIBBRke" width={320} height={100} />
      </div>
    </div>
  );
};
