// Card.jsx — contenedor base con fondo bg-2
export default function Card({ children, style, className = '', onClick, padding = 16 }) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 160ms ease',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
