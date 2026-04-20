import { db } from './config';
import {
  collection, addDoc, deleteDoc, getDocs, query, where, limit, onSnapshot,
} from 'firebase/firestore';

const getFollowDoc = async (followerId, followingId) => {
  const snap = await getDocs(
    query(collection(db, 'follows'), where('followerId', '==', followerId), where('followingId', '==', followingId), limit(1))
  );
  return snap.empty ? null : snap.docs[0];
};

export const seguir = async (followerId, followingId) => {
  const existing = await getFollowDoc(followerId, followingId);
  if (!existing) {
    await addDoc(collection(db, 'follows'), {
      followerId,
      followingId,
      createdAt: new Date().toISOString(),
    });
  }
};

export const dejarDeSeguir = async (followerId, followingId) => {
  const existing = await getFollowDoc(followerId, followingId);
  if (existing) await deleteDoc(existing.ref);
};

export const estasSiguiendo = async (followerId, followingId) => {
  const doc = await getFollowDoc(followerId, followingId);
  return !!doc;
};

export const obtenerConteoSeguimiento = async (uid) => {
  const [seguidoresSnap, siguiendoSnap] = await Promise.all([
    getDocs(query(collection(db, 'follows'), where('followingId', '==', uid))),
    getDocs(query(collection(db, 'follows'), where('followerId', '==', uid))),
  ]);
  return { seguidores: seguidoresSnap.size, siguiendo: siguiendoSnap.size };
};

export const subscribeToConteoSeguimiento = (uid, callback) => {
  let seguidores = 0;
  let siguiendo = 0;
  const emit = () => callback({ seguidores, siguiendo });

  const unsubSeg = onSnapshot(
    query(collection(db, 'follows'), where('followingId', '==', uid)),
    (snap) => { seguidores = snap.size; emit(); }
  );
  const unsubSig = onSnapshot(
    query(collection(db, 'follows'), where('followerId', '==', uid)),
    (snap) => { siguiendo = snap.size; emit(); }
  );

  return () => { unsubSeg(); unsubSig(); };
};
