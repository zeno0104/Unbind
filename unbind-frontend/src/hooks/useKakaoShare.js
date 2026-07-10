const SCRIPT_SRC = "https://developers.kakao.com/sdk/js/kakao.js";

let scriptPromise = null;
const loadKakaoScript = () => {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
  return scriptPromise;
};

const getKakao = async () => {
  const jsKey = import.meta.env.VITE_KAKAO_JS_KEY;
  if (!jsKey) return null;
  await loadKakaoScript();
  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(jsKey);
  }
  return window.Kakao;
};

// 카카오 디벨로퍼스에서 발급받은 JS 앱키(VITE_KAKAO_JS_KEY)가 없으면 아무 것도 하지 않는다.
export const useKakaoShare = () => {
  const isAvailable = !!import.meta.env.VITE_KAKAO_JS_KEY;

  const shareKnot = async ({ situationSummary, actionText, knotId }) => {
    const Kakao = await getKakao();
    if (!Kakao) return false;

    const link = `${window.location.origin}/forest?knot=${knotId}`;
    Kakao.Share.sendDefault({
      objectType: "text",
      text: `${situationSummary}\n✦ ${actionText}`,
      link: {
        mobileWebUrl: link,
        webUrl: link,
      },
    });
    return true;
  };

  return { isAvailable, shareKnot };
};
