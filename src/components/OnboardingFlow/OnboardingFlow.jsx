import React, { useState } from 'react';
import { completarOnboarding } from '../../firebase/users';

const PASOS = [
  {
    icono: '👋',
    titulo: '¡Bienvenido!',
    contenido: (
      <p style={{ color: 'var(--color-text-2)', fontSize: '15px', lineHeight: 1.7, margin: 0 }}>
        Gym Fantasy convierte tu rutina de gym en una competición con tus amigos.
        Registra tus entrenos, acumula puntos y sube el leaderboard de tu liga.
      </p>
    ),
  },
  {
    icono: '⚡',
    titulo: 'Así ganas puntos',
    contenido: (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {[
          { pts: '10', label: 'Asistencia', sub: 'por cada sesión' },
          { pts: '25', label: 'Récord personal', sub: 'al superar un PR' },
          { pts: '+50', label: 'Racha 30 días', sub: 'streak máximo' },
          { pts: '-5', label: 'Regresión', sub: 'si bajas <90% volumen', danger: true },
        ].map(({ pts, label, sub, danger }) => (
          <div
            key={label}
            style={{
              background: 'var(--color-surface-2)',
              borderRadius: '12px',
              padding: '14px',
              textAlign: 'center',
            }}
          >
            <p style={{
              margin: '0 0 4px',
              fontFamily: 'Manrope, sans-serif',
              fontSize: '26px',
              fontWeight: 900,
              color: danger ? 'var(--color-danger-text)' : 'var(--color-text)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {pts}<span style={{ fontSize: '13px' }}>pts</span>
            </p>
            <p style={{ margin: '0 0 2px', fontSize: '12px', fontWeight: 700, color: 'var(--color-text)' }}>{label}</p>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-text-muted)' }}>{sub}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    icono: '🏆',
    titulo: 'Empieza a competir',
    contenido: (
      <p style={{ color: 'var(--color-text-2)', fontSize: '15px', lineHeight: 1.7, margin: 0 }}>
        Ve a <strong style={{ color: 'var(--color-text)' }}>Ligas</strong> para crear tu primera liga o unirte a una con el código de invitación de un amigo.
        Cada vez que entrenes, tus puntos subirán en el ranking automáticamente.
      </p>
    ),
  },
];

export default function OnboardingFlow({ user, onCompletar }) {
  const [paso, setPaso] = useState(0);
  const [completando, setCompletando] = useState(false);

  const esUltimo = paso === PASOS.length - 1;

  const handleSiguiente = async () => {
    if (esUltimo) {
      setCompletando(true);
      await completarOnboarding(user.uid);
      onCompletar();
    } else {
      setPaso((p) => p + 1);
    }
  };

  const { icono, titulo, contenido } = PASOS[paso];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 500,
      padding: '24px',
    }}>
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: '20px',
        padding: '36px 32px 28px',
        width: '100%',
        maxWidth: '420px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
      }}>
        {/* Indicador de pasos */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {PASOS.map((_, i) => (
            <div
              key={i}
              style={{
                height: '3px',
                flex: 1,
                borderRadius: '99px',
                background: i <= paso ? 'var(--color-text)' : 'var(--color-border)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        {/* Contenido */}
        <div>
          <p style={{ fontSize: '32px', margin: '0 0 12px' }}>{icono}</p>
          <h2 style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '22px',
            fontWeight: 900,
            color: 'var(--color-text)',
            margin: '0 0 16px',
            letterSpacing: '-0.5px',
          }}>
            {titulo}
          </h2>
          {contenido}
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          {paso > 0 && (
            <button
              onClick={() => setPaso((p) => p - 1)}
              style={{
                flex: 1,
                padding: '13px',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                background: 'transparent',
                color: 'var(--color-text)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Atrás
            </button>
          )}
          <button
            onClick={handleSiguiente}
            disabled={completando}
            style={{
              flex: 2,
              padding: '13px',
              border: 'none',
              borderRadius: '10px',
              background: 'var(--color-accent)',
              color: 'var(--color-accent-fg)',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '1px',
              opacity: completando ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {completando ? 'Guardando...' : esUltimo ? 'EMPEZAR' : 'SIGUIENTE'}
          </button>
        </div>
      </div>
    </div>
  );
}
