import { useState } from "react";
import { addMenuItem, updateMenuItem, deleteMenuItem, saveSettings } from "../firebase";

const emptyItem = { id: Date.now(), name: "", desc: "", price: "", category: "", image: "", available: true };

export default function AdminPanel({ menuItems, settings, onExit }) {
  const [activeTab, setActiveTab] = useState("items");
  const [editItem, setEditItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyItem);
  const [filterCat, setFilterCat] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const [settingsForm, setSettingsForm] = useState({ ...settings });
  const [settingsSaved, setSettingsSaved] = useState(false);

  const categories = [...new Set(menuItems.map(i => i.category))];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSaving(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        // Compress using canvas
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 600;
        let width = img.width;
        let height = img.height;

        // Resize if too big
        if (width > height && width > MAX_SIZE) {
          height = (height * MAX_SIZE) / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width = (width * MAX_SIZE) / height;
          height = MAX_SIZE;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed base64 (0.7 = 70% quality)
        const compressed = canvas.toDataURL("image/jpeg", 0.7);
        setFormData(f => ({ ...f, image: compressed }));
        setSaving(false);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const openAdd = () => {
    setFormData({ ...emptyItem, id: Date.now(), category: categories[0] || "" });
    setEditItem(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setFormData({ ...item });
    setEditItem(item._docId);
    setShowForm(true);
  };

  // ── Save item to Firebase ─────────────────────────────────────────────
  const saveItem = async () => {
    if (!formData.name.trim() || !formData.price || !formData.category) {
      alert("Please fill in name, price and category."); return;
    }
    setSaving(true);
    try {
      const item = { ...formData, price: Number(formData.price) };
      if (editItem) {
        await updateMenuItem({ ...item, _docId: editItem });
      } else {
        await addMenuItem(item);
      }
      setShowForm(false);
      setFormData(emptyItem);
      setEditItem(null);
    } catch (err) {
      alert("Error saving: " + err.message);
    }
    setSaving(false);
  };

  // ── Delete item from Firebase ─────────────────────────────────────────
  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try { await deleteMenuItem(item._docId); }
    catch (err) { alert("Error deleting: " + err.message); }
  };

  // ── Toggle availability ───────────────────────────────────────────────
  const toggleAvailable = async (item) => {
    try {
      await updateMenuItem({ ...item, available: item.available === false ? true : false });
    } catch (err) { alert("Error: " + err.message); }
  };

  // ── Delete category ────────────────────────────────────────────────────
  const deleteCategory = async (cat) => {
    if (!window.confirm(`Delete all items in "${cat}"?`)) return;
    const toDelete = menuItems.filter(i => i.category === cat);
    for (const item of toDelete) {
      await deleteMenuItem(item._docId);
    }
  };

  // ── Save settings to Firebase ──────────────────────────────────────────
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await saveSettings({
        ...settingsForm,
        whatsappNumber: settingsForm.whatsappNumber.replace(/\D/g, ""),
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2500);
    } catch (err) { alert("Error saving settings: " + err.message); }
    setSaving(false);
  };

  const filteredItems = menuItems.filter(item =>
    (filterCat === "All" || item.category === filterCat) &&
    item.name.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: "#f8f9fa" }}>
      {/* Header */}
      <div className="text-white px-5 py-4 flex items-center justify-between" style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)" }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22 }} className="font-bold">⚙️ Admin Panel</h1>
          <p className="text-xs text-gray-400 mt-0.5">{settings.shopName} · 🔥 Firebase Synced</p>
        </div>
        <button onClick={onExit} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
          ← Back to Menu
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-4 py-4">
        {[
          { label: "Total Items", value: menuItems.length, emoji: "🍽️" },
          { label: "Categories", value: categories.length, emoji: "📂" },
          { label: "Available", value: menuItems.filter(i => i.available !== false).length, emoji: "✅" },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-3 text-center shadow-sm">
            <span className="text-2xl">{stat.emoji}</span>
            <p className="font-black text-2xl text-gray-800">{stat.value}</p>
            <p className="text-xs text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mx-4 bg-white rounded-2xl p-1 shadow-sm mb-4">
        {[{ id: "items", label: "🍽️ Items" }, { id: "categories", label: "📂 Categories" }, { id: "settings", label: "⚙️ Settings" }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2 rounded-xl font-bold text-sm transition"
            style={{ background: activeTab === tab.id ? "linear-gradient(135deg,#FF6B35,#FF8C42)" : "transparent", color: activeTab === tab.id ? "#fff" : "#888" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-4 pb-20">

        {/* ── ITEMS TAB ─────────────────────────────────────────────── */}
        {activeTab === "items" && (
          <>
            <div className="flex gap-2 mb-4">
              <input placeholder="🔍 Search items..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
                className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-300" />
              <button onClick={openAdd} className="px-5 py-2.5 rounded-xl text-white font-bold text-sm whitespace-nowrap"
                style={{ background: "linear-gradient(135deg,#FF6B35,#FF8C42)" }}>+ Add Item</button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: "none" }}>
              {["All", ...categories].map(cat => (
                <button key={cat} onClick={() => setFilterCat(cat)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition border-2"
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
                    <p className="font-bold text-sm text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 truncate">{item.category}</p>
                    <p className="text-orange-500 font-black text-sm">₹{item.price}</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button onClick={() => toggleAvailable(item)}
                      className="text-xs px-2 py-1 rounded-lg font-semibold transition"
                      style={{ background: item.available === false ? "#fee2e2" : "#dcfce7", color: item.available === false ? "#ef4444" : "#16a34a" }}>
                      {item.available === false ? "Hidden" : "Visible"}
                    </button>
                    <button onClick={() => openEdit(item)} className="text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-500 font-semibold hover:bg-blue-100 transition">✏️ Edit</button>
                    <button onClick={() => handleDelete(item)} className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-400 font-semibold hover:bg-red-100 transition">🗑️ Del</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── CATEGORIES TAB ────────────────────────────────────────── */}
        {activeTab === "categories" && (
          <>
            <div className="flex gap-2 mb-4">
              <input placeholder="New category name..." value={newCatName} onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && newCatName.trim()) { setFormData({ ...emptyItem, id: Date.now(), category: newCatName.trim() }); setNewCatName(""); setShowForm(true); setActiveTab("items"); } }}
                className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-300" />
              <button
                onClick={() => { if (newCatName.trim()) { setFormData({ ...emptyItem, id: Date.now(), category: newCatName.trim() }); setNewCatName(""); setShowForm(true); setActiveTab("items"); } }}
                className="px-5 py-2.5 rounded-xl text-white font-bold text-sm" style={{ background: "linear-gradient(135deg,#FF6B35,#FF8C42)" }}>+ Add</button>
            </div>
            <div className="space-y-3">
              {categories.map(cat => {
                const count = menuItems.filter(i => i.category === cat).length;
                return (
                  <div key={cat} className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
                    <div>
                      <p className="font-bold text-gray-800">{cat}</p>
                      <p className="text-xs text-gray-400">{count} item{count !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setActiveTab("items"); setFilterCat(cat); }}
                        className="text-xs px-3 py-1.5 rounded-lg bg-orange-50 text-orange-500 font-semibold hover:bg-orange-100 transition">View Items</button>
                      <button onClick={() => deleteCategory(cat)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-400 font-semibold hover:bg-red-100 transition">🗑️ Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── SETTINGS TAB ──────────────────────────────────────────── */}
        {activeTab === "settings" && (
          <div className="space-y-4 max-w-lg">
            {[
              { key: "shopName", label: "🏪 Shop / Cafe Name", placeholder: "e.g. My Awesome Cafe" },
              { key: "whatsappNumber", label: "📱 WhatsApp Number", placeholder: "e.g. 919037650365" },
              { key: "upiId", label: "💳 UPI ID", placeholder: "e.g. yourname@paytm" },
              { key: "adminPass", label: "🔐 Admin Password", placeholder: "Change admin password" },
            ].map(field => (
              <div key={field.key} className="bg-white rounded-2xl p-4 shadow-sm">
                <label className="block text-sm font-bold text-gray-700 mb-2">{field.label}</label>
                <input
                  type={field.key === "adminPass" ? "password" : "text"}
                  value={settingsForm[field.key] || ""}
                  onChange={e => setSettingsForm(f => ({ ...f, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300"
                />
              </div>
            ))}

            <button onClick={handleSaveSettings} disabled={saving}
              className="w-full py-4 rounded-2xl text-white font-black text-base transition hover:brightness-110"
              style={{ background: settingsSaved ? "#16a34a" : "linear-gradient(135deg,#FF6B35,#FF8C42)", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving..." : settingsSaved ? "✓ Saved to Firebase!" : "Save Settings"}
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700">
              <p className="font-bold mb-1">🔥 Firebase Sync Active</p>
              <p className="text-xs">All changes sync instantly across all devices. Your menu is live everywhere!</p>
            </div>
          </div>
        )}
      </div>

      {/* ── ADD / EDIT MODAL ──────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b flex items-center justify-between rounded-t-3xl z-10">
              <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold">
                {editItem ? "✏️ Edit Item" : "➕ Add New Item"}
              </h2>
              <button onClick={() => setShowForm(false)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 font-bold">✕</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Image upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">📸 Item Image</label>
                {formData.image ? (
                  <div className="relative w-full h-40 rounded-2xl overflow-hidden group">
                    <img src={formData.image} alt="preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                      <label className="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-xl font-semibold text-sm">
                        Change<input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                      <button onClick={() => setFormData(f => ({ ...f, image: "" }))} className="bg-red-500 text-white px-4 py-2 rounded-xl font-semibold text-sm">Remove</button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50 cursor-pointer hover:bg-orange-100 transition">
                    <span className="text-3xl mb-1">📸</span>
                    <span className="text-sm text-orange-500 font-semibold">Click to upload image</span>
                    <span className="text-xs text-orange-300 mt-0.5">Max 2MB</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Item Name *</label>
                <input placeholder="e.g. Butter Chicken Pizza" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea placeholder="Brief description..." value={formData.desc} onChange={e => setFormData(f => ({ ...f, desc: e.target.value }))}
                  rows={2} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹) *</label>
                  <input type="number" placeholder="e.g. 150" value={formData.price} onChange={e => setFormData(f => ({ ...f, price: e.target.value }))}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Category *</label>
                  <input placeholder="e.g. Burgers" value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                    list="cat-options" className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300" />
                  <datalist id="cat-options">{categories.map(c => <option key={c} value={c} />)}</datalist>
                </div>
              </div>

              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                <div>
                  <p className="font-bold text-sm text-gray-700">Available on Menu</p>
                  <p className="text-xs text-gray-400">Hidden items won't show to customers</p>
                </div>
                <button onClick={() => setFormData(f => ({ ...f, available: !f.available }))}
                  className="w-12 h-6 rounded-full transition-all relative"
                  style={{ background: formData.available !== false ? "#FF6B35" : "#d1d5db" }}>
                  <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                    style={{ left: formData.available !== false ? "calc(100% - 1.4rem)" : "2px" }} />
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={saveItem} disabled={saving}
                  className="flex-1 py-4 rounded-2xl text-white font-black transition hover:brightness-110"
                  style={{ background: "linear-gradient(135deg,#FF6B35,#FF8C42)", opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Saving..." : editItem ? "Save Changes" : "Add Item ✓"}
                </button>
                <button onClick={() => setShowForm(false)} className="flex-1 py-4 rounded-2xl bg-gray-100 font-bold text-gray-600 hover:bg-gray-200 transition">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
