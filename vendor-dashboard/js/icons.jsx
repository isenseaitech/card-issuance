// ---------------------------------------------------------------------------
// Inline SVG icons (no external icon library — avoids UMD/ESM React conflicts)
// ---------------------------------------------------------------------------
function makeIcon(children) {
  return function Icon({ size = 16, className = '' }) {
    return (
      <svg
        width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}
      >
        {children}
      </svg>
    );
  };
}

const ICONS = {
  Download: makeIcon(<><path d="M12 3v12" /><path d="m7 11 5 5 5-5" /><path d="M5 21h14" /></>),
  RotateCcw: makeIcon(<><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></>),
  Calendar: makeIcon(<><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></>),
  Inbox: makeIcon(<><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></>),
  Printer: makeIcon(<><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></>),
  PackageCheck: makeIcon(<><path d="m16 16 2 2 4-4" /><path d="M21 10V7l-9-4-9 4v10l9 4 2-1" /><path d="M3.29 7 12 12l8.71-5" /><path d="M12 22V12" /></>),
  AlertTriangle: makeIcon(<><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>),
  ListChecks: makeIcon(<><path d="m3 17 2 2 4-4" /><path d="m3 7 2 2 4-4" /><path d="M13 6h8" /><path d="M13 12h8" /><path d="M13 18h8" /></>),
  ChevronDown: makeIcon(<path d="m6 9 6 6 6-6" />),
  ShieldCheck: makeIcon(<><path d="M20 13c0 5-3.5 7.5-7.35 8.95a1 1 0 0 1-.6.05C8.5 20.5 5 18 5 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C15.51 3.81 18 5 20 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></>),
  X: makeIcon(<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>),
  AlertOctagon: makeIcon(<><path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86Z" /><path d="M12 8v4" /><path d="M12 16h.01" /></>),
  Filter: makeIcon(<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z" />),
  Send: makeIcon(<><path d="M22 2 11 13" /><path d="M22 2 15 22 11 13 2 9 22 2Z" /></>),
  MessageSquare: makeIcon(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />),
};
