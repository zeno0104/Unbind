import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import axios from "../../api/axiosInstance";

export const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      await axios.post("/auth/signup", { email, password, name });
      alert("회원가입이 완료됐습니다. 로그인해주세요.");
      navigate("/login");
    } catch (err) {
      setErrorMsg("회원가입에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.title}>
          <div>
            <img src="/logo.svg" alt="로고" />
          </div>
          <div>
            <p className={styles.titleText}>Unbind</p>
            <p className={styles.titleTextInfo}>내려놓고, 나에게 집중하기</p>
          </div>
        </div>
        <form onSubmit={handleSignUp}>
          <div className={styles.login}>
            <div className={styles.email}>
              <label htmlFor="name">이름</label>
              <input
                type="text"
                id="name"
                placeholder="이름 입력"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
            회원가입
          </button>
        </form>
        <div className={styles.signUpText}>
          <p>
            이미 계정이 있으신가요?{" "}
            <span
              onClick={() => navigate("/login")}
              style={{ cursor: "pointer" }}
            >
              로그인
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
