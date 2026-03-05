import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const MENU_COLLECTION   = "menuItems";
const ORDERS_COLLECTION = "orders";
const SETTINGS_DOC      = "settings/shopSettings";

// ─────────────────────────────────────────────────────────────
//  MENU ITEMS
// ─────────────────────────────────────────────────────────────
export function subscribeToMenu(callback) {
  const ref = collection(db, MENU_COLLECTION);
  return onSnapshot(ref, (snapshot) => {
    const items = snapshot.docs.map(d => ({ ...d.data(), _docId: d.id }));
    items.sort((a, b) => a.id - b.id);
    callback(items);
  });
}

export async function addMenuItem(item) {
  const ref = collection(db, MENU_COLLECTION);
  const docRef = await addDoc(ref, item);
  return docRef.id;
}

export async function updateMenuItem(item) {
  const { _docId, ...data } = item;
  await updateDoc(doc(db, MENU_COLLECTION, _docId), data);
}

export async function deleteMenuItem(_docId) {
  await deleteDoc(doc(db, MENU_COLLECTION, _docId));
}

export async function seedMenuIfEmpty(initialItems) {
  const snapshot = await getDocs(collection(db, MENU_COLLECTION));
  if (snapshot.size > 0) return;
  if (localStorage.getItem("seeded") === "true") return;
  localStorage.setItem("seeded", "true");
  const batch = writeBatch(db);
  initialItems.forEach(item => {
    batch.set(doc(collection(db, MENU_COLLECTION)), item);
  });
  await batch.commit();
}

// ─────────────────────────────────────────────────────────────
//  ORDERS
// ─────────────────────────────────────────────────────────────

/** Generate a short readable order ID e.g. ORD-4829 */
export function generateOrderId() {
  return "ORD-" + Math.floor(1000 + Math.random() * 9000);
}

/** Save a new order to Firestore */
export async function placeOrder(orderData) {
  const ref = collection(db, ORDERS_COLLECTION);
  const docRef = await addDoc(ref, {
    ...orderData,
    status: "pending",       // pending | preparing | ready | done
    createdAt: serverTimestamp(),
    seen: false,             // admin has seen this order?
  });
  return docRef.id;
}

/** Listen to all orders in real-time (for admin) */
export function subscribeToOrders(callback) {
  const ref = query(collection(db, ORDERS_COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(ref, (snapshot) => {
    const orders = snapshot.docs.map(d => ({ ...d.data(), _docId: d.id }));
    callback(orders);
  });
}

/** Update order status */
export async function updateOrderStatus(_docId, status) {
  await updateDoc(doc(db, ORDERS_COLLECTION, _docId), { status, seen: true });
}

/** Mark order as seen (removes notification badge) */
export async function markOrderSeen(_docId) {
  await updateDoc(doc(db, ORDERS_COLLECTION, _docId), { seen: true });
}

/** Delete old done orders */
export async function deleteOrder(_docId) {
  await deleteDoc(doc(db, ORDERS_COLLECTION, _docId));
}

// ─────────────────────────────────────────────────────────────
//  SETTINGS
// ─────────────────────────────────────────────────────────────
export function subscribeToSettings(callback) {
  return onSnapshot(doc(db, SETTINGS_DOC), (snap) => {
    if (snap.exists()) callback(snap.data());
  });
}

export async function saveSettings(settings) {
  await setDoc(doc(db, SETTINGS_DOC), settings, { merge: true });
}

export async function seedSettingsIfEmpty(defaults) {
  const snap = await getDoc(doc(db, SETTINGS_DOC));
  if (!snap.exists()) await setDoc(doc(db, SETTINGS_DOC), defaults);
}

// ─────────────────────────────────────────────────────────────
//  IMAGE COMPRESS (free — no Firebase Storage needed)
// ─────────────────────────────────────────────────────────────
export function compressImage(file) {
  return new Promise((resolve, reject) => {
    if (file.size > 5 * 1024 * 1024) { reject(new Error("Image too large. Max 5MB.")); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 600;
        let w = img.width, h = img.height;
        if (w > h && w > MAX) { h = (h * MAX) / w; w = MAX; }
        else if (h > MAX) { w = (w * MAX) / h; h = MAX; }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
