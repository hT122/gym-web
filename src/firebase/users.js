import { db } from './config';
import { doc, getDoc, setDoc, updateDoc, deleteField, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';

export const recalcularPuntosTotales = async (userId) => {
  const snap = await getDocs(query(collection(db, 'entrenamientos'), where('userId', '==', userId)));
  const total = snap.docs.reduce((sum, d) => sum + (d.data().puntos || 0), 0);
  await updateDoc(doc(db, 'users', userId), { puntosTotales: total });
  return total;
};

export const recalcularStreakYFecha = async (userId) => {
  const snap = await getDocs(query(collection(db, 'entrenamientos'), where('userId', '==', userId)));

  if (snap.empty) {
    await updateDoc(doc(db, 'users', userId), { streak: 0, ultimoEntrenamiento: null });
    return;
  }

  const fechas = [...new Set(
    snap.docs.map(d => d.data().fecha?.slice(0, 10)).filter(Boolean)
  )].sort((a, b) => b.localeCompare(a));

  const ultimoEntrenamiento = snap.docs
    .map(d => d.data().fecha)
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a))[0];

  let streak = 1;
  for (let i = 0; i < fechas.length - 1; i++) {
    const diff = Math.round(
      (new Date(fechas[i]) - new Date(fechas[i + 1])) / (1000 * 60 * 60 * 24)
    );
    if (diff === 1) streak++;
    else break;
  }

  await updateDoc(doc(db, 'users', userId), { streak, ultimoEntrenamiento });
};

export const bloquearUsuario = async (myUid, targetUid) => {
  await updateDoc(doc(db, 'users', myUid), { [`blockedUsers.${targetUid}`]: true });
};

export const desbloquearUsuario = async (myUid, targetUid) => {
  await updateDoc(doc(db, 'users', myUid), { [`blockedUsers.${targetUid}`]: deleteField() });
};

export const subscribeToUserDoc = (uid, callback) => {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    if (snap.exists()) callback(snap.data());
  });
};

export const inicializarUsuario = async (user, overrideName = null) => {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    const displayName = overrideName || user.displayName || user.email?.split('@')[0] || 'Usuario';
    await setDoc(userRef, {
      displayName,
      email: user.email || '',
      puntosTotales: 0,
      streak: 0,
      ultimoEntrenamiento: null,
      creadoEn: new Date().toISOString(),
    });
  } else {
    const data = snap.data();
    if (data.nivel !== undefined || data.nombreNivel !== undefined) {
      await updateDoc(userRef, { nivel: deleteField(), nombreNivel: deleteField() });
    }
  }
};

export const obtenerUsuario = async (userId) => {
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.exists() ? snap.data() : null;
};

export const actualizarDespuesDeEntrenamiento = async (userId, puntosGanados, fechaEntrenamiento) => {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  const data = snap.data();

  let nuevoStreak = 1;
  if (data.ultimoEntrenamiento) {
    const ultimo = new Date(data.ultimoEntrenamiento);
    const hoy = new Date(fechaEntrenamiento);
    // Compare calendar days only
    const diffMs = new Date(hoy.toDateString()) - new Date(ultimo.toDateString());
    const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDias === 0) nuevoStreak = data.streak;
    else if (diffDias === 1) nuevoStreak = data.streak + 1;
    else nuevoStreak = 1;
  }

  const nuevosPuntos = (data.puntosTotales || 0) + puntosGanados;

  await updateDoc(userRef, {
    puntosTotales: nuevosPuntos,
    streak: nuevoStreak,
    ultimoEntrenamiento: fechaEntrenamiento,
  });

  return { nuevoStreak, nuevosPuntos };
};

// Returns { prs: { ejercicioNombre: { maxPeso, maxVolumen } }, volumenAnterior }
export const obtenerDatosHistoricos = async (userId) => {
  const q = query(collection(db, 'entrenamientos'), where('userId', '==', userId));
  const snap = await getDocs(q);

  const docs = snap.docs
    .map(d => d.data())
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const prs = {};
  docs.forEach(workout => {
    (workout.ejercicios || []).forEach(ej => {
      if (!prs[ej.nombre]) prs[ej.nombre] = { maxPeso: 0, maxVolumen: 0 };
      ej.series.forEach(s => {
        if (s.peso > prs[ej.nombre].maxPeso) prs[ej.nombre].maxPeso = s.peso;
      });
      const vol = ej.series.reduce((sum, s) => sum + s.peso * s.repes, 0);
      if (vol > prs[ej.nombre].maxVolumen) prs[ej.nombre].maxVolumen = vol;
    });
  });

  const volumenAnterior = docs.length > 0 ? (docs[0].volumenTotal || 0) : 0;

  return { prs, volumenAnterior };
};

// Returns detailed PRs with history for progress charts
export const obtenerPRsDetallados = async (userId) => {
  const q = query(collection(db, 'entrenamientos'), where('userId', '==', userId));
  const snap = await getDocs(q);

  const docs = snap.docs
    .map(d => d.data())
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const ejercicios = {};

  docs.forEach(workout => {
    const fechaStr = workout.fecha?.slice(0, 10) || '';
    (workout.ejercicios || []).forEach(ej => {
      if (!ejercicios[ej.nombre]) {
        ejercicios[ej.nombre] = {
          maxPeso: 0, fechaMaxPeso: '',
          maxVolumen: 0, fechaMaxVolumen: '',
          historial: [],
        };
      }
      const entry = ejercicios[ej.nombre];
      const maxPesoSesion = Math.max(...ej.series.map(s => Number(s.peso) || 0));
      const volSesion = ej.series.reduce((sum, s) => sum + (Number(s.peso) || 0) * (Number(s.repes) || 0), 0);

      if (maxPesoSesion > entry.maxPeso) { entry.maxPeso = maxPesoSesion; entry.fechaMaxPeso = fechaStr; }
      if (volSesion > entry.maxVolumen) { entry.maxVolumen = volSesion; entry.fechaMaxVolumen = fechaStr; }

      entry.historial.push({ fecha: fechaStr, maxPeso: maxPesoSesion, volumen: volSesion });
    });
  });

  return ejercicios;
};
