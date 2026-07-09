import { useEffect, useRef } from "react";

const SCRIPT_SRC = "//t1.kakaocdn.net/kas/static/ba.min.js";

let scriptPromise = null;
const loadAdFitScript = () => {
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

// adUnit is a Kakao AdFit "DAN-..." unit id. Renders nothing if not configured,
// so this is safe to place before an ad unit has been issued.
export const KakaoAdFit = ({ adUnit, width = 320, height = 100 }) => {
  const insRef = useRef(null);

  useEffect(() => {
    if (!adUnit) return;
    loadAdFitScript().catch(() => {});
  }, [adUnit]);

  if (!adUnit) return null;

  return (
    <ins
      ref={insRef}
      className="kakao_ad_area"
      style={{ display: "none" }}
      data-ad-unit={adUnit}
      data-ad-width={width}
      data-ad-height={height}
    />
  );
};
