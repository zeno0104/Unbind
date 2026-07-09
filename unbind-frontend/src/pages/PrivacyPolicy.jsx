import { Link } from "react-router-dom";
import styles from "./PrivacyPolicy.module.css";

const SECTIONS = [
  {
    title: "1. 수집하는 개인정보 항목",
    body: `- 회원가입 시: 이메일, 비밀번호(암호화 저장), 닉네임
- 소셜 로그인(구글/카카오) 시: 이메일, 프로필 닉네임 등 제공에 동의한 정보
- 서비스 이용 중: 작성하신 기록(상황 설명, AI와의 대화 내용), 관계 태그, 다짐(액션 아이템) 및 완료 여부, 매듭 숲 공유·공감·스크랩 활동
- 자동 수집 정보: 접속 로그, 기기/브라우저 정보(오류 확인 및 서비스 개선 목적)`,
  },
  {
    title: "2. 개인정보의 수집 및 이용 목적",
    body: `- 회원 식별 및 로그인 유지
- AI 기반 대화·기록·인사이트 기능 제공
- 매듭 숲(커뮤니티) 공유 기능 제공 및 부적절한 콘텐츠 필터링
- 서비스 문의 응대 및 오류 개선`,
  },
  {
    title: "3. 개인정보의 제3자 제공 및 처리위탁",
    body: `Unbind는 서비스 제공을 위해 아래와 같이 개인정보 처리를 위탁하거나, AI 처리를 위해 외부 API로 전송합니다.

- Anthropic (Claude API): 회원님이 작성한 기록 및 대화 내용은 AI 응답 생성을 위해 Anthropic의 API로 전송되어 처리됩니다.
- Google, Kakao: 소셜 로그인을 선택하신 경우, 인증을 위해 각 사업자와 필요한 최소 정보를 주고받습니다.

회원님의 기록은 위 목적 외에 다른 사업자에게 판매되거나 제공되지 않습니다.`,
  },
  {
    title: "4. 개인정보의 보유 및 이용 기간",
    body: `회원 탈퇴 시 또는 이용자가 삭제를 요청하는 즉시 지체 없이 파기합니다. 단, 관계 법령에 따라 보존이 필요한 경우 해당 법령이 정한 기간 동안 보관합니다.`,
  },
  {
    title: "5. 이용자의 권리",
    body: `이용자는 언제든지 본인의 개인정보를 조회, 정정, 삭제하거나 처리 정지를 요청할 수 있습니다. 아래 문의처로 연락해 주시면 지체 없이 조치하겠습니다.`,
  },
  {
    title: "6. 민감한 기록에 대한 안내",
    body: `Unbind에 남기시는 기록은 관계·감정과 관련된 민감한 내용을 포함할 수 있습니다. 매듭 숲에 공유되는 콘텐츠는 AI 검수를 거쳐 개인을 특정할 수 있는 정보가 제거된 요약 형태로만 게시되며, 작성자 본인 외에는 원문 기록에 접근할 수 없습니다.`,
  },
  {
    title: "7. 문의처",
    body: `개인정보 관련 문의: unbind0104@gmail.com`,
  },
];

export const PrivacyPolicy = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Link to="/" className={styles.backLink}>
          ← 돌아가기
        </Link>
        <h1 className={styles.title}>개인정보처리방침</h1>
        <p className={styles.updated}>시행일: 2026년 7월 9일</p>

        {SECTIONS.map((s) => (
          <div className={styles.section} key={s.title}>
            <p className={styles.sectionTitle}>{s.title}</p>
            <p className={styles.sectionBody}>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
