import { db } from './config';
import {
  collection, addDoc, getDocs, query, where,
  updateDoc, deleteDoc, doc, getDoc, limit,
} from 'firebase/firestore';

export const buscarUsuarios = async (searchTerm, currentUid) => {
  if (!searchTerm.trim()) return [];
  const term = searchTerm.trim();
  const snap = await getDocs(
    query(
      collection(db, 'users'),
      where('displayName', '>=', term),
      where('displayName', '<=', term + '\uf8ff'),
      limit(10)
    )
  );
  return snap.docs
    .map((d) => ({ uid: d.id, ...d.data() }))
    .filter((u) => u.uid !== currentUid);
};

const friendshipExiste = async (uid1, uid2) => {
  const [a, b] = await Promise.all([
    getDocs(query(collection(db, 'friendships'), where('requesterId', '==', uid1), where('receiverId', '==', uid2))),
    getDocs(query(collection(db, 'friendships'), where('requesterId', '==', uid2), where('receiverId', '==', uid1))),
  ]);
  return !a.empty || !b.empty;
};

export const enviarSolicitud = async (fromUid, fromName, toUid) => {
  if (await friendshipExiste(fromUid, toUid)) {
    throw new Error('Ya existe una solicitud o ya sois amigos.');
  }
  const receiverSnap = await getDoc(doc(db, 'users', toUid));
  const receiverName = receiverSnap.exists() ? receiverSnap.data().displayName : 'Usuario';

  await addDoc(collection(db, 'friendships'), {
    requesterId: fromUid,
    requesterName: fromName,
    receiverId: toUid,
    receiverName,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
};

export const obtenerAmigos = async (uid) => {
  const [sent, received] = await Promise.all([
    getDocs(query(collection(db, 'friendships'), where('requesterId', '==', uid), where('status', '==', 'accepted'))),
    getDocs(query(collection(db, 'friendships'), where('receiverId', '==', uid), where('status', '==', 'accepted'))),
  ]);
  const amigos = [];
  sent.docs.forEach((d) => amigos.push({ id: d.id, friendUid: d.data().receiverId, friendName: d.data().receiverName, ...d.data() }));
  received.docs.forEach((d) => amigos.push({ id: d.id, friendUid: d.data().requesterId, friendName: d.data().requesterName, ...d.data() }));
  return amigos;
};

export const obtenerSolicitudesPendientes = async (uid) => {
  const snap = await getDocs(
    query(collection(db, 'friendships'), where('receiverId', '==', uid), where('status', '==', 'pending'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const aceptarSolicitud = async (friendshipId) => {
  await updateDoc(doc(db, 'friendships', friendshipId), { status: 'accepted' });
};

export const rechazarSolicitud = async (friendshipId) => {
  await deleteDoc(doc(db, 'friendships', friendshipId));
};

export const eliminarAmigo = async (friendshipId) => {
  await deleteDoc(doc(db, 'friendships', friendshipId));
};
