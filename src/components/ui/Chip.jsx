// Chip.jsx — filter pills
export default function Chip({ children, active, onClick, tone = 'neutral', style }) {
  const tones = {
    neutral:  { fg: 'var(--fg-2)', bg: 'var(--bg-2)',  border: 'var(--border)' },
    personal: { fg: 'var(--cat-personal)', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.25)' },
    negocio:  { fg: 'var(--cat-negocio)',  bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.25)' },
    ahorro:   { fg: 'var(--cat-ahorro)',   bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)' },
  }[tone] || { fg: 'var(--fg-2)', bg: 'var(--bg-2)', border: 'var(--border)' };

  const activeStyle = active ? {
    background: 'var(--fg)',
    color: 'var(--bg)',
    borderColor: 'var(--fg)',
  } : {
    background: tones.bg,
    color: tones.fg,
    borderColor: tones.border,
  };

  return (
    <button
      onClick={onClick}
      style={{
        height: 32,
        padding: '0 14px',
        borderRadius: 999,
        border: '1px solid',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        transition: 'all 140ms ease',
        ...activeStyle,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
