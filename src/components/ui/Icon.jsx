// Icon.jsx — SVG icons stroke style
const PATHS = {
  home:       <path d="M3 12 12 4l9 8M5 10v10h14V10" />,
  list:       <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  bars:       <><path d="M4 20V10M10 20V4M16 20v-7M22 20v-12" /></>,
  user:       <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" /></>,
  mic:        <><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
  plus:       <><path d="M12 4v16M4 12h16" /></>,
  search:     <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>,
  close:      <><path d="M6 6l12 12M18 6L6 18" /></>,
  chevronRight: <path d="M9 6l6 6-6 6" />,
  chevronDown:  <path d="M6 9l6 6 6-6" />,
  chevronUp:    <path d="M6 15l6-6 6 6" />,
  check:      <path d="M4 12l5 5L20 6" />,
  edit:       <path d="M4 20h4l11-11-4-4L4 16v4zM13 6l4 4" />,
  trash:      <><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></>,
  calendar:   <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></>,
  card:       <><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/></>,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft:  <path d="M19 12H5M11 6l-6 6 6 6" />,
  logout:     <><path d="M16 17l5-5-5-5M21 12H9M13 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8" /></>,
  settings:   <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.5-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.5a7 7 0 0 0-2 1.2l-2.3-.9-2 3.5 2 1.5A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.5 2 3.5 2.3-.9a7 7 0 0 0 2 1.2L10 21h4l.6-2.5a7 7 0 0 0 2-1.2l2.3.9 2-3.5-2-1.5c.1-.4.1-.8.1-1.2z" /></>,
  filter:     <path d="M4 5h16l-6 8v6l-4-2v-4L4 5z" />,
  info:       <><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></>,
  tag:        <><path d="M20 12L12 20 4 12V4h8z"/><circle cx="8" cy="8" r="1.5"/></>,
  wallet:     <><path d="M3 7h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12v4"/><circle cx="17" cy="13" r="1.5"/></>,
  layers:     <><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5M3 18l9 5 9-5"/></>,
};

export default function Icon({ name, size = 20, stroke = 1.8, color = 'currentColor', style }) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', flexShrink: 0, ...style }}
    >
      {d}
    </svg>
  );
}
