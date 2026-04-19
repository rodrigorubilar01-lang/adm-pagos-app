// Sheet.jsx — contenedor base para bottom sheets
import Icon from './Icon';

export default function Sheet({ title, onClose, children, footer, maxHeight = '88dvh' }) {
  return (
    <div
      onClick={onClose}
      className="fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="slide-up"
        style={{
          width: '100%',
          maxWidth: 430,
          background: 'var(--bg)',
          borderRadius: '20px 20px 0 0',
          maxHeight,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          borderBottom: 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px 12px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: 'var(--bg-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="close" size={16} color="var(--fg-2)" />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>{children}</div>
        {footer && (
          <div
            style={{
              borderTop: '1px solid var(--border)',
              padding: 16,
              paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))',
              background: 'var(--bg)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
