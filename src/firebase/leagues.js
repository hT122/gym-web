import { db } from './config';
import {
  collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc,
} from 'firebase/firestore';

const generarCodigo = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const codigoUnico = async (codigo) => {
  const snap = await getDocs(query(collection(db, 'leagues'), where('codigoInvitacion', '==', codigo)));
  return snap.empty;
};

export const crearLiga = async (userId, userName, nombre) => {
  let codigo;
  do { codigo = generarCodigo(); } while (!(await codigoUnico(codigo)));

  const ligaRef = await addDoc(collection(db, 'leagues'), {
    nombre,
    codigoInvitacion: codigo,
    creadorId: userId,
    creadoEn: new Date().toISOString(),
  });

  await addDoc(collection(db, 'league_members'), {
    leagueId: ligaRef.id,
    userId,
    userName,
    puntosTotal: 0,
    unidoEn: new Date().toISOString(),
  });

  return { id: ligaRef.id, nombre, codigoInvitacion: codigo };
};

export const unirseALiga = async (userId, userName, codigo) => {
  const ligasSnap = await getDocs(
    query(collection(db, 'leagues'), where('codigoInvitacion', '==', codigo.toUpperCase().trim()))
  );
  if (ligasSnap.empty) throw new Error('Código de liga no encontrado.');

  const liga = { id: ligasSnap.docs[0].id, ...ligasSnap.docs[0].data() };

  const yaEsMiembro = await getDocs(
    query(collection(db, 'league_members'),
      where('leagueId', '==', liga.id),
      where('userId', '==', userId))
  );
  if (!yaEsMiembro.empty) throw new Error('Ya eres miembro de esta liga.');

  await addDoc(collection(db, 'league_members'), {
    leagueId: liga.id,
    userId,
    userName,
    puntosTotal: 0,
    unidoEn: new Date().toISOString(),
  });

  return liga;
};

export const obtenerMisLigas = async (userId) => {
  const memberSnap = await getDocs(
    query(collection(db, 'league_members'), where('userId', '==', userId))
  );

  const ligas = await Promise.all(
    memberSnap.docs.map(async (memberDoc) => {
      const ligaSnap = await getDoc(doc(db, 'leagues', memberDoc.data().leagueId));
      return ligaSnap.exists() ? { id: ligaSnap.id, ...ligaSnap.data() } : null;
    })
  );

  return ligas.filter(Boolean);
};

// Fetches all member workouts in one batched query (chunks of 30 per Firestore 'in' limit)
export const obtenerLeaderboard = async (leagueId, periodo = 'semana') => {
  const memberSnap = await getDocs(
    query(collection(db, 'league_members'), where('leagueId', '==', leagueId))
  );
  const members = memberSnap.docs.map(d => ({ memberId: d.id, ...d.data() }));
  if (members.length === 0) return [];

  const now = new Date();
  const startDate = periodo === 'semana'
    ? new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()
    : new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const userIds = members.map(m => m.userId);
  const chunks = [];
  for (let i = 0; i < userIds.length; i += 30) chunks.push(userIds.slice(i, i + 30));

  const allWorkouts = (
    await Promise.all(
      chunks.map(chunk =>
        getDocs(query(collection(db, 'entrenamientos'), where('userId', 'in', chunk)))
      )
    )
  ).flatMap(snap => snap.docs.map(d => d.data()));

  const puntosPorUsuario = {};
  allWorkouts
    .filter(w => w.fecha >= startDate)
    .forEach(w => {
      puntosPorUsuario[w.userId] = (puntosPorUsuario[w.userId] || 0) + (w.puntos || 0);
    });

  return members
    .map(m => ({ ...m, puntosEnPeriodo: puntosPorUsuario[m.userId] || 0 }))
    .sort((a, b) => b.puntosEnPeriodo - a.puntosEnPeriodo);
};

export const actualizarPuntosEnLigas = async (userId, puntosGanados) => {
  const memberSnap = await getDocs(
    query(collection(db, 'league_members'), where('userId', '==', userId))
  );
  await Promise.all(memberSnap.docs.map(memberDoc =>
    updateDoc(doc(db, 'league_members', memberDoc.id), {
      puntosTotal: (memberDoc.data().puntosTotal || 0) + puntosGanados,
    })
  ));
};

export const recalcularPuntosEnLigas = async (userId) => {
  const [memberSnap, workoutsSnap] = await Promise.all([
    getDocs(query(collection(db, 'league_members'), where('userId', '==', userId))),
    getDocs(query(collection(db, 'entrenamientos'), where('userId', '==', userId))),
  ]);
  const total = workoutsSnap.docs.reduce((sum, d) => sum + (d.data().puntos || 0), 0);
  await Promise.all(
    memberSnap.docs.map(memberDoc =>
      updateDoc(doc(db, 'league_members', memberDoc.id), { puntosTotal: total })
    )
  );
};
