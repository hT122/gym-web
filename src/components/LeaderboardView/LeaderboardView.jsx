import React from 'react';

export default function LeaderboardView({
  liga,
  leaderboard,
  periodoLeaderboard,
  setPeriodoLeaderboard,
  cargandoLeaderboard,
  userId,
  onVolver,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <button className="back-btn" onClick={onVolver}>← Volver</button>
        <h2 className="leaderboard-title">{liga.nombre}</h2>
        <span className="codigo-badge">#{liga.codigoInvitacion}</span>
        <button
          className="copy-btn"
          onClick={() => navigator.clipboard.writeText(liga.codigoInvitacion)}
          title="Copiar código"
        >
          📋
        </button>
      </div>

      <div className="periodo-toggle">
        <button
          className={`periodo-btn ${periodoLeaderboard === 'semana' ? 'active' : ''}`}
          onClick={() => setPeriodoLeaderboard('semana')}
        >
          Semanal
        </button>
        <button
          className={`periodo-btn ${periodoLeaderboard === 'mes' ? 'active' : ''}`}
          onClick={() => setPeriodoLeaderboard('mes')}
        >
          Mensual
        </button>
      </div>

      {cargandoLeaderboard ? (
        <p className="empty-state">Cargando ranking...</p>
      ) : (
        <div className="workout-card" style={{ padding: '0', overflow: 'hidden' }}>
          {leaderboard.map((entry, i) => (
            <div
              key={entry.memberId}
              className={`leaderboard-row ${entry.userId === userId ? 'leaderboard-self' : ''}`}
            >
              <span className="leaderboard-pos">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
              </span>
              <span className="leaderboard-name">{entry.userName}</span>
              <span className="leaderboard-pts">{entry.puntosEnPeriodo} pts</span>
            </div>
          ))}
          {leaderboard.length === 0 && (
            <p className="empty-state" style={{ padding: '24px' }}>
              Nadie ha entrenado en este periodo todavía.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
