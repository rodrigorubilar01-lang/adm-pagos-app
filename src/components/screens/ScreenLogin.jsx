// ScreenLogin.jsx — formulario email/password
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Btn from '../ui/Btn';

export default function ScreenLogin() {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app" data-theme="dark" data-accent="green">
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 28,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 4,
              color: 'var(--accent)',
              marginBottom: 6,
            }}
          >
            ADM · PAGOS
          </div>
          <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>
            Control de gastos personales
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="tu@correo.cl"
            autoFocus
          />
          <Field
            label="Contraseña"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
          />

          {error && (
            <div
              style={{
                color: 'var(--danger)',
                fontSize: 13,
                padding: '10px 12px',
                background: 'var(--danger-soft)',
                borderRadius: 10,
              }}
            >
              {error}
            </div>
          )}

          <Btn
            type="submit"
            variant="primary"
            size="lg"
            full
            disabled={loading || !email || !password}
            style={{ marginTop: 8 }}
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </Btn>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: 'var(--fg-4)' }}>
          Accede con la cuenta que te invitaron
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder, autoFocus }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: 0.4 }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete={type === 'password' ? 'current-password' : 'email'}
        style={{
          height: 52,
          padding: '0 16px',
          background: 'var(--bg-2)',
          border: '1px solid var(--border-2)',
          borderRadius: 12,
          fontSize: 15,
          color: 'var(--fg)',
        }}
      />
    </label>
  );
}
