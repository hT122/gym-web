import React, { useState, useEffect } from 'react';
import { crearLiga, unirseALiga, obtenerMisLigas, obtenerLeaderboard } from '../firebase/leagues';
import LigaList from '../components/LigaList/LigaList';
import LeaderboardView from '../components/LeaderboardView/LeaderboardView';

export default function LigasPage({ user, userData }) {
  const [misLigas, setMisLigas] = useState([]);
  const [cargandoLigas, setCargandoLigas] = useState(true);
  const [ligaActiva, setLigaActiva] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [periodoLeaderboard, setPeriodoLeaderboard] = useState('semana');
  const [cargandoLeaderboard, setCargandoLeaderboard] = useState(false);
  const [ligaError, setLigaError] = useState('');

  useEffect(() => {
    if (user) {
      obtenerMisLigas(user.uid)
        .then(setMisLigas)
        .finally(() => setCargandoLigas(false));
    }
  }, [user]);

  useEffect(() => {
    if (!ligaActiva) return;
    setCargandoLeaderboard(true);
    obtenerLeaderboard(ligaActiva.id, periodoLeaderboard)
      .then(setLeaderboard)
      .finally(() => setCargandoLeaderboard(false));
  }, [ligaActiva, periodoLeaderboard]);

  const handleCrearLiga = async (nombre) => {
    setLigaError('');
    try {
      const liga = await crearLiga(user.uid, user.displayName || userData?.displayName, nombre);
      setMisLigas((prev) => [...prev, liga]);
    } catch (err) {
      setLigaError(err.message);
    }
  };

  const handleUnirseALiga = async (codigo) => {
    setLigaError('');
    try {
      const liga = await unirseALiga(user.uid, user.displayName || userData?.displayName, codigo);
      setMisLigas((prev) => [...prev, liga]);
    } catch (err) {
      setLigaError(err.message);
    }
  };

  return (
    <div className="content ligas-content">
      {ligaActiva ? (
        <LeaderboardView
          liga={ligaActiva}
          leaderboard={leaderboard}
          periodoLeaderboard={periodoLeaderboard}
          setPeriodoLeaderboard={setPeriodoLeaderboard}
          cargandoLeaderboard={cargandoLeaderboard}
          userId={user.uid}
          onVolver={() => setLigaActiva(null)}
        />
      ) : (
        <LigaList
          misLigas={misLigas}
          cargando={cargandoLigas}
          onSelectLiga={setLigaActiva}
          onCrearLiga={handleCrearLiga}
          onUnirseALiga={handleUnirseALiga}
          ligaError={ligaError}
        />
      )}
    </div>
  );
}
