import { Link, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";
import {
  HomeIcon,
  RoomIcon,
  CalendarIcon,
  ForestIcon,
  MyIcon,
} from "./NavIcons";

const navItems = [
  { to: "/", label: "홈", Icon: HomeIcon },
  { to: "/room", label: "나의 방", Icon: RoomIcon },
  { to: "/calendar", label: "캘린더", Icon: CalendarIcon },
  { to: "/forest", label: "매듭 숲", Icon: ForestIcon },
  { to: "/mypage", label: "마이페이지", Icon: MyIcon },
];

export const Sidebar = () => {
  const location = useLocation();

  const isActive = (to) => location.pathname === to;

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
            className={`${styles.navItem} ${isActive(to) ? styles.active : ""}`}
          >
            <span className={styles.navIcon}>
              <Icon />
            </span>
            <span className={styles.navLabel}>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};
