import React from "react";
import styles from "./Sidebar.module.css";
import { Link } from "react-router-dom";

export const Sidebar = ({ onLogout }) => {
  return (
    <div className={styles.container}>
      <div>
        <div className={styles.title}>
          <img src="/logo.svg" alt="logo" />
          <p>Unbind</p>
        </div>
        <div className={styles.menuTab}>
          <Link to="/">홈</Link>
          <Link to="">지난 기록</Link>
        </div>
      </div>
      <div className={styles.logout}>
        <Link to="/login" onClick={onLogout}>
          로그아웃
        </Link>
      </div>
    </div>
  );
};
