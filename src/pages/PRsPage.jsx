import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { obtenerPRsDetallados } from '../firebase/users';

export default function PRsPage({ user }) {
  const [prs, setPrs] = useState({});
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => {
    obtenerPRsDetallados(user.uid).then((data) => {
      setPrs(data);
      setCargando(false);
    });
  }, [user.uid]);

  const lista = Object.entries(prs)
    .filter(([nombre]) => nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => a[0].localeCompare(b[0]));

  const ejercicioActivo = seleccionado ? prs[seleccionado] : null;

  return (
    <div className="prs-layout">
      <div className="prs-list-panel">
        <input
          className="input"
          placeholder="Buscar ejercicio..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ marginBottom: '16px' }}
        />

        {cargando && <p className="prs-empty">Cargando récords...</p>}
        {!cargando && lista.length === 0 && (
          <p className="prs-empty">Sin entrenamientos registrados aún.</p>
        )}

        {lista.map(([nombre, data]) => (
          <div
            key={nombre}
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
                <span className="pr-stat-value">{Math.round(data.maxVolumen)} kg</span>
                <span className="pr-stat-label">Mejor volumen</span>
              </div>
              <div className="pr-stat">
                <span className="pr-stat-value">{data.historial.length}</span>
                <span className="pr-stat-label">Sesiones</span>
              </div>
            </div>
            {data.fechaMaxPeso && (
              <p className="pr-card-date">PR el {data.fechaMaxPeso}</p>
            )}
          </div>
        ))}
      </div>

      <div className="prs-chart-panel">
        {!ejercicioActivo ? (
          <div className="prs-chart-empty">
            <p className="prs-chart-empty-icon">📈</p>
            <p className="prs-chart-empty-text">Selecciona un ejercicio para ver su progreso</p>
          </div>
        ) : (
          <div className="workout-card" style={{ height: '100%' }}>
            <h3 className="card-title">{seleccionado}</h3>

            <p className="prs-chart-section-label">Peso máximo por sesión (kg)</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={ejercicioActivo.historial} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#aaa' }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: '#aaa' }} unit=" kg" />
                <Tooltip
                  formatter={(v) => [`${v} kg`, 'Peso']}
                  labelFormatter={(l) => `Sesión: ${l}`}
                  contentStyle={{ borderRadius: '10px', border: '1px solid #e8e8e8', fontSize: '13px' }}
                />
                <Line type="monotone" dataKey="maxPeso" stroke="#111" strokeWidth={2.5} dot={{ r: 4, fill: '#111' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>

            <p className="prs-chart-section-label" style={{ marginTop: '24px' }}>Volumen por sesión (kg·reps)</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={ejercicioActivo.historial} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#aaa' }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: '#aaa' }} />
                <Tooltip
                  formatter={(v) => [`${Math.round(v)} kg·reps`, 'Volumen']}
                  labelFormatter={(l) => `Sesión: ${l}`}
                  contentStyle={{ borderRadius: '10px', border: '1px solid #e8e8e8', fontSize: '13px' }}
                />
                <Line type="monotone" dataKey="volumen" stroke="#555" strokeWidth={2.5} dot={{ r: 4, fill: '#555' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
