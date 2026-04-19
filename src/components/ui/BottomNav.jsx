// BottomNav.jsx — 4 tabs + botón micrófono central
import Icon from './Icon';

const TABS = [
  { key: 'home', label: 'Inicio',    icon: 'home' },
  { key: 'hist', label: 'Historial', icon: 'list' },
  { key: 'rep',  label: 'Reportes',  icon: 'bars' },
  { key: 'cfg',  label: 'Yo',        icon: 'user' },
];

export default function BottomNav({ current, onNav, onMic }) {
  return (
    <nav
      style={{
        width: '100%',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        zIndex: 50,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          alignItems: 'center',
          height: 64,
        }}
      >
        {TABS.slice(0, 2).map(tab => (
          <TabBtn key={tab.key} tab={tab} active={current === tab.key} onClick={() => onNav(tab.key)} />
        ))}

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onMic}
            aria-label="Registrar gasto por voz"
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--accent)',
              color: 'var(--accent-fg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(34,197,94,0.35)',
              transform: 'translateY(-8px)',
            }}
          >
            <Icon name="mic" size={24} stroke={2.2} />
          </button>
        </div>

        {TABS.slice(2).map(tab => (
          <TabBtn key={tab.key} tab={tab} active={current === tab.key} onClick={() => onNav(tab.key)} />
        ))}
      </div>
    </nav>
  );
}

function TabBtn({ tab, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        height: '100%',
        color: active ? 'var(--fg)' : 'var(--fg-3)',
      }}
    >
      <Icon name={tab.icon} size={22} stroke={active ? 2.2 : 1.8} />
      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.3 }}>{tab.label}</span>
    </button>
  );
}
