import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Auth.module.css";
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

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("닉네임, 이메일, 비밀번호를 모두 입력해주세요.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg("올바른 이메일 형식이 아니에요.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("비밀번호는 8자 이상이어야 해요.");
      return;
    }

    try {
      await axios.post("/auth/signup", {
        email: email.trim(),
        password,
        name: name.trim(),
      });
      navigate("/login");
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "회원가입에 실패했습니다. 다시 시도해주세요."
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

        <form className={styles.form} onSubmit={handleSignUp}>
          <div className={styles.field}>
            <label htmlFor="name">닉네임</label>
            <input
              type="text"
              id="name"
              placeholder="닉네임 입력"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
              placeholder="비밀번호 입력 (8자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          {errorMsg && <p className={styles.errorText}>{errorMsg}</p>}

          <button type="submit" className={styles.submitBtn}>
            회원가입
          </button>
        </form>

        <p className={styles.switchText}>
          이미 계정이 있으신가요?{" "}
          <Link to="/login" className={styles.switchLink}>
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
};
