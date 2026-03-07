import { initializeApp } from "firebase/app";
import {
  getFirestore, doc, getDoc, setDoc, collection,
  getDocs, addDoc, updateDoc, deleteDoc, onSnapshot,
  writeBatch, query, orderBy, serverTimestamp,
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

// ─────────────────────────────────────────────────────────────
//  BRANCH CONFIG
//  Each branch has its own menu + orders + settings in Firestore
//  Structure:
//    branches/{branchId}/menuItems/{itemId}
//    branches/{branchId}/orders/{orderId}
//    branches/{branchId}/settings/shopSettings
// ─────────────────────────────────────────────────────────────

/** Get branch ID from URL query param e.g. ?branch=branch2
 *  Falls back to "branch1" if not specified
 */
export function getBranchId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("branch") || "branch1";
}

const branchRef = (branchId) => `branches/${branchId}`;
const menuCol   = (branchId) => collection(db, branchRef(branchId), "menuItems");
const ordersCol = (branchId) => collection(db, branchRef(branchId), "orders");
const settingsDoc = (branchId) => doc(db, branchRef(branchId), "settings", "shopSettings");

// ─────────────────────────────────────────────────────────────
//  MENU ITEMS
// ─────────────────────────────────────────────────────────────
export function subscribeToMenu(branchId, callback) {
  return onSnapshot(menuCol(branchId), (snapshot) => {
    const items = snapshot.docs.map(d => ({ ...d.data(), _docId: d.id }));
    items.sort((a, b) => a.id - b.id);
    callback(items);
  });
}

export async function addMenuItem(branchId, item) {
  return await addDoc(menuCol(branchId), item);
}

export async function updateMenuItem(branchId, item) {
  const { _docId, ...data } = item;
  await updateDoc(doc(db, branchRef(branchId), "menuItems", _docId), data);
}

export async function deleteMenuItem(branchId, _docId) {
  await deleteDoc(doc(db, branchRef(branchId), "menuItems", _docId));
}

export async function seedMenuIfEmpty(branchId, initialItems) {
  const snapshot = await getDocs(menuCol(branchId));
  if (snapshot.size > 0) return;
  const key = `seeded_${branchId}`;
  if (localStorage.getItem(key) === "true") return;
  localStorage.setItem(key, "true");
  const batch = writeBatch(db);
  initialItems.forEach(item => batch.set(doc(menuCol(branchId)), item));
  await batch.commit();
  console.log(`✅ Menu seeded for ${branchId}`);
}

// ─────────────────────────────────────────────────────────────
//  ORDERS
// ─────────────────────────────────────────────────────────────
export function generateOrderId() {
  return "ORD-" + Math.floor(1000 + Math.random() * 9000);
}

/** Place order — saved under branch AND customer phone for history */
export async function placeOrder(branchId, orderData) {
  // 1. Save to branch orders (admin sees this)
  const branchOrderRef = await addDoc(ordersCol(branchId), {
    ...orderData,
    branchId,
    status: "pending",
    seen: false,
    createdAt: serverTimestamp(),
  });

  // 2. Save to customer order history (customer can look up by phone)
  const customerRef = doc(db, "customerOrders", orderData.customerPhone, "orders", branchOrderRef.id);
  await setDoc(customerRef, {
    ...orderData,
    branchId,
    status: "pending",
    createdAt: serverTimestamp(),
    _branchOrderDocId: branchOrderRef.id,
  });

  return branchOrderRef.id;
}

/** Admin: subscribe to all orders for a branch */
export function subscribeToOrders(branchId, callback) {
  const q = query(ordersCol(branchId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ ...d.data(), _docId: d.id })));
  });
}

/** Customer: get all orders by phone number (across all branches) */
export async function getCustomerOrders(phoneNumber) {
  const ref = collection(db, "customerOrders", phoneNumber, "orders");
  const q = query(ref, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ ...d.data(), _docId: d.id }));
}

/** Customer: subscribe to orders in real-time */
export function subscribeToCustomerOrders(phoneNumber, callback) {
  const ref = collection(db, "customerOrders", phoneNumber, "orders");
  const q = query(ref, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ ...d.data(), _docId: d.id })));
  });
}

/** Admin: update order status (syncs to customer history too) */
export async function updateOrderStatus(branchId, _docId, customerPhone, status) {
  // Update in branch
  await updateDoc(doc(db, branchRef(branchId), "orders", _docId), { status, seen: true });
  // Sync status to customer history
  try {
    await updateDoc(doc(db, "customerOrders", customerPhone, "orders", _docId), { status });
  } catch (e) { console.log("Could not sync status to customer history"); }
}

export async function deleteOrder(branchId, _docId) {
  await deleteDoc(doc(db, branchRef(branchId), "orders", _docId));
}

// ─────────────────────────────────────────────────────────────
//  SETTINGS
// ─────────────────────────────────────────────────────────────
export function subscribeToSettings(branchId, callback) {
  return onSnapshot(settingsDoc(branchId), (snap) => {
    if (snap.exists()) callback(snap.data());
  });
}

export async function saveSettings(branchId, settings) {
  await setDoc(settingsDoc(branchId), settings, { merge: true });
}

export async function seedSettingsIfEmpty(branchId, defaults) {
  const snap = await getDoc(settingsDoc(branchId));
  if (!snap.exists()) await setDoc(settingsDoc(branchId), defaults);
}

// ─────────────────────────────────────────────────────────────
//  IMAGE COMPRESS
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
