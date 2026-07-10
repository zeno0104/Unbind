const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const HomeIcon = () => (
  <svg {...base}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5.5 10v9a1 1 0 0 0 1 1H9v-6h6v6h2.5a1 1 0 0 0 1-1v-9" />
  </svg>
);

export const RoomIcon = () => (
  <svg {...base}>
    <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11z" />
  </svg>
);

export const CalendarIcon = () => (
  <svg {...base}>
    <rect x="3.5" y="5" width="17" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3.5 10h17" />
  </svg>
);

export const ForestIcon = () => (
  <svg {...base}>
    <path d="M12 2.5 8 9h2.2L6.5 15h3.2L6 21h12l-3.7-6h3.2L13.8 9H16z" />
    <path d="M12 21v-3" />
  </svg>
);

export const BookmarkIcon = ({ filled = false }) => (
  <svg {...base} fill={filled ? "currentColor" : "none"}>
    <path d="M6.5 3.5h11a1 1 0 0 1 1 1V21l-6.5-4-6.5 4V4.5a1 1 0 0 1 1-1z" />
  </svg>
);

export const MyIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 20c1.2-4 4-6 7.5-6s6.3 2 7.5 6" />
  </svg>
);

