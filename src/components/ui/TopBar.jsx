// TopBar.jsx — barra superior con título, mes clickeable y slot right
import Icon from './Icon';

export default function TopBar({ title, mesFact, onOpenMes, right }) {
  return (
    <header
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        paddingRight: 20,
        paddingBottom: 12,
        paddingLeft: 20,
        background: 'var(--bg)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--fg-3)' }}>
            {title}
          </div>
          {mesFact && (
            <button
              onClick={onOpenMes}
              style={{
                marginTop: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--fg)',
                fontSize: 22,
                fontWeight: 700,
                padding: 0,
              }}
            >
              {mesFact}
              <Icon name="chevronDown" size={18} color="var(--fg-2)" />
            </button>
          )}
        </div>
        <div>{right}</div>
      </div>
    </header>
  );
}
