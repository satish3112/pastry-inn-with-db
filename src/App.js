import { useState, useEffect } from "react";
import Categories from "./components/Categories";
import MenuList from "./components/MenuList";
import Cart from "./components/Cart";
import AdminPanel from "./components/AdminPanel";
import MyOrders from "./components/MyOrders";
import initialMenuData from "./data/menuData";
import {
  getBranchId,
  subscribeToMenu,
  subscribeToSettings,
  subscribeToOrders,
  seedMenuIfEmpty,
  seedSettingsIfEmpty,
} from "./firebase";

// ── Branch detected from URL (?branch=branch1 / branch2 / branch3)
const BRANCH_ID = getBranchId();

const DEFAULT_SETTINGS = {
  shopName: "PastryInn",
  whatsappNumber: "919037650365",
  upiId: "yourname@upi",
  adminPass: "admin123",
  contactPhone: "",
  branchName: BRANCH_ID === "branch1" ? "Branch 1" : BRANCH_ID === "branch2" ? "Branch 2" : "Branch 3",
};

export default function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [fbError, setFbError] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);

  const [selected, setSelected] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [myOrdersOpen, setMyOrdersOpen] = useState(false);
  const [view, setView] = useState("customer");
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginInput, setLoginInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [logoTaps, setLogoTaps] = useState(0);

  useEffect(() => {
    let unsubMenu, unsubSettings, unsubOrders;
    async function init() {
      try {
        await seedMenuIfEmpty(BRANCH_ID, initialMenuData);
        await seedSettingsIfEmpty(BRANCH_ID, { ...DEFAULT_SETTINGS });
        unsubMenu     = subscribeToMenu(BRANCH_ID, (items) => { setMenuItems(items); setLoading(false); });
        unsubSettings = subscribeToSettings(BRANCH_ID, (s) => setSettings(s));
        unsubOrders   = subscribeToOrders(BRANCH_ID, (orders) => {
          setNewOrderCount(orders.filter(o => !o.seen && o.status === "pending").length);
        });
      } catch (err) {
        console.error("Firebase error:", err);
        setMenuItems(initialMenuData);
        setLoading(false);
        setFbError(true);
      }
    }
    init();
    return () => { if (unsubMenu) unsubMenu(); if (unsubSettings) unsubSettings(); if (unsubOrders) unsubOrders(); };
  }, []);

  const categories = ["All", ...new Set(menuItems.filter(i => i.available !== false).map(i => i.category))];
  const filtered   = menuItems.filter(item =>
    item.available !== false &&
    (selected === "All" || item.category === selected) &&
    item.name.toLowerCase().includes(search.toLowerCase())
  );
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0);

  const addToCart = (item) => setCart(prev => {
    const ex = prev.find(c => c.id === item.id);
    if (ex) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
    return [...prev, { ...item, qty: 1 }];
  });
  const updateQty = (id, delta) => setCart(prev => prev.map(c => c.id === id ? { ...c, qty: c.qty + delta } : c).filter(c => c.qty > 0));
  const clearCart = () => setCart([]);

  // Secret admin login — tap logo 5 times
  const handleLogoTap = () => {
    const next = logoTaps + 1;
    setLogoTaps(next);
    if (next >= 5) { setLoginOpen(true); setLogoTaps(0); }
    setTimeout(() => setLogoTaps(0), 3000);
  };

  const handleLogin = () => {
    if (loginInput === settings.adminPass) {
      setView("admin"); setLoginOpen(false); setLoginInput(""); setLoginError("");
    } else {
      setLoginError("Wrong password. Try again.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#FFF8F0" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
      <div className="text-center">
        <div className="w-16 h-16 rounded-full mx-auto mb-4 animate-spin" style={{ border: "4px solid #FFE0D0", borderTopColor: "#FF6B35" }} />
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#FF6B35" }}>Loading Menu...</p>
        <p className="text-gray-400 text-sm mt-1">{settings.shopName} 🔥</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F0", fontFamily: "'Nunito', sans-serif" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      {fbError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-center text-sm text-red-600">
          ⚠️ Firebase not configured — check your <strong>.env</strong> file
        </div>
      )}

      {view === "admin" ? (
        <AdminPanel menuItems={menuItems} settings={settings} branchId={BRANCH_ID} onExit={() => setView("customer")} />
      ) : (
        <>
          {/* ── HEADER ─────────────────────────────────────────────── */}
          <div className="relative py-12 text-center bg-cover bg-center" style={{ backgroundImage: "url('/bg.jpg'), linear-gradient(135deg,#FF6B35,#FF8C42)" }}>
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10">
              {/* Logo — tap 5 times for admin */}
              <img src="/Logo.png" alt="Logo"
                className="mx-auto h-20 mb-3 drop-shadow-xl cursor-pointer select-none"
                onClick={handleLogoTap}
              />
              <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#fff", fontSize: 26, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                {settings.shopName}
              </h1>
              {/* Branch indicator */}
              <span className="inline-block mt-1 bg-white/20 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                🏪 {settings.branchName || DEFAULT_SETTINGS.branchName}
              </span>

              <div className="mt-4 flex justify-center px-4">
                <div className="relative w-full max-w-md">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input type="text" placeholder="Search for a dish..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                </div>
              </div>
            </div>

            {/* Cart button */}
            <button onClick={() => setCartOpen(true)}
              className="absolute top-4 left-4 z-20 flex items-center gap-2 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transition"
              style={{ background: cartCount > 0 ? "#FF6B35" : "rgba(255,255,255,0.2)" }}>
              🛒
              {cartCount > 0 && <span className="bg-white text-orange-500 rounded-full px-2 py-0.5 text-xs font-black">{cartCount}</span>}
              <span>Cart</span>
            </button>

            {/* My Orders + New order badge */}
            <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
              <button onClick={() => setMyOrdersOpen(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm transition">
                📋 My Orders
              </button>
              {newOrderCount > 0 && (
                <button onClick={() => setLoginOpen(true)}
                  className="flex items-center gap-1.5 text-white px-3 py-1.5 rounded-full text-xs font-bold animate-pulse"
                  style={{ background: "#ef4444" }}>
                  🔔 {newOrderCount} New Order{newOrderCount > 1 ? "s" : ""}
                </button>
              )}
            </div>
          </div>

          {/* ── MENU ──────────────────────────────────────────────── */}
          <div className="px-4 pt-5 pb-28 max-w-6xl mx-auto">
            <Categories categories={categories} selected={selected} setSelected={setSelected} />
            <MenuList items={filtered} cart={cart} addToCart={addToCart} updateQty={updateQty} />
          </div>

          {/* ── STICKY CART BAR ────────────────────────────────────── */}
          {cartCount > 0 && (
            <div className="fixed bottom-0 left-0 right-0 z-40 p-4" style={{ background: "linear-gradient(transparent, #FFF8F0 60%)" }}>
              <button onClick={() => setCartOpen(true)}
                className="w-full max-w-md mx-auto flex items-center justify-between px-6 py-4 rounded-2xl text-white font-bold shadow-2xl hover:brightness-110"
                style={{ background: "linear-gradient(135deg,#FF6B35,#FF8C42)", display: "flex" }}>
                <span className="bg-white/30 rounded-full px-3 py-1 text-sm">{cartCount} items</span>
                <span>View Cart</span>
                <span>₹{cartTotal}</span>
              </button>
            </div>
          )}

          {/* ── CART ──────────────────────────────────────────────── */}
          {cartOpen && (
            <Cart
              cart={cart} cartTotal={cartTotal}
              onClose={() => setCartOpen(false)}
              onUpdateQty={updateQty} onClear={clearCart}
              whatsappNumber={settings.whatsappNumber}
              upiId={settings.upiId}
              shopName={settings.shopName}
              contactPhone={settings.contactPhone}
              branchId={BRANCH_ID}
            />
          )}

          {/* ── MY ORDERS ─────────────────────────────────────────── */}
          {myOrdersOpen && (
            <MyOrders
              onClose={() => setMyOrdersOpen(false)}
              whatsappNumber={settings.whatsappNumber}
              contactPhone={settings.contactPhone}
            />
          )}

          {/* ── ADMIN LOGIN MODAL ──────────────────────────────────── */}
          {loginOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
                <div className="text-center mb-6">
                  <span className="text-4xl">🔐</span>
                  <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold mt-2">Admin Access</h2>
                  <p className="text-gray-400 text-xs mt-1">Branch: {settings.branchName || BRANCH_ID}</p>
                  {newOrderCount > 0 && (
                    <div className="mt-2 bg-red-50 text-red-500 rounded-xl px-4 py-2 text-sm font-bold animate-pulse">
                      🔔 {newOrderCount} new order{newOrderCount > 1 ? "s" : ""} waiting!
                    </div>
                  )}
                </div>
                <input type="password" placeholder="Password" value={loginInput}
                  onChange={e => setLoginInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 mb-3 focus:outline-none focus:border-orange-400 text-center text-lg tracking-widest" />
                {loginError && <p className="text-red-500 text-sm text-center mb-3">{loginError}</p>}
                <div className="flex gap-3">
                  <button onClick={handleLogin} className="flex-1 py-3 rounded-xl text-white font-bold hover:brightness-110"
                    style={{ background: "linear-gradient(135deg,#FF6B35,#FF8C42)" }}>Login</button>
                  <button onClick={() => { setLoginOpen(false); setLoginInput(""); setLoginError(""); }}
                    className="flex-1 py-3 rounded-xl bg-gray-100 font-semibold">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
