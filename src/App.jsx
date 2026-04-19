// App.jsx — Router principal y estado global
import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { getMesActual, getMesSiguiente } from './lib/helpers';

// Screens
import ScreenLogin      from './components/screens/ScreenLogin';
import ScreenDashboard  from './components/screens/ScreenDashboard';
import ScreenHistorial  from './components/screens/ScreenHistorial';
import ScreenReports    from './components/screens/ScreenReports';
import ScreenYo         from './components/screens/ScreenYo';
import ScreenVoice      from './components/screens/ScreenVoice';

// UI
import BottomNav        from './components/ui/BottomNav';
import Toast            from './components/ui/Toast';

// Sheets / Modals
import SheetDetail      from './sheets/SheetDetail';
import SheetNext        from './sheets/SheetNext';
import SheetCorte       from './sheets/SheetCorte';
import SheetMes         from './sheets/SheetMes';
import EditModal        from './sheets/EditModal';
import DeleteModal      from './sheets/DeleteModal';

export default function App() {
  const { user, config, loading } = useAuth();
  const [screen, setScreen]       = useState(() => localStorage.getItem('adm_screen') || 'home');
  const [mesFact, setMesFact]     = useState(getMesActual());
  const [toast, setToast]         = useState(null);

  // Modales / sheets
  const [showVoice,   setShowVoice]   = useState(false);
  const [showMes,     setShowMes]     = useState(false);
  const [showNext,    setShowNext]    = useState(false);
  const [showCorte,   setShowCorte]   = useState(false);
  const [detailGasto, setDetailGasto] = useState(null);
  const [editGasto,   setEditGasto]   = useState(null);
  const [deleteGasto, setDeleteGasto] = useState(null);

  useEffect(() => { localStorage.setItem('adm_screen', screen); }, [screen]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const usuarioKey = user?.email?.includes('rodrigo') ? 'rodrigo' : 'mariaelena';
  const diaCorte   = config?.dia_corte || 22;

  if (loading) return <div className="loading-screen">ADM. PAGOS</div>;
  if (!user)   return <ScreenLogin />;

  const sharedProps = {
    mesFact,
    mesSiguiente: getMesSiguiente(),
    usuario: usuarioKey,
    diaCorte,
    onOpenMes:     () => setShowMes(true),
    onOpenNext:    () => setShowNext(true),
    onEditCorte:   () => setShowCorte(true),
    onOpenExpense: (g) => setDetailGasto(g),
    showToast,
  };

  const renderScreen = () => {
    switch (screen) {
      case 'home': return <ScreenDashboard {...sharedProps} />;
      case 'hist': return <ScreenHistorial {...sharedProps} />;
      case 'rep':  return <ScreenReports  {...sharedProps} />;
      case 'cfg':  return <ScreenYo diaCorte={diaCorte} showToast={showToast} />;
      default:     return <ScreenDashboard {...sharedProps} />;
    }
  };

    return (
    <div
      className="app"
      data-theme="dark"
      data-accent="green"
      style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {renderScreen()}
      </div>

      <BottomNav current={screen} onNav={setScreen} onMic={() => setShowVoice(true)} />

      {showVoice && (
        <ScreenVoice
          usuario={usuarioKey}
          diaCorte={diaCorte}
          mesFact={mesFact}
          onClose={() => setShowVoice(false)}
          onSave={() => { setShowVoice(false); showToast('Gasto guardado'); }}
        />
      )}

      {detailGasto && (
        <SheetDetail
          gasto={detailGasto}
          onClose={() => setDetailGasto(null)}
          onEdit={() => { setEditGasto(detailGasto); setDetailGasto(null); }}
          onDelete={() => { setDeleteGasto(detailGasto); setDetailGasto(null); }}
        />
      )}

      {editGasto && (
        <EditModal
          gasto={editGasto}
          onCancel={() => setEditGasto(null)}
          onConfirm={() => { setEditGasto(null); showToast('Cambios aplicados'); }}
        />
      )}

      {deleteGasto && (
        <DeleteModal
          gasto={deleteGasto}
          onCancel={() => setDeleteGasto(null)}
          onConfirm={() => { setDeleteGasto(null); showToast('Gasto eliminado'); }}
        />
      )}

      {showMes && (
        <SheetMes
          mesActual={mesFact}
          onPick={(m) => { setMesFact(m.label); setShowMes(false); }}
          onClose={() => setShowMes(false)}
        />
      )}

      {showNext && <SheetNext mesSiguiente={getMesSiguiente()} onClose={() => setShowNext(false)} />}

      {showCorte && (
        <SheetCorte
          dia={diaCorte}
          onPick={() => { setShowCorte(false); showToast('Día de corte actualizado'); }}
          onClose={() => setShowCorte(false)}
        />
      )}

      <Toast msg={toast} />
    </div>
  );
