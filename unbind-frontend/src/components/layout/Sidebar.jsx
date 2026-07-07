import { Link, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";

export const Sidebar = ({ onLogout }) => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <nav className={styles.nav}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <img src="/logo.svg" alt="" className={styles.logo} />
          <span className={styles.brandName}>Unbind</span>
        </div>
        <Link
          to="/"
          className={`${styles.navItem} ${isHome ? styles.active : ""}`}
        >
          홈
        </Link>
      </div>
      <button className={styles.logoutBtn} onClick={onLogout}>
        로그아웃
      </button>
    </nav>
  );
};
