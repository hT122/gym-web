import { db } from './config';
import {
  collection, doc, setDoc, addDoc, getDoc,
  onSnapshot, query, orderBy, updateDoc, where, increment, getDocs, writeBatch,
} from 'firebase/firestore';

export const getChatId = (uid1, uid2) => [uid1, uid2].sort().join('_');

export const getOrCreateChat = async (uid1, uid2, name1, name2) => {
  const chatId = getChatId(uid1, uid2);
  const chatRef = doc(db, 'chats', chatId);
  const snap = await getDoc(chatRef);
  if (!snap.exists()) {
    await setDoc(chatRef, {
      members: [uid1, uid2],
      memberNames: { [uid1]: name1, [uid2]: name2 },
      lastMessage: '',
      lastMessageTime: null,
      lastSenderId: null,
    });
  }
  return chatId;
};

export const sendMessage = async (chatId, senderId, senderName, text, recipientUid) => {
  const timestamp = new Date().toISOString();
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId,
    senderName,
    text: text.trim(),
    timestamp,
  });
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: text.trim(),
    lastMessageTime: timestamp,
    lastSenderId: senderId,
    [`unreadCounts.${recipientUid}`]: increment(1),
  });
};

export const subscribeToMessages = (chatId, callback) => {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('timestamp', 'asc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

export const markAsRead = async (chatId, uid) => {
  await updateDoc(doc(db, 'chats', chatId), {
    [`lastReadAt.${uid}`]: new Date().toISOString(),
    [`unreadCounts.${uid}`]: 0,
  });
};

export const clearChat = async (chatId) => {
  const snap = await getDocs(collection(db, 'chats', chatId, 'messages'));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: '',
    lastMessageTime: null,
    lastSenderId: null,
    lastReadAt: {},
    unreadCounts: {},
  });
};

export const subscribeToChat = (chatId, callback) => {
  return onSnapshot(doc(db, 'chats', chatId), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });
};

export const subscribeToChats = (uid, callback) => {
  const q = query(collection(db, 'chats'), where('members', 'array-contains', uid));
  return onSnapshot(q, (snap) => {
    const chats = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    chats.sort((a, b) => {
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return b.lastMessageTime.localeCompare(a.lastMessageTime);
    });
    callback(chats);
  });
};
