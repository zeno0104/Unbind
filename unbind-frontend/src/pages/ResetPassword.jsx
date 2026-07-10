import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import styles from "../components/auth/Auth.module.css";
import axios from "../api/axiosInstance";

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 8) {
      setErrorMsg("비밀번호는 8자 이상이어야 해요.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("비밀번호가 서로 일치하지 않아요.");
      return;
    }

    try {
      await axios.post("/auth/password-reset/confirm", {
        token,
        newPassword: password,
      });
      navigate("/login");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "비밀번호 재설정에 실패했어요.");
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

        {!token ? (
          <p className={styles.errorText}>
            링크가 올바르지 않아요. 이메일에서 받은 링크를 다시 확인해주세요.
          </p>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="password">새 비밀번호</label>
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
            <div className={styles.field}>
              <label htmlFor="confirmPassword">새 비밀번호 확인</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="비밀번호 다시 입력"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            {errorMsg && <p className={styles.errorText}>{errorMsg}</p>}

            <button type="submit" className={styles.submitBtn}>
              비밀번호 변경
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
