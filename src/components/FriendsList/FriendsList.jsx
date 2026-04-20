import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  buscarUsuarios, enviarSolicitud, obtenerAmigos,
  obtenerSolicitudesPendientes, aceptarSolicitud, rechazarSolicitud, eliminarAmigo,
} from '../../firebase/friends';

function Avatar({ name, size = 36 }) {
  return (
    <img
      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=111&color=fff&size=${size * 2}`}
      alt={name}
      className="friend-avatar"
      style={{ width: size, height: size }}
    />
  );
}

export default function FriendsList({ user, userData, onVerPerfil }) {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [amigos, setAmigos] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [enviadas, setEnviadas] = useState(new Set());
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState('');

  const cargarAmigos = useCallback(async () => {
    const [a, s] = await Promise.all([
      obtenerAmigos(user.uid),
      obtenerSolicitudesPendientes(user.uid),
    ]);
    setAmigos(a);
    setSolicitudes(s);
  }, [user.uid]);

  useEffect(() => { cargarAmigos(); }, [cargarAmigos]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!busqueda.trim()) { setResultados([]); return; }
      setBuscando(true);
      try {
        const res = await buscarUsuarios(busqueda, user.uid);
        setResultados(res);
      } finally {
        setBuscando(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [busqueda, user.uid]);

  const handleEnviar = async (toUid) => {
    setError('');
    try {
      await enviarSolicitud(user.uid, userData?.displayName || user.displayName, toUid);
      setEnviadas((prev) => new Set(prev).add(toUid));
      toast.success('Solicitud de amistad enviada');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleAceptar = async (id) => {
    await aceptarSolicitud(id);
    await cargarAmigos();
    toast.success('Solicitud aceptada');
  };

  const handleRechazar = async (id) => {
    await rechazarSolicitud(id);
    setSolicitudes((prev) => prev.filter((s) => s.id !== id));
    toast('Solicitud rechazada');
  };

  const handleEliminar = async (id) => {
    await eliminarAmigo(id);
    setAmigos((prev) => prev.filter((a) => a.id !== id));
    toast('Amigo eliminado');
  };

  const amigoUids = new Set(amigos.map((a) => a.friendUid));
  const solicitudUids = new Set(solicitudes.map((s) => s.requesterId));

  return (
    <div className="workout-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 className="card-title" style={{ margin: 0 }}>Amigos</h3>

      {/* Buscador */}
      <div>
        <label className="label">BUSCAR USUARIO</label>
        <input
          className="input"
          placeholder="Nombre de usuario..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        {error && <p className="auth-error" style={{ marginTop: 6 }}>{error}</p>}

        {busqueda.trim() && (
          <div className="friends-search-results">
            {buscando && <p className="friends-empty">Buscando...</p>}
            {!buscando && resultados.length === 0 && (
              <p className="friends-empty">Sin resultados.</p>
            )}
            {resultados.map((u) => {
              const esAmigo = amigoUids.has(u.uid);
              const enviada = enviadas.has(u.uid);
              const pendiente = solicitudUids.has(u.uid);
              return (
                <div key={u.uid} className="friend-item">
                  <Avatar name={u.displayName} />
                  <span className="friend-name">{u.displayName}</span>
                  {esAmigo ? (
                    <span className="friend-tag">Amigo</span>
                  ) : pendiente ? (
                    <span className="friend-tag">Te envió solicitud</span>
                  ) : enviada ? (
                    <span className="friend-tag">Enviada</span>
                  ) : (
                    <button className="btn-add-friend" onClick={() => handleEnviar(u.uid)}>
                      + Añadir
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Solicitudes pendientes */}
      {solicitudes.length > 0 && (
        <div>
          <label className="label">SOLICITUDES ({solicitudes.length})</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {solicitudes.map((s) => (
              <div key={s.id} className="friend-item">
                <Avatar name={s.requesterName} />
                <span className="friend-name">{s.requesterName}</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn-accept" onClick={() => handleAceptar(s.id)}>✓</button>
                  <button className="btn-reject" onClick={() => handleRechazar(s.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de amigos */}
      <div>
        <label className="label">MIS AMIGOS ({amigos.length})</label>
        {amigos.length === 0 ? (
          <p className="friends-empty">Aún no tienes amigos añadidos.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {amigos.map((a) => (
              <div key={a.id} className="friend-item">
                <Avatar name={a.friendName} />
                <span
                  className="friend-name friend-name-link"
                  onClick={() => onVerPerfil && onVerPerfil(a.friendUid, a.friendName)}
                >
                  {a.friendName}
                </span>
                <button className="btn-remove-friend" onClick={() => handleEliminar(a.id)} title="Eliminar amigo">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
