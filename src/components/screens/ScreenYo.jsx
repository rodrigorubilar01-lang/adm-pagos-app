// ScreenYo.jsx — configuración de usuario
import { useAuth } from '../../hooks/useAuth';
import TopBar from '../ui/TopBar';
import Card from '../ui/Card';
import Btn from '../ui/Btn';
import Icon from '../ui/Icon';

export default function ScreenYo({ diaCorte, showToast }) {
  const { user, config, logout, changePassword } = useAuth();

  async function handleChangePassword() {
    const nueva = window.prompt('Nueva contraseña (mínimo 6 caracteres):');
    if (!nueva) return;
    try {
      await changePassword(nueva);
      window.alert('Contraseña actualizada correctamente.');
    } catch (err) {
      window.alert('Error: ' + err.message);
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
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              {(config?.nombre || user?.email || '?').charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>
                {config?.nombre || 'Usuario'}
              </div>
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
            <Btn variant="ghost" size="lg" full onClick={handleChangePassword}>
              Cambiar contraseña
            </Btn>
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
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        color: 'var(--fg)',
        textAlign: 'left',
      }}
    >
      <Icon name={icon} size={18} color="var(--fg-2)" />
      <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>{value}</div>
      <Icon name="chevronRight" size={16} color="var(--fg-3)" />
    </button>
  );
}
