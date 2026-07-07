import { Link, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";

export const Sidebar = ({ onLogout }) => {
  const location = useLocation();

  return (
    <nav className={styles.nav}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <img src="/logo.svg" alt="" className={styles.logo} />
          <span className={styles.brandName}>Unbind</span>
        </div>
        <Link
          to="/"
          className={`${styles.navItem} ${
            location.pathname === "/" ? styles.active : ""
          }`}
        >
          홈
        </Link>
        <Link
          to="/room"
          className={`${styles.navItem} ${
            location.pathname === "/room" ? styles.active : ""
          }`}
        >
          나의 방
        </Link>
        <Link
          to="/calendar"
          className={`${styles.navItem} ${
            location.pathname === "/calendar" ? styles.active : ""
          }`}
        >
          캘린더
        </Link>
        <Link
          to="/relationships"
          className={`${styles.navItem} ${
            location.pathname === "/relationships" ? styles.active : ""
          }`}
        >
          관계 리포트
        </Link>
        <Link
          to="/insights"
          className={`${styles.navItem} ${
            location.pathname === "/insights" ? styles.active : ""
          }`}
        >
          패턴 인사이트
        </Link>
      </div>
      {onLogout && (
        <div className={styles.bottom}>
          <div className={styles.divider} />
          <button className={styles.logoutBtn} onClick={onLogout}>
            로그아웃
          </button>
        </div>
      )}
    </nav>
  );
};
