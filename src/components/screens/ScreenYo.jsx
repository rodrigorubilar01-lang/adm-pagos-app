// ScreenYo.jsx — configuración de usuario
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import TopBar from '../ui/TopBar';
import Card from '../ui/Card';
import Btn from '../ui/Btn';
import Icon from '../ui/Icon';

export default function ScreenYo({ diaCorte, showToast }) {
  const { user, config, logout, changePassword } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [saving, setSaving] = useState(false);
  const [pwdError, setPwdError] = useState('');

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwdError('');
    if (pwd.length < 6) { setPwdError('Mínimo 6 caracteres'); return; }
    if (pwd !== pwd2) { setPwdError('Las contraseñas no coinciden'); return; }
    setSaving(true);
    try {
      await changePassword(pwd);
      setShowPwd(false);
      setPwd(''); setPwd2('');
      showToast?.('Contraseña actualizada');
    } catch (err) {
      setPwdError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-scroll" style={{ paddingBottom: 120 }}>
      <TopBar title="TU CUENTA" />

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'var(--accent-soft)', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 18,
              }}
            >
              {(config?.nombre || user?.email || '?').charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{config?.nombre || 'Usuario'}</div>
              <div style={{ fontSize: 12, color: 'var(--fg-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>
          </div>
        </Card>

        <div>
          <Label>PREFERENCIAS</Label>
          <Card padding={0}>
            <Row
              icon="calendar"
              label="Día de corte TC"
              value={`Día ${diaCorte}`}
              onClick={() => showToast?.('Usa el botón "Día de corte" desde el Dashboard')}
            />
          </Card>
        </div>

        <div>
          <Label>SESIÓN</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {!showPwd ? (
              <Btn variant="ghost" size="lg" full onClick={() => setShowPwd(true)}>
                Cambiar contraseña
              </Btn>
            ) : (
              <form onSubmit={handleChangePassword}
                style={{
                  background: 'var(--bg-2)', border: '1px solid var(--border)',
                  borderRadius: 14, padding: 16,
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg-2)' }}>NUEVA CONTRASEÑA</div>
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={pwd}
                  onChange={e => setPwd(e.target.value)}
                  autoComplete="new-password"
                  style={{ fontSize: 15, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)' }}
                />
                <input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={pwd2}
                  onChange={e => setPwd2(e.target.value)}
                  autoComplete="new-password"
                  style={{ fontSize: 15, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)' }}
                />
                {pwdError && <div style={{ fontSize: 12, color: 'var(--danger)' }}>{pwdError}</div>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn variant="ghost" full onClick={() => { setShowPwd(false); setPwd(''); setPwd2(''); setPwdError(''); }}>
                    Cancelar
                  </Btn>
                  <Btn variant="primary" full type="submit" disabled={saving}>
                    {saving ? 'Guardando…' : 'Guardar'}
                  </Btn>
                </div>
              </form>
            )}

            <Btn variant="dangerGhost" size="lg" full icon="logout" onClick={logout}>
              Cerrar sesión
            </Btn>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--fg-4)', marginTop: 20 }}>
          ADM. PAGOS · v1.0
        </div>
      </div>
    </div>
  );
}

function Label({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--fg-3)', margin: '0 4px 10px' }}>
      {children}
    </div>
  );
}

function Row({ icon, label, value, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', color: 'var(--fg)', textAlign: 'left' }}
    >
      <Icon name={icon} size={18} color="var(--fg-2)" />
      <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>{value}</div>
      <Icon name="chevronRight" size={16} color="var(--fg-3)" />
    </button>
  );
}
