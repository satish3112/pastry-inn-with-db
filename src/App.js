import { useState, useEffect } from "react";
import Categories from "./components/Categories";
import MenuList from "./components/MenuList";
import Cart from "./components/Cart";
import AdminPanel from "./components/AdminPanel";
import initialMenuData from "./data/menuData";
import {
  subscribeToMenu,
  subscribeToSettings,
  seedMenuIfEmpty,
  seedSettingsIfEmpty,
} from "./firebase";

const DEFAULT_SETTINGS = {
  shopName: "Our Cafe",
  whatsappNumber: "919037650365",
  upiId: "neerajaGedalaa@upi",
  adminPass: "admin123",
};

export default function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [fbError, setFbError] = useState(false);

  const [selected, setSelected] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [view, setView] = useState("customer");
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginInput, setLoginInput] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    let unsubMenu, unsubSettings;
    async function init() {
      try {
        await seedMenuIfEmpty(initialMenuData);
        await seedSettingsIfEmpty(DEFAULT_SETTINGS);
        unsubMenu = subscribeToMenu((items) => { setMenuItems(items); setLoading(false); });
        unsubSettings = subscribeToSettings((s) => setSettings(s));
      } catch (err) {
        console.error("Firebase error:", err);
        setMenuItems(initialMenuData);
        setLoading(false);
        setFbError(true);
      }
    }
    init();
    return () => { if (unsubMenu) unsubMenu(); if (unsubSettings) unsubSettings(); };
  }, []);

  const categories = ["All", ...new Set(menuItems.filter(i => i.available !== false).map(i => i.category))];
  const filtered = menuItems.filter(item =>
    item.available !== false &&
    (selected === "All" || item.category === selected) &&
    item.name.toLowerCase().includes(search.toLowerCase())
  );
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0);

  const addToCart = (item) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id);
      if (ex) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  };
  const updateQty = (id, delta) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: c.qty + delta } : c).filter(c => c.qty > 0));
  };
  const clearCart = () => setCart([]);

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
        <p className="text-gray-400 text-sm mt-1">Connecting to Firebase 🔥</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F0", fontFamily: "'Nunito', sans-serif" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      {fbError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-center text-sm text-red-600">
          ⚠️ Firebase not configured — add your config to <strong>src/firebase.js</strong>
        </div>
      )}

      {view === "admin" ? (
        <AdminPanel
          menuItems={menuItems}
          settings={settings}
          onExit={() => setView("customer")}
        />
      ) : (
        <>
          <div
            className="relative py-12 text-center bg-cover bg-center"
            style={{ backgroundImage: "url('/bg.jpg'), linear-gradient(135deg,#FF6B35,#FF8C42)" }}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10">
              <img src="/Logo.png" alt="Logo" className="mx-auto h-20 mb-3 drop-shadow-xl" />
              <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#fff", fontSize: 28, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                {settings.shopName}
              </h1>
              <div className="mt-4 flex justify-center px-4">
                <div className="relative w-full max-w-md">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Search for a dish..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                  />
                </div>
              </div>
            </div>
            <button onClick={() => setLoginOpen(true)} className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/40 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm transition">
              🔐 Admin
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="absolute top-4 left-4 z-20 flex items-center gap-2 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transition"
              style={{ background: cartCount > 0 ? "#FF6B35" : "rgba(255,255,255,0.2)" }}
            >
              🛒
              {cartCount > 0 && <span className="bg-white text-orange-500 rounded-full px-2 py-0.5 text-xs font-black">{cartCount}</span>}
              <span>Cart</span>
            </button>
          </div>

          <div className="px-4 pt-5 pb-24 max-w-6xl mx-auto">
            <Categories categories={categories} selected={selected} setSelected={setSelected} />
            <MenuList items={filtered} cart={cart} addToCart={addToCart} updateQty={updateQty} />
          </div>

          {cartCount > 0 && (
            <div className="fixed bottom-0 left-0 right-0 z-40 p-4" style={{ background: "linear-gradient(transparent, #FFF8F0 60%)" }}>
              <button
                onClick={() => setCartOpen(true)}
                className="w-full max-w-md mx-auto flex items-center justify-between px-6 py-4 rounded-2xl text-white font-bold shadow-2xl transition hover:brightness-110"
                style={{ background: "linear-gradient(135deg,#FF6B35,#FF8C42)", display: "flex" }}
              >
                <span className="bg-white/30 rounded-full px-3 py-1 text-sm">{cartCount} items</span>
                <span>View Cart</span>
                <span>₹{cartTotal}</span>
              </button>
            </div>
          )}

          {cartOpen && (
            <Cart
              cart={cart} cartTotal={cartTotal}
              onClose={() => setCartOpen(false)}
              onUpdateQty={updateQty} onClear={clearCart}
              whatsappNumber={settings.whatsappNumber}
              upiId={settings.upiId}
              shopName={settings.shopName}
            />
          )}

          {loginOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
                <div className="text-center mb-6">
                  <span className="text-4xl">🔐</span>
                  <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold mt-2">Admin Access</h2>
                  <p className="text-gray-500 text-sm mt-1">Enter your admin password</p>
                </div>
                <input
                  type="password" placeholder="Password"
                  value={loginInput}
                  onChange={e => setLoginInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 mb-3 focus:outline-none focus:border-orange-400 text-center text-lg tracking-widest"
                />
                {loginError && <p className="text-red-500 text-sm text-center mb-3">{loginError}</p>}
                <div className="flex gap-3">
                  <button onClick={handleLogin} className="flex-1 py-3 rounded-xl text-white font-bold transition hover:brightness-110" style={{ background: "linear-gradient(135deg,#FF6B35,#FF8C42)" }}>Login</button>
                  <button onClick={() => { setLoginOpen(false); setLoginInput(""); setLoginError(""); }} className="flex-1 py-3 rounded-xl bg-gray-100 font-semibold hover:bg-gray-200 transition">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
