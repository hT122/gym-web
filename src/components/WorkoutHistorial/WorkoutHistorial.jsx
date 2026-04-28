import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ModalConfirmar from '../ModalConfirmar/ModalConfirmar';

function useIsDark() {
  return document.documentElement.classList.contains('dark');
}

function PRs({ prs }) {
  const [seleccionado, setSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const isDark = useIsDark();

  const lista = Object.entries(prs)
    .filter(([nombre]) => nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => a[0].localeCompare(b[0]));

  if (lista.length === 0 && !busqueda) {
    return <p className="empty-state">Completa entrenamientos para ver tus récords.</p>;
  }

  const gridColor     = isDark ? '#262626' : '#f0f0f0';
  const tickColor     = isDark ? '#777'    : '#aaa';
  const lineColor     = isDark ? '#f0f0f0' : '#111';
  const tooltipBg     = isDark ? '#1c1c1c' : '#fff';
  const tooltipBorder = isDark ? '#333'    : '#e8e8e8';
  const tooltipColor  = isDark ? '#f0f0f0' : '#111';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <input
        className="input"
        placeholder="Buscar ejercicio..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ marginBottom: '4px' }}
      />
      {lista.length === 0 && <p className="empty-state">Sin resultados.</p>}
      {lista.map(([nombre, data]) => (
        <div key={nombre}>
          <div
            className={`pr-card ${seleccionado === nombre ? 'pr-card--active' : ''}`}
            onClick={() => setSeleccionado(seleccionado === nombre ? null : nombre)}
          >
            <p className="pr-card-name">{nombre}</p>
            <div className="pr-card-stats">
              <div className="pr-stat">
                <span className="pr-stat-value">{data.maxPeso} kg</span>
                <span className="pr-stat-label">Mejor peso</span>
              </div>
              <div className="pr-stat">
                <span className="pr-stat-value">{Math.round(data.maxVolumen)}</span>
                <span className="pr-stat-label">Vol. máx</span>
              </div>
              <div className="pr-stat">
                <span className="pr-stat-value">{data.historial.length}</span>
                <span className="pr-stat-label">Sesiones</span>
              </div>
            </div>
            {data.fechaMaxPeso && <p className="pr-card-date">PR el {data.fechaMaxPeso}</p>}
          </div>
          {seleccionado === nombre && data.historial.length > 1 && (
            <div className="pr-mini-chart">
              <p className="prs-chart-section-label">Peso máximo por sesión</p>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={data.historial} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: tickColor, fontFamily: "'Plus Jakarta Sans', sans-serif" }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: tickColor, fontFamily: "'Plus Jakarta Sans', sans-serif" }} unit="kg" />
                  <Tooltip
                    formatter={(v) => [`${v} kg`, 'Peso']}
                    contentStyle={{ borderRadius: '10px', border: `1px solid ${tooltipBorder}`, fontSize: '12px', background: tooltipBg, color: tooltipColor }}
                  />
                  <Line type="monotone" dataKey="maxPeso" stroke={lineColor} strokeWidth={2} dot={{ r: 3, fill: lineColor }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function WorkoutHistorial({
  historial, prs, onEditar, onEliminar,
  cargando, hayMas, cargandoMas, onCargarMas,
}) {
  const [tab, setTab] = useState('historial');
  const [pendienteEliminarId, setPendienteEliminarId] = useState(null);

  return (
    <div className="historial-panel">
      {pendienteEliminarId && (
        <ModalConfirmar
          titulo="Eliminar entrenamiento"
          mensaje="Esta acción eliminará el entrenamiento y recalculará tus puntos y racha. No se puede deshacer."
          textoConfirmar="Eliminar"
          onConfirmar={() => { onEliminar(pendienteEliminarId); setPendienteEliminarId(null); }}
          onCancelar={() => setPendienteEliminarId(null)}
        />
      )}
      <div className="historial-tabs">
        <button
          className={`historial-tab ${tab === 'historial' ? 'historial-tab--active' : ''}`}
          onClick={() => setTab('historial')}
        >
          Historial
        </button>
        <button
          className={`historial-tab ${tab === 'records' ? 'historial-tab--active' : ''}`}
          onClick={() => setTab('records')}
        >
          Récords
        </button>
      </div>

      {tab === 'historial' && (
        cargando ? (
          <p className="empty-state">Cargando historial...</p>
        ) : historial.length === 0 ? (
          <p className="empty-state">No tienes entrenamientos guardados aún.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {historial.map((entrenamiento) => (
              <div key={entrenamiento.id} className="historial-item">
                <p className="historial-item-date">
                  {new Date(entrenamiento.fecha).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
                </p>
                <div className="historial-item-actions">
                  <button className="btn-historial-edit" onClick={() => onEditar(entrenamiento)}>Editar</button>
                  <button className="btn-historial-delete" onClick={() => setPendienteEliminarId(entrenamiento.id)}>Eliminar</button>
                </div>
                <hr className="historial-divider" />
                {entrenamiento.ejercicios && entrenamiento.ejercicios.map((ej, idx) => (
                  <div key={idx} className="historial-ej-block">
                    <p className="historial-ej-nombre">{ej.nombre}</p>
                    {ej.series.map((s, i) => (
                      <p key={i} className="historial-serie">
                        Serie {i + 1}: {s.peso} kg × {s.repes} reps
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            ))}
            {hayMas && (
              <button className="btn-secondary" onClick={onCargarMas} disabled={cargandoMas} style={{ width: '100%' }}>
                {cargandoMas ? 'Cargando...' : 'Cargar más'}
              </button>
            )}
          </div>
        )
      )}

      {tab === 'records' && <PRs prs={prs} />}
    </div>
  );
}
