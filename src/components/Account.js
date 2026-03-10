import { useState, useEffect } from "react";
import {
  getWishlist,
  toggleWishlist,
  saveWishlistToFirebase,
  loadWishlistFromFirebase,
} from "../firebase";

export default function Account({ onClose, onOpenOrders, settings, cart, addToCart, updateQty, onPhoneChange }) {
  const [activeSection, setActiveSection] = useState("main");
  const [wishlist, setWishlist] = useState(getWishlist());
  const [name, setName]   = useState(localStorage.getItem("customerName") || "");
  const [phone, setPhone] = useState(localStorage.getItem("customerPhone") || "");
  const [editMode, setEditMode] = useState(false);

  // Load wishlist from Firebase when phone is known
  useEffect(() => {
    if (!phone) return;
    loadWishlistFromFirebase(phone).then(saved => {
      if (saved.length > 0) {
        setWishlist(saved);
        localStorage.setItem("wishlist", JSON.stringify(saved));
      }
    });
  }, [phone]);

  // Listen for local wishlist changes (heart button tapped)
  useEffect(() => {
    const refresh = () => setWishlist(getWishlist());
    window.addEventListener("wishlistChanged", refresh);
    return () => window.removeEventListener("wishlistChanged", refresh);
  }, []);

  const saveProfile = () => {
    localStorage.setItem("customerName", name.trim());
    localStorage.setItem("customerPhone", phone.trim());
    if (onPhoneChange) onPhoneChange(phone.trim());
    setEditMode(false);
  };

  const removeWishlist = (item) => {
    const updated = toggleWishlist(item);
    setWishlist(updated);
    if (phone) saveWishlistToFirebase(phone, updated);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col bg-white"
        style={{ boxShadow: "-4px 0 30px rgba(0,0,0,0.15)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#FF6B35,#FF8C42)" }}>
          <div className="flex items-center gap-3">
            {activeSection !== "main" && (
              <button onClick={() => setActiveSection("main")}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                ←
              </button>
            )}
            <div>
              <h2 className="text-white font-black text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                {activeSection === "main" ? "👤 Account"
                  : activeSection === "wishlist" ? "❤️ Wishlist"
                  : "🛒 Cart"}
              </h2>
              <p className="text-orange-100 text-xs">
                {name ? `Hi, ${name}!` : "Set up your profile"}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white font-bold">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3">

          {/* ── MAIN SECTION ─────────────────────────────── */}
          {activeSection === "main" && (
            <>
              {/* Profile card */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-black text-gray-800">👤 My Profile</h3>
                  <button onClick={() => setEditMode(!editMode)}
                    className="text-xs font-bold px-3 py-1 rounded-full border-2 border-orange-200 text-orange-500">
                    {editMode ? "Cancel" : "✏️ Edit"}
                  </button>
                </div>
                {editMode ? (
                  <div className="space-y-2">
                    <input value={name} onChange={e => setName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-300" />
                    <input value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder="Phone Number" type="tel" maxLength={10}
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-300" />
                    <button onClick={saveProfile}
                      className="w-full py-2.5 rounded-xl text-white font-bold text-sm"
                      style={{ background: "linear-gradient(135deg,#FF6B35,#FF8C42)" }}>
                      Save Profile
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {name
                      ? <p className="text-sm text-gray-700">Name: <strong>{name}</strong></p>
                      : <p className="text-sm text-gray-400 italic">No name set</p>}
                    {phone
                      ? <p className="text-sm text-gray-700">Phone: <strong>{phone}</strong></p>
                      : <p className="text-sm text-gray-400 italic">No phone set</p>}
                  </div>
                )}
              </div>

              {/* Quick links */}
              {[
                { icon: "📋", label: "My Orders", sub: "Track your order history", action: () => onOpenOrders() },
                { icon: "❤️", label: "Wishlist",  sub: `${wishlist.length} saved item${wishlist.length !== 1 ? "s" : ""}`, action: () => setActiveSection("wishlist") },
                { icon: "🛒", label: "Cart",      sub: `${cart.reduce((s,c)=>s+c.qty,0)} items in cart`, action: () => setActiveSection("cart") },
              ].map(item => (
                <button key={item.label} onClick={item.action}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center gap-4 hover:bg-orange-50 transition">
                  <span className="text-3xl">{item.icon}</span>
                  <div className="text-left">
                    <p className="font-black text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.sub}</p>
                  </div>
                  <span className="ml-auto text-gray-300 text-lg">›</span>
                </button>
              ))}

              {/* Contact section */}
              <div className="bg-orange-50 rounded-2xl p-4">
                <h3 className="font-black text-gray-800 mb-3">📞 Contact Us</h3>
                <div className="space-y-2">
                  <a href={`https://wa.me/${settings?.whatsappNumber}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-white font-bold text-sm"
                    style={{ background: "#25D366" }}>
                    📱 WhatsApp Us
                  </a>
                  {settings?.contactPhone && (
                    <a href={`tel:${settings.contactPhone}`}
                      className="flex items-center gap-3 py-2.5 px-4 rounded-xl font-bold text-sm border-2 border-gray-200 text-gray-700 bg-white">
                      📞 Call: {settings.contactPhone}
                    </a>
                  )}
                </div>
              </div>

              {/* App info */}
              <div className="text-center py-4">
                <p className="text-xs text-gray-400">{settings?.shopName}</p>
                <p className="text-xs text-gray-300 mt-1">Tap "Add to Home Screen" to use as app 📲</p>
              </div>
            </>
          )}

          {/* ── WISHLIST SECTION ──────────────────────────── */}
          {activeSection === "wishlist" && (
            <>
              {wishlist.length === 0 ? (
                <div className="text-center py-24">
                  <span className="text-6xl">❤️</span>
                  <p className="text-gray-500 font-bold mt-4">No saved items</p>
                  <p className="text-gray-300 text-sm mt-1">Tap ❤️ on any item to save it</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {wishlist.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-orange-50">
                        {item.image
                          ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-800 truncate">{item.name}</p>
                        <p className="text-orange-500 font-black text-sm">₹{item.price}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => addToCart(item)}
                          className="px-3 py-1.5 rounded-xl text-white text-xs font-bold"
                          style={{ background: "#FF6B35" }}>
                          + Cart
                        </button>
                        <button onClick={() => removeWishlist(item)}
                          className="px-2 py-1.5 rounded-xl bg-red-50 text-red-400 text-xs font-bold">
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── CART SECTION ──────────────────────────────── */}
          {activeSection === "cart" && (
            <>
              {cart.length === 0 ? (
                <div className="text-center py-24">
                  <span className="text-6xl">🛒</span>
                  <p className="text-gray-500 font-bold mt-4">Cart is empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-orange-50">
                        {item.image
                          ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-800 truncate">{item.name}</p>
                        <p className="text-orange-500 font-black text-sm">₹{item.price}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1">
                        <button onClick={() => updateQty(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-orange-100 text-orange-500 font-black flex items-center justify-center">−</button>
                        <span className="font-black w-6 text-center text-sm">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)}
                          className="w-7 h-7 rounded-lg text-white font-black flex items-center justify-center"
                          style={{ background: "#FF6B35" }}>+</button>
                      </div>
                      <span className="font-black text-sm text-gray-700 min-w-12 text-right">
                        ₹{item.price * item.qty}
                      </span>
                    </div>
                  ))}
                  <div className="bg-orange-50 rounded-2xl p-4 flex justify-between items-center">
                    <span className="font-black text-gray-700">Total</span>
                    <span className="font-black text-xl" style={{ color: "#FF6B35" }}>
                      ₹{cart.reduce((s, c) => s + c.price * c.qty, 0)}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}