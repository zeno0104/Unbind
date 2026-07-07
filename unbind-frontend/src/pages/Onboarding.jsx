import { useState } from "react";
import styles from "./Onboarding.module.css";

const slides = [
  {
    title: "관계에서 오는 스트레스,\n자꾸 마음에 걸리지 않나요",
    desc: "매번 곱씹어봐도 답이 안 나오죠.\nUnbind는 그 마음을 두 단계로 나눠서 풀어가요.",
  },
  {
    title: "먼저, 내려놓아요",
    desc: "짧은 질문 두 번으로,\n내가 어떻게 해도 안 바뀌었을 부분을\n스스로 알아차려요.",
  },
  {
    title: "그다음, 다시 쥐어요",
    desc: "내가 할 수 있는 것에만 집중해서,\n오늘 실천할 작은 다짐 하나를 남겨요.",
  },
  {
    title: "당신의 이야기를\n들려주세요",
    desc: "",
  },
];

export const Onboarding = () => {
  const [step, setStep] = useState(0);
  const isLast = step === slides.length - 1;

  const finish = () => {
    localStorage.setItem("onboarding_done", "1");
    window.location.href = "/";
  };

  const next = () => {
    if (isLast) {
      finish();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className={styles.center}>
      <div key={step} className={styles.fadeIn}>
        {!isLast && (
          <button className={styles.skipBtn} onClick={finish}>
            건너뛰기
          </button>
        )}

        <div className={styles.breathCircle} />

        <p className={styles.title}>{slides[step].title}</p>
        {slides[step].desc && (
          <p className={styles.desc}>{slides[step].desc}</p>
        )}

        <div className={styles.dots}>
          {slides.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i === step ? styles.dotActive : ""}`}
            />
          ))}
        </div>

        <button className={styles.primaryBtn} onClick={next}>
          {isLast ? "시작하기" : "다음"}
        </button>
      </div>
    </div>
  );
};
