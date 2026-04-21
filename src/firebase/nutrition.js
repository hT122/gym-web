import { db } from './config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export const guardarObjetivoCalorico = async (userId, objetivo) => {
  await updateDoc(doc(db, 'users', userId), { objetivoCalorico: objetivo });
};

export const obtenerRegistroDiario = async (userId, fecha) => {
  const snap = await getDoc(doc(db, 'food_logs', `${userId}_${fecha}`));
  return snap.exists() ? (snap.data().entries || []) : [];
};

export const agregarAlimento = async (userId, fecha, entry) => {
  const docRef = doc(db, 'food_logs', `${userId}_${fecha}`);
  const snap = await getDoc(docRef);
  const entries = snap.exists() ? (snap.data().entries || []) : [];
  const updated = [...entries, entry];
  if (snap.exists()) {
    await updateDoc(docRef, { entries: updated });
  } else {
    await setDoc(docRef, { userId, date: fecha, entries: updated });
  }
  return updated;
};

export const eliminarAlimento = async (userId, fecha, entryId) => {
  const docRef = doc(db, 'food_logs', `${userId}_${fecha}`);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return [];
  const updated = (snap.data().entries || []).filter((e) => e.id !== entryId);
  await updateDoc(docRef, { entries: updated });
  return updated;
};
