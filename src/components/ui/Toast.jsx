// Toast.jsx — notificación temporal flotante
export default function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div
      className="fade-in"
      style={{
        position: 'fixed',
        bottom: 100,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--fg)',
        color: 'var(--bg)',
        padding: '10px 18px',
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        zIndex: 200,
        maxWidth: '80%',
        textAlign: 'center',
      }}
    >
      {msg}
    </div>
  );
}
