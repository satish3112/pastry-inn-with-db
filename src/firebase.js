// ─────────────────────────────────────────────────────────────
//  🔥 FIREBASE CONFIGURATION
//  Replace the values below with YOUR Firebase project config.
//  How to get them:
//    1. Go to https://console.firebase.google.com
//    2. Create a project (or open existing)
//    3. Click ⚙️ Project Settings → Your apps → Add app (Web)
//    4. Copy the firebaseConfig object and paste here
// ─────────────────────────────────────────────────────────────

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
} from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: "REPLACE_WITH_YOUR_API_KEY",
//   authDomain: "REPLACE_WITH_YOUR_AUTH_DOMAIN",
//   projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
//   storageBucket: "REPLACE_WITH_YOUR_STORAGE_BUCKET",
//   messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
//   appId: "REPLACE_WITH_YOUR_APP_ID",
// };

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ─────────────────────────────────────────────────────────────
//  COLLECTION / DOC NAMES
// ─────────────────────────────────────────────────────────────
const MENU_COLLECTION = "menuItems";
const SETTINGS_DOC    = "settings/shopSettings";

// ─────────────────────────────────────────────────────────────
//  MENU ITEMS
// ─────────────────────────────────────────────────────────────

/** Listen to all menu items in real-time */
export function subscribeToMenu(callback) {
  const ref = collection(db, MENU_COLLECTION);
  return onSnapshot(ref, (snapshot) => {
    const items = snapshot.docs.map(d => ({ ...d.data(), _docId: d.id }));
    // sort by id (number) so order is stable
    items.sort((a, b) => a.id - b.id);
    callback(items);
  });
}

/** Add a brand-new item */
export async function addMenuItem(item) {
  const ref = collection(db, MENU_COLLECTION);
  const docRef = await addDoc(ref, item);
  return docRef.id;
}

/** Update an existing item (matched by _docId) */
export async function updateMenuItem(item) {
  const { _docId, ...data } = item;
  const ref = doc(db, MENU_COLLECTION, _docId);
  await updateDoc(ref, data);
}

/** Delete an item by _docId */
export async function deleteMenuItem(_docId) {
  await deleteDoc(doc(db, MENU_COLLECTION, _docId));
}

// /** Seed the database with initial data (only runs if collection is empty) */
// export async function seedMenuIfEmpty(initialItems) {
//   const snapshot = await getDocs(collection(db, MENU_COLLECTION));
//   if (!snapshot.empty) return; // already seeded

//   const batch = writeBatch(db);
//   initialItems.forEach(item => {
//     const ref = doc(collection(db, MENU_COLLECTION));
//     batch.set(ref, item);
//   });
//   await batch.commit();
//   console.log("✅ Menu seeded to Firebase!");
// }
export async function seedMenuIfEmpty(initialItems) {
  const snapshot = await getDocs(collection(db, MENU_COLLECTION));
  if (snapshot.size > 0) return; // already has data, stop

  // Use a lock in localStorage to prevent double seeding
  if (localStorage.getItem("seeded") === "true") return;
  localStorage.setItem("seeded", "true");

  const batch = writeBatch(db);
  initialItems.forEach(item => {
    const ref = doc(collection(db, MENU_COLLECTION));
    batch.set(ref, item);
  });
  await batch.commit();
  console.log("✅ Menu seeded to Firebase!");
}

// ─────────────────────────────────────────────────────────────
//  SHOP SETTINGS
// ─────────────────────────────────────────────────────────────

/** Listen to shop settings in real-time */
export function subscribeToSettings(callback) {
  const ref = doc(db, SETTINGS_DOC);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) callback(snap.data());
  });
}

/** Save / update shop settings */
export async function saveSettings(settings) {
  const ref = doc(db, SETTINGS_DOC);
  await setDoc(ref, settings, { merge: true });
}

/** Seed default settings if none exist */
export async function seedSettingsIfEmpty(defaults) {
  const ref = doc(db, SETTINGS_DOC);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, defaults);
    console.log("✅ Settings seeded to Firebase!");
  }
}
