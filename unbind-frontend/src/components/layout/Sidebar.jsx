import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";
import {
  HomeIcon,
  RoomIcon,
  CalendarIcon,
  RelationshipIcon,
  ForestIcon,
  InsightIcon,
  MoreIcon,
} from "./NavIcons";

const primaryNavItems = [
  { to: "/", label: "홈", Icon: HomeIcon },
  { to: "/room", label: "나의 방", Icon: RoomIcon },
  { to: "/calendar", label: "캘린더", Icon: CalendarIcon },
  { to: "/forest", label: "매듭 숲", Icon: ForestIcon },
];

const secondaryNavItems = [
  { to: "/relationships", label: "관계 리포트", Icon: RelationshipIcon },
  { to: "/insights", label: "패턴 인사이트", Icon: InsightIcon },
];

const navItems = [...primaryNavItems, ...secondaryNavItems];
const secondaryPaths = new Set(secondaryNavItems.map((i) => i.to));

export const Sidebar = () => {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (to) => location.pathname === to;

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <img src="/logo.svg" alt="" className={styles.logo} />
          <span className={styles.brandName}>Unbind</span>
        </div>
        {navItems.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            className={`${styles.navItem} ${
              secondaryPaths.has(to) ? styles.secondaryItem : ""
            } ${isActive(to) ? styles.active : ""}`}
            onClick={() => setMoreOpen(false)}
          >
            <span className={styles.navIcon}>
              <Icon />
            </span>
            <span className={styles.navLabel}>{label}</span>
          </Link>
        ))}
        <button
          type="button"
          className={`${styles.navItem} ${styles.moreTrigger} ${
            moreOpen ? styles.active : ""
          }`}
          onClick={() => setMoreOpen((v) => !v)}
        >
          <span className={styles.navIcon}>
            <MoreIcon />
          </span>
          <span className={styles.navLabel}>더보기</span>
        </button>
      </div>

      <div className={styles.bottom}>
        <div className={styles.divider} />
        <Link
          to="/mypage"
          className={`${styles.accountLink} ${
            isActive("/mypage") ? styles.active : ""
          }`}
        >
          마이페이지
        </Link>
        <Link
          to="/feedback"
          className={`${styles.accountLink} ${
            isActive("/feedback") ? styles.active : ""
          }`}
        >
          피드백
        </Link>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          로그아웃
        </button>
      </div>

      {moreOpen && (
        <>
          <div
            className={styles.moreBackdrop}
            onClick={() => setMoreOpen(false)}
          />
          <div className={styles.moreSheet}>
            {secondaryNavItems.map(({ to, label, Icon }) => (
              <Link
                key={to}
                to={to}
                className={styles.moreItem}
                onClick={() => setMoreOpen(false)}
              >
                <span className={styles.navIcon}>
                  <Icon />
                </span>
                {label}
              </Link>
            ))}
            <div className={styles.moreDivider} />
            <Link
              to="/mypage"
              className={styles.moreItem}
              onClick={() => setMoreOpen(false)}
            >
              마이페이지
            </Link>
            <Link
              to="/feedback"
              className={styles.moreItem}
              onClick={() => setMoreOpen(false)}
            >
              피드백
            </Link>
            <button className={styles.moreItemBtn} onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        </>
      )}
    </nav>
  );
};
