// Btn.jsx — botones base
import Icon from './Icon';

export default function Btn({
  children,
  onClick,
  variant = 'default',   // default | ghost | danger | dangerGhost | primary
  size = 'md',           // sm | md | lg
  icon,
  full = false,
  type = 'button',
  disabled = false,
  style,
}) {
  const sizes = {
    sm: { h: 36, px: 12, fs: 13 },
    md: { h: 44, px: 16, fs: 14 },
    lg: { h: 52, px: 20, fs: 15 },
  }[size];

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: sizes.h,
    padding: `0 ${sizes.px}px`,
    fontSize: sizes.fs,
    fontWeight: 600,
    borderRadius: 12,
    width: full ? '100%' : 'auto',
    letterSpacing: 0.2,
    border: '1px solid transparent',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 140ms ease',
  };

  const variants = {
    default: {
      background: 'var(--bg-3)',
      color: 'var(--fg)',
      borderColor: 'var(--border-2)',
    },
    primary: {
      background: 'var(--accent)',
      color: 'var(--accent-fg)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--fg-2)',
      borderColor: 'var(--border)',
    },
    danger: {
      background: 'var(--danger)',
      color: '#fff',
    },
    dangerGhost: {
      background: 'var(--danger-soft)',
      color: 'var(--danger)',
      borderColor: 'transparent',
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
}
