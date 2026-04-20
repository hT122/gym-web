import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { subscribeToConteoSeguimiento, seguir, dejarDeSeguir, estasSiguiendo } from '../firebase/follows';
import UserStats from '../components/UserStats/UserStats';
import WeeklyChart from '../components/WeeklyChart/WeeklyChart';
import FriendsList from '../components/FriendsList/FriendsList';

function usePerfil(uid) {
  const [historial, setHistorial] = useState([]);
  const [userData, setUserData] = useState(null);
  const [seguimiento, setSeguimiento] = useState({ siguiendo: 0, seguidores: 0 });

  useEffect(() => {
    if (!uid) return;
    setHistorial([]);
    setUserData(null);
    setSeguimiento({ siguiendo: 0, seguidores: 0 });

    const cargarHistorial = async () => {
      const [snap, userSnap] = await Promise.all([
        getDocs(query(collection(db, 'entrenamientos'), where('userId', '==', uid))),
        getDoc(doc(db, 'users', uid)),
      ]);
      setHistorial(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      if (userSnap.exists()) setUserData(userSnap.data());
    };
    cargarHistorial();

    const unsub = subscribeToConteoSeguimiento(uid, setSeguimiento);
    return () => unsub();
  }, [uid]);

  return { historial, userData, seguimiento };
}

export default function PerfilPage({ user, userData: myUserData }) {
  const [amigoViendo, setAmigoViendo] = useState(null);
  const [yoSigo, setYoSigo] = useState(false);
  const [cargandoFollow, setCargandoFollow] = useState(false);

  const { historial: miHistorial, seguimiento: miSeguimiento } = usePerfil(user.uid);
  const { historial: amigoHistorial, userData: amigoData, seguimiento: amigoSeguimiento } = usePerfil(amigoViendo?.uid);

  useEffect(() => {
    if (!amigoViendo) return;
    estasSiguiendo(user.uid, amigoViendo.uid).then(setYoSigo);
  }, [amigoViendo, user.uid]);

  const handleToggleFollow = async () => {
    if (cargandoFollow) return;
    setCargandoFollow(true);
    try {
      if (yoSigo) {
        await dejarDeSeguir(user.uid, amigoViendo.uid);
        setYoSigo(false);
      } else {
        await seguir(user.uid, amigoViendo.uid);
        setYoSigo(true);
      }
    } finally {
      setCargandoFollow(false);
    }
  };

  const viendo = amigoViendo
    ? {
        user: { uid: amigoViendo.uid, displayName: amigoViendo.nombre, email: '' },
        userData: amigoData,
        historial: amigoHistorial,
        seguimiento: amigoSeguimiento,
      }
    : {
        user,
        userData: myUserData,
        historial: miHistorial,
        seguimiento: miSeguimiento,
      };

  return (
    <div className="perfil-layout">
      <div className="perfil-main">
        {amigoViendo && (
          <div className="perfil-amigo-topbar">
            <button className="back-btn" onClick={() => setAmigoViendo(null)}>
              ← Volver a mi perfil
            </button>
            <button
              className={`follow-btn ${yoSigo ? 'follow-btn--siguiendo' : ''}`}
              onClick={handleToggleFollow}
              disabled={cargandoFollow}
            >
              {yoSigo ? 'Siguiendo' : 'Seguir'}
            </button>
          </div>
        )}
        <UserStats
          user={viendo.user}
          userData={viendo.userData}
          workoutsCount={viendo.historial.length}
          siguiendo={viendo.seguimiento.siguiendo}
          seguidores={viendo.seguimiento.seguidores}
        />
        <WeeklyChart historial={viendo.historial} />
      </div>

      <div className="perfil-sidebar">
        <FriendsList
          user={user}
          userData={myUserData}
          onVerPerfil={(uid, nombre) => setAmigoViendo({ uid, nombre })}
        />
      </div>
    </div>
  );
}
