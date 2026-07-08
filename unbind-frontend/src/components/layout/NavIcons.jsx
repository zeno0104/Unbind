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

export const RelationshipIcon = () => (
  <svg {...base}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M2.8 20v-1.2A4.3 4.3 0 0 1 7.1 14.5h3.8a4.3 4.3 0 0 1 4.3 4.3V20" />
    <path d="M16 8.6a3 3 0 1 0 0-5.6" />
    <path d="M15.5 14.6a4.2 4.2 0 0 1 3.7 4.17V20" />
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

export const MoreIcon = () => (
  <svg {...base}>
    <circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" />
  </svg>
);

export const InsightIcon = () => (
  <svg {...base}>
    <path d="M12 3.5 13.3 8l4.2 1.5-4.2 1.5L12 15.5 10.7 11l-4.2-1.5 4.2-1.5z" />
    <path d="M18.5 15.5 19.3 18l2.2.8-2.2.8-.8 2.4-.8-2.4-2.2-.8 2.2-.8z" />
  </svg>
);
