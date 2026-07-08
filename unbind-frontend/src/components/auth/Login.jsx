import React, { useState } from "react";
import styles from "./Auth.module.css";
import axios, { API_BASE_URL } from "../../api/axiosInstance";
import { Link, useSearchParams } from "react-router-dom";

export const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [searchParams] = useSearchParams();
  const [errorMsg, setErrorMsg] = useState(
    searchParams.get("error") ? "소셜 로그인에 실패했어요. 다시 시도해주세요." : ""
  );

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      const response = await axios.post("/auth/login", {
        email: email.trim(),
        password,
      });
      onLoginSuccess(response.data);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "이메일 또는 비밀번호가 올바르지 않습니다."
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <img src="/logo.svg" alt="" className={styles.logo} />
          <p className={styles.brandName}>Unbind</p>
          <p className={styles.brandSub}>내려놓고, 나에게 집중하기</p>
        </div>

        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.field}>
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {errorMsg && <p className={styles.errorText}>{errorMsg}</p>}

          <button type="submit" className={styles.submitBtn}>
            로그인
          </button>
        </form>

        <div className={styles.divider}>
          <span>또는</span>
        </div>

        <div className={styles.socialButtons}>
          <a
            href={`${API_BASE_URL}/oauth2/authorization/google`}
            className={`${styles.socialBtn} ${styles.googleBtn}`}
          >
            구글로 계속하기
          </a>
          <a
            href={`${API_BASE_URL}/oauth2/authorization/kakao`}
            className={`${styles.socialBtn} ${styles.kakaoBtn}`}
          >
            카카오로 계속하기
          </a>
        </div>

        <p className={styles.switchText}>
          계정이 없으신가요?{" "}
          <Link to="/signup" className={styles.switchLink}>
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
};
