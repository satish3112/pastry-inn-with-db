import { useState, useEffect, useRef } from "react";
import { addMenuItem, updateMenuItem, deleteMenuItem, saveSettings, subscribeToOrders, updateOrderStatus, deleteOrder, compressImage } from "../firebase";

const emptyItem = { id: Date.now(), name: "", desc: "", price: "", category: "", image: "", available: true };

const STATUS_CONFIG = {
  pending:   { label: "Pending",    emoji: "🔔", bg: "#FEF3C7", color: "#D97706" },
  preparing: { label: "Preparing", emoji: "👨‍🍳", bg: "#DBEAFE", color: "#2563EB" },
  ready:     { label: "Ready",     emoji: "✅", bg: "#DCFCE7", color: "#16A34A" },
  done:      { label: "Done",      emoji: "🏁", bg: "#F3F4F6", color: "#6B7280" },
};

export default function AdminPanel({ menuItems, settings, branchId, onExit }) {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [editItem, setEditItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyItem);
  const [filterCat, setFilterCat] = useState("All");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [settingsForm, setSettingsForm] = useState({ ...settings });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const prevCount = useRef(0);
  const audioCtx = useRef(null);

  const categories = [...new Set(menuItems.map(i => i.category))];

  const playSound = () => {
    try {
      if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtx.current;
      [523, 659, 784].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq; osc.type = "sine";
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.3);
      });
    } catch (e) {}
  };

  useEffect(() => {
    const unsub = subscribeToOrders(branchId, (newOrders) => {
      setOrders(newOrders);
      const unseen = newOrders.filter(o => !o.seen && o.status === "pending").length;
      setNewOrderCount(unseen);
      if (unseen > prevCount.current) playSound();
      prevCount.current = unseen;
    });
    return () => unsub();
  }, [branchId]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSaving(true);
    try {
      const compressed = await compressImage(file);
      setFormData(f => ({ ...f, image: compressed }));
    }
    catch (err) { alert(err.message); }
    setSaving(false);
  };

  const openAdd = () => { setFormData({ ...emptyItem, id: Date.now(), category: categories[0] || "" }); setEditItem(null); setShowForm(true); };
  const openEdit = (item) => { setFormData({ ...item }); setEditItem(item._docId); setShowForm(true); };

  const saveItem = async () => {
    if (!formData.name.trim() || !formData.price || !formData.category) { alert("Fill name, price and category."); return; }
    setSaving(true);
    try {
      const item = { ...formData, price: Number(formData.price) };
      if (editItem) await updateMenuItem(branchId, { ...item, _docId: editItem });
      else await addMenuItem(branchId, item);
      setShowForm(false); setFormData(emptyItem); setEditItem(null);
    } catch (err) { alert("Error: " + err.message); }
    setSaving(false);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try { await deleteMenuItem(branchId, item._docId); } catch (err) { alert(err.message); }
  };

  const toggleAvailable = async (item) => {
    try { await updateMenuItem(branchId, { ...item, available: item.available === false }); } catch (err) { alert(err.message); }
  };

  const deleteCategory = async (cat) => {
    if (!window.confirm(`Delete all items in "${cat}"?`)) return;
    for (const item of menuItems.filter(i => i.category === cat)) await deleteMenuItem(branchId, item._docId);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await saveSettings(branchId, { ...settingsForm, whatsappNumber: settingsForm.whatsappNumber.replace(/\D/g, "") });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2500);
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  const filteredItems = menuItems.filter(item =>
    (filterCat === "All" || item.category === filterCat) &&
    item.name.toLowerCase().includes(searchQ.toLowerCase())
  );
  const filteredOrders = orders.filter(o => filterStatus === "all" || o.status === filterStatus);
  const todayTotal = orders
    .filter(o => o.status !== "done" && o.createdAt?.toDate?.().toDateString() === new Date().toDateString())
    .reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div className="min-h-screen" style={{ background: "#f8f9fa" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Nunito:wght@600;700;800;900&display=swap" rel="stylesheet" />

      {/* Header */}
      <div className="text-white px-5 py-4 flex items-center justify-between" style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)" }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20 }} className="font-bold">⚙️ Admin Panel</h1>
          <p className="text-xs text-gray-400">{settings.shopName} · {settings.branchName || branchId} · 🔥 Live</p>
        </div>
        <button onClick={onExit} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold">← Menu</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 px-4 py-4">
        {[
          { label: "Items", value: menuItems.length, emoji: "🍽️" },
          { label: "Active", value: orders.filter(o => o.status !== "done").length, emoji: "📋" },
          { label: "New", value: newOrderCount, emoji: "🔔", highlight: newOrderCount > 0 },
          { label: "₹ Today", value: todayTotal, emoji: "💰" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-3 text-center shadow-sm"
            style={{ border: s.highlight ? "2px solid #FF6B35" : "none", background: s.highlight ? "#FFF8F0" : "#fff" }}>
            <span className="text-xl">{s.emoji}</span>
            <p className="font-black text-lg" style={{ color: s.highlight ? "#FF6B35" : "#1f2937" }}>{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mx-4 bg-white rounded-2xl p-1 shadow-sm mb-4">
        {[
          { id: "orders", label: "📋 Orders", badge: newOrderCount },
          { id: "items", label: "🍽️ Items" },
          { id: "categories", label: "📂 Cats" },
          { id: "settings", label: "⚙️ Settings" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2 rounded-xl font-bold text-xs transition relative"
            style={{ background: activeTab === tab.id ? "linear-gradient(135deg,#FF6B35,#FF8C42)" : "transparent", color: activeTab === tab.id ? "#fff" : "#888" }}>
            {tab.label}
            {tab.badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-black animate-pulse">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="px-4 pb-20">

        {/* ── ORDERS ────────────────────────────────────────────────── */}
        {activeTab === "orders" && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: "none" }}>
              {[
                { id: "all", label: "All", count: orders.length },
                { id: "pending", label: "🔔 Pending", count: orders.filter(o => o.status === "pending").length },
                { id: "preparing", label: "👨‍🍳 Preparing", count: orders.filter(o => o.status === "preparing").length },
                { id: "ready", label: "✅ Ready", count: orders.filter(o => o.status === "ready").length },
                { id: "done", label: "🏁 Done", count: orders.filter(o => o.status === "done").length },
              ].map(s => (
                <button key={s.id} onClick={() => setFilterStatus(s.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border-2 transition"
                  style={{ background: filterStatus === s.id ? "#FF6B35" : "#fff", color: filterStatus === s.id ? "#fff" : "#666", borderColor: filterStatus === s.id ? "#FF6B35" : "#e5e7eb" }}>
                  {s.label} ({s.count})
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-20">
                <span className="text-5xl">📋</span>
                <p className="text-gray-400 mt-4 font-semibold">No orders yet</p>
                <p className="text-gray-300 text-sm">Orders appear here in real-time</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map(order => {
                  const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                  const time = order.createdAt?.toDate?.();
                  return (
                    <div key={order._docId} className="bg-white rounded-2xl shadow-sm overflow-hidden"
                      style={{ border: !order.seen && order.status === "pending" ? "2px solid #FF6B35" : "1px solid #f0f0f0" }}>
                      <div className="flex items-center justify-between px-4 py-3" style={{ background: st.bg }}>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-gray-800">{order.orderId}</span>
                            {!order.seen && order.status === "pending" && (
                              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">NEW</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{time ? `${time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · ${time.toLocaleDateString()}` : ""}</p>
                        </div>
                        <span className="font-black text-lg" style={{ color: "#FF6B35" }}>₹{order.total}</span>
                      </div>

                      <div className="px-4 py-3 border-b border-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-sm text-gray-800">👤 {order.customerName}</p>
                            <p className="text-xs text-gray-500">📞 {order.customerPhone}</p>
                            {order.paymentMethod && <p className="text-xs text-gray-400 mt-0.5">💳 {order.paymentMethod === "upi" ? "UPI Paid" : "WhatsApp COD"}</p>}
                          </div>
                          <div className="flex gap-2">
                            <a href={`tel:${order.customerPhone}`} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-500">📞 Call</a>
                            <a href={`https://wa.me/91${order.customerPhone}?text=${encodeURIComponent(`Hi ${order.customerName}! Your order ${order.orderId} is ${order.status}.`)}`}
                              target="_blank" rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white" style={{ background: "#25D366" }}>
                              💬 WA
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 py-3 border-b border-gray-50">
                        {order.items?.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm py-0.5">
                            <span className="text-gray-600">{item.name} × {item.qty}</span>
                            <span className="font-bold">₹{item.total}</span>
                          </div>
                        ))}
                        {order.note && <p className="text-xs text-orange-500 mt-1 font-semibold">📝 {order.note}</p>}
                      </div>

                      <div className="px-4 py-3">
                        <p className="text-xs text-gray-400 mb-2 font-semibold">UPDATE STATUS:</p>
                        <div className="flex gap-2 flex-wrap">
                          {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                            <button key={key}
                              onClick={() => updateOrderStatus(branchId, order._docId, order.customerPhone, key)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold transition"
                              style={{ background: order.status === key ? val.bg : "#f3f4f6", color: order.status === key ? val.color : "#888", border: order.status === key ? `2px solid ${val.color}` : "2px solid transparent" }}>
                              {val.emoji} {val.label}
                            </button>
                          ))}
                          <button onClick={() => deleteOrder(branchId, order._docId)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-400 ml-auto">🗑️</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── ITEMS ─────────────────────────────────────────────────── */}
        {activeTab === "items" && (
          <>
            <div className="flex gap-2 mb-4">
              <input placeholder="🔍 Search..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
                className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-300" />
              <button onClick={openAdd} className="px-5 py-2.5 rounded-xl text-white font-bold text-sm"
                style={{ background: "linear-gradient(135deg,#FF6B35,#FF8C42)" }}>+ Add</button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: "none" }}>
              {["All", ...categories].map(cat => (
                <button key={cat} onClick={() => setFilterCat(cat)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border-2"
                  style={{ background: filterCat === cat ? "#FF6B35" : "#fff", color: filterCat === cat ? "#fff" : "#666", borderColor: filterCat === cat ? "#FF6B35" : "#e5e7eb" }}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {filteredItems.map(item => (
                <div key={item._docId} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm" style={{ opacity: item.available === false ? 0.6 : 1 }}>
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-orange-50">
                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 truncate">{item.category}</p>
                    <p className="text-orange-500 font-black text-sm">₹{item.price}</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button onClick={() => toggleAvailable(item)} className="text-xs px-2 py-1 rounded-lg font-semibold"
                      style={{ background: item.available === false ? "#fee2e2" : "#dcfce7", color: item.available === false ? "#ef4444" : "#16a34a" }}>
                      {item.available === false ? "Hidden" : "Visible"}
                    </button>
                    <button onClick={() => openEdit(item)} className="text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-500 font-semibold">✏️ Edit</button>
                    <button onClick={() => handleDelete(item)} className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-400 font-semibold">🗑️ Del</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── CATEGORIES ────────────────────────────────────────────── */}
        {activeTab === "categories" && (
          <>
            <div className="flex gap-2 mb-4">
              <input placeholder="New category name..." value={newCatName} onChange={e => setNewCatName(e.target.value)}
                className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-300" />
              <button onClick={() => { if (newCatName.trim()) { setFormData({ ...emptyItem, id: Date.now(), category: newCatName.trim() }); setNewCatName(""); setShowForm(true); setActiveTab("items"); } }}
                className="px-5 py-2.5 rounded-xl text-white font-bold text-sm" style={{ background: "linear-gradient(135deg,#FF6B35,#FF8C42)" }}>+ Add</button>
            </div>
            <div className="space-y-3">
              {categories.map(cat => {
                const count = menuItems.filter(i => i.category === cat).length;
                return (
                  <div key={cat} className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
                    <div><p className="font-bold">{cat}</p><p className="text-xs text-gray-400">{count} items</p></div>
                    <div className="flex gap-2">
                      <button onClick={() => { setActiveTab("items"); setFilterCat(cat); }} className="text-xs px-3 py-1.5 rounded-lg bg-orange-50 text-orange-500 font-semibold">View</button>
                      <button onClick={() => deleteCategory(cat)} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-400 font-semibold">🗑️</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── SETTINGS ──────────────────────────────────────────────── */}
        {activeTab === "settings" && (
          <div className="space-y-4 max-w-lg">
            {[
              { key: "shopName", label: "🏪 Shop Name", placeholder: "PastryInn" },
              { key: "branchName", label: "🏢 Branch Name", placeholder: "e.g. Main Branch / Velachery" },
              { key: "whatsappNumber", label: "📱 WhatsApp Number", placeholder: "919037650365" },
              { key: "contactPhone", label: "📞 Contact Phone", placeholder: "9999999999" },
              { key: "upiId", label: "💳 UPI ID", placeholder: "yourname@paytm" },
              { key: "adminPass", label: "🔐 Admin Password", placeholder: "Change password" },
            ].map(field => (
              <div key={field.key} className="bg-white rounded-2xl p-4 shadow-sm">
                <label className="block text-sm font-bold text-gray-700 mb-2">{field.label}</label>
                <input type={field.key === "adminPass" ? "password" : "text"}
                  value={settingsForm[field.key] || ""}
                  onChange={e => setSettingsForm(f => ({ ...f, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300" />
              </div>
            ))}
            <div className="bg-blue-50 rounded-2xl p-4 text-sm text-blue-700">
              <p className="font-bold mb-1">🏪 Branch URLs</p>
              <p className="text-xs mb-1">Share these links with each branch:</p>
              <p className="text-xs font-mono bg-white rounded-lg px-3 py-1.5 mb-1">yoursite.vercel.app/?branch=branch1</p>
              <p className="text-xs font-mono bg-white rounded-lg px-3 py-1.5 mb-1">yoursite.vercel.app/?branch=branch2</p>
              <p className="text-xs font-mono bg-white rounded-lg px-3 py-1.5">yoursite.vercel.app/?branch=branch3</p>
            </div>
            <button onClick={handleSaveSettings} disabled={saving}
              className="w-full py-4 rounded-2xl text-white font-black text-base hover:brightness-110"
              style={{ background: settingsSaved ? "#16a34a" : "linear-gradient(135deg,#FF6B35,#FF8C42)", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving..." : settingsSaved ? "✓ Saved!" : "Save Settings"}
            </button>
          </div>
        )}
      </div>

      {/* ── ITEM FORM MODAL ──────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b flex items-center justify-between rounded-t-3xl z-10">
              <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold">{editItem ? "✏️ Edit" : "➕ Add Item"}</h2>
              <button onClick={() => setShowForm(false)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">📸 Image</label>
                {formData.image ? (
                  <div className="relative w-full h-40 rounded-2xl overflow-hidden group">
                    <img src={formData.image} alt="preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                      <label className="cursor-pointer bg-white px-4 py-2 rounded-xl font-semibold text-sm">Change<input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} /></label>
                      <button onClick={() => setFormData(f => ({ ...f, image: "" }))} className="bg-red-500 text-white px-4 py-2 rounded-xl font-semibold text-sm">Remove</button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50 cursor-pointer hover:bg-orange-100 transition">
                    {saving ? <span className="text-orange-400 font-semibold text-sm">Compressing...</span> : (<><span className="text-3xl mb-1">📸</span><span className="text-sm text-orange-500 font-semibold">Upload image</span><span className="text-xs text-orange-300">Any size — auto compressed</span></>)}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Name *</label>
                <input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} placeholder="Item name"
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Description</label>
                <textarea value={formData.desc} onChange={e => setFormData(f => ({ ...f, desc: e.target.value }))} rows={2}
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-1">Price (₹) *</label>
                  <input type="number" value={formData.price} onChange={e => setFormData(f => ({ ...f, price: e.target.value }))}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Category *</label>
                  <input value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))} list="cats"
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300" />
                  <datalist id="cats">{categories.map(c => <option key={c} value={c} />)}</datalist>
                </div>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                <div><p className="font-bold text-sm">Available</p><p className="text-xs text-gray-400">Hidden items won't show</p></div>
                <button onClick={() => setFormData(f => ({ ...f, available: !f.available }))}
                  className="w-12 h-6 rounded-full relative" style={{ background: formData.available !== false ? "#FF6B35" : "#d1d5db" }}>
                  <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                    style={{ left: formData.available !== false ? "calc(100% - 1.4rem)" : "2px" }} />
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={saveItem} disabled={saving} className="flex-1 py-4 rounded-2xl text-white font-black hover:brightness-110"
                  style={{ background: "linear-gradient(135deg,#FF6B35,#FF8C42)", opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Saving..." : editItem ? "Save" : "Add ✓"}
                </button>
                <button onClick={() => setShowForm(false)} className="flex-1 py-4 rounded-2xl bg-gray-100 font-bold text-gray-600">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
