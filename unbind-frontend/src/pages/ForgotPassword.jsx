import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../components/auth/Auth.module.css";
import axios from "../api/axiosInstance";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("이메일을 입력해주세요.");
      return;
    }

    try {
      await axios.post("/auth/password-reset/request", { email: email.trim() });
      setSent(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "요청에 실패했어요. 다시 시도해주세요.");
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

        {sent ? (
          <p className={styles.switchText}>
            입력하신 이메일로 재설정 링크를 보냈어요. 메일함을 확인해주세요.
          </p>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
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

            {errorMsg && <p className={styles.errorText}>{errorMsg}</p>}

            <button type="submit" className={styles.submitBtn}>
              재설정 링크 받기
            </button>
          </form>
        )}

        <p className={styles.switchText}>
          <Link to="/login" className={styles.switchLink}>
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
};
