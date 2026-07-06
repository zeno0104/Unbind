import React, { useState } from "react";
import styles from "../auth/Login.module.css";
import axios from "../../api/axiosInstance";

export const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/auth/login", { email, password });
      onLoginSuccess(response.data);
    } catch (err) {
      setErrorMsg("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.title}>
          <div>
            <img src="" alt="로고" />
          </div>
          <div>
            <p className={styles.titleText}>Unbind</p>
            <p className={styles.titleTextInfo}>내려놓고, 나에게 집중하기</p>
          </div>
        </div>
        <form onSubmit={handleLogin}>
          <div className={styles.login}>
            <div className={styles.email}>
              <label htmlFor="email">이메일</label>
              <input
                type="text"
                id="email"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className={styles.password}>
              <label htmlFor="password">비밀번호</label>
              <input
                type="password"
                id="password"
                placeholder="비밀번호 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          {errorMsg && <p className={styles.errorText}>{errorMsg}</p>}
          <button type="submit" className={styles.loginBtn}>
            로그인
          </button>
        </form>
        <div className={styles.signUpText}>
          <p>
            계정이 없으신가요? <span>회원가입</span>
          </p>
        </div>
      </div>
    </div>
  );
};
