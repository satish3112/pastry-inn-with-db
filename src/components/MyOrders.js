import { useState, useEffect, useRef } from "react";
import { db, subscribeToCustomerOrdersByPhone, showBrowserNotification } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

const STATUS_STEPS = {
  pending:   { label: "Received",  emoji: "🔔", step: 1, color: "#F59E0B" },
  preparing: { label: "Preparing", emoji: "👨‍🍳", step: 2, color: "#3B82F6" },
  ready:     { label: "Ready",     emoji: "✅", step: 3, color: "#10B981" },
  done:      { label: "Completed", emoji: "🏁", step: 4, color: "#6B7280" },
  cancelled: { label: "Cancelled", emoji: "❌", step: 0, color: "#EF4444" },
};

function OrderCard({ order, settings, branchId }) {
  const [liveStatus, setLiveStatus] = useState(order.status || "pending");
  const [expanded, setExpanded] = useState(false);
  const prevStatus = useRef(order.status);

  useEffect(() => {
    if (!order._docId || !branchId) return;
    const ref = doc(db, `branches/${branchId}/orders`, order._docId);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const newStatus = snap.data().status || "pending";
      // Show notification when status changes
      if (prevStatus.current !== newStatus) {
        if (newStatus === "ready") {
          showBrowserNotification("🎉 Order Ready!", `${order.orderId} is ready for pickup!`);
        } else if (newStatus === "preparing") {
          showBrowserNotification("👨‍🍳 Preparing Your Order", `${order.orderId} is being prepared`);
        }
        prevStatus.current = newStatus;
      }
      setLiveStatus(newStatus);
    });
    return () => unsub();
  }, [order._docId, branchId, order.orderId]);

  const statusInfo = STATUS_STEPS[liveStatus] || STATUS_STEPS.pending;
  const currentStep = statusInfo.step;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4"
      style={{ border: liveStatus === "ready" ? "2px solid #10B981" : "1px solid #f0f0f0" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ background: liveStatus === "done" || liveStatus === "cancelled" ? "#f9fafb" : "#FFF8F0" }}>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-gray-800">{order.orderId}</span>
            <span>{statusInfo.emoji}</span>
            {liveStatus === "ready" && (
              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                READY!
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {order.createdAt?.toDate
              ? order.createdAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) + " · " +
                order.createdAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : order.placedAt
                ? new Date(order.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) + " · " +
                  new Date(order.placedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="font-black text-lg" style={{ color: "#FF6B35" }}>₹{order.total}</p>
          <p className="text-xs text-gray-400">{order.items?.length} item{order.items?.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Status bar — skip for cancelled */}
      {liveStatus !== "cancelled" && (
        <div className="px-4 py-3 border-b border-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400">STATUS</span>
            <span className="text-xs font-black px-2 py-0.5 rounded-full"
              style={{ background: statusInfo.color + "20", color: statusInfo.color }}>
              {statusInfo.label}
            </span>
          </div>
          <div className="flex items-center">
            {["pending","preparing","ready","done"].map((key, i, arr) => {
              const val = STATUS_STEPS[key];
              return (
                <div key={key} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                      style={{ background: val.step <= currentStep ? val.color : "#e5e7eb", color: val.step <= currentStep ? "#fff" : "#9ca3af" }}>
                      {val.step <= currentStep ? "✓" : val.step}
                    </div>
                    <p className="text-center mt-0.5 leading-tight"
                      style={{ color: val.step <= currentStep ? val.color : "#9ca3af", fontSize: 9, width: 48 }}>
                      {val.label}
                    </p>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="flex-1 h-1 mx-1 rounded-full mb-4"
                      style={{ background: val.step < currentStep ? statusInfo.color : "#e5e7eb" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            {expanded ? (
              <div className="space-y-1">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name} × {item.qty}</span>
                    <span className="font-bold text-gray-700">₹{item.total}</span>
                  </div>
                ))}
                {order.note && <p className="text-xs text-orange-500 mt-1">📝 {order.note}</p>}
                <div className="flex justify-between font-black text-orange-500 pt-2 border-t border-gray-100 mt-1">
                  <span>Total</span><span>₹{order.total}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 truncate">{order.items?.map(i => i.name).join(", ")}</p>
            )}
          </div>
          <button onClick={() => setExpanded(!expanded)}
            className="text-xs text-orange-500 font-bold whitespace-nowrap flex-shrink-0">
            {expanded ? "▲ Less" : "▼ More"}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-50 flex gap-2">
        <a href={`https://wa.me/${settings?.whatsappNumber}?text=${encodeURIComponent(`Hi! Query about order ${order.orderId}. My name is ${order.customerName}.`)}`}
          target="_blank" rel="noreferrer"
          className="flex-1 py-2 rounded-xl text-white font-bold text-xs text-center"
          style={{ background: "#25D366" }}>
          📱 Help
        </a>
        {settings?.contactPhone && (
          <a href={`tel:${settings.contactPhone}`}
            className="flex-1 py-2 rounded-xl font-bold text-xs text-center border-2 border-gray-200 text-gray-600">
            📞 Call
          </a>
        )}
      </div>
    </div>
  );
}

export default function MyOrders({ onClose, settings, branchId }) {
  const [phone, setPhone]       = useState(localStorage.getItem("customerPhone") || "");
  const [inputPhone, setInputPhone] = useState("");
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter]     = useState("all");

  // Subscribe to Firebase orders when phone is known
  useEffect(() => {
    if (!phone || phone.length < 10) return;
    setLoading(true);
    const unsub = subscribeToCustomerOrdersByPhone(phone, (data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsub();
  }, [phone]);

  const handlePhoneSubmit = () => {
    if (inputPhone.length < 10) { alert("Enter a valid 10-digit number"); return; }
    localStorage.setItem("customerPhone", inputPhone.trim());
    setPhone(inputPhone.trim());
  };

  // ── Filters ─────────────────────────────────────────────────
  const now = new Date();
  const filtered = orders.filter(order => {
    // Search by item name or order ID
    if (search) {
      const s = search.toLowerCase();
      const matchId = order.orderId?.toLowerCase().includes(s);
      const matchItem = order.items?.some(i => i.name.toLowerCase().includes(s));
      if (!matchId && !matchItem) return false;
    }

    // Status filter
    if (statusFilter !== "all" && order.status !== statusFilter) return false;

    // Time filter
    if (timeFilter !== "all") {
      const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.placedAt || 0);
      const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);
      if (timeFilter === "30" && diffDays > 30) return false;
      if (timeFilter === "365" && diffDays > 365) return false;
    }

    return true;
  });

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col bg-white"
        style={{ boxShadow: "-4px 0 30px rgba(0,0,0,0.15)" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#FF6B35,#FF8C42)" }}>
          <div>
            <h2 className="text-white font-black text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>
              📋 My Orders
            </h2>
            <p className="text-orange-100 text-xs">
              {phone ? `📞 ${phone}` : "Enter your phone to view orders"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {phone && (
              <button onClick={() => { setPhone(""); setOrders([]); }}
                className="text-xs text-white/70 border border-white/30 px-3 py-1 rounded-full">
                Change
              </button>
            )}
            <button onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white font-bold">
              ✕
            </button>
          </div>
        </div>

        {/* Phone input if not set */}
        {!phone ? (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center w-full">
              <span className="text-5xl">📱</span>
              <p className="font-black text-gray-800 mt-4 text-lg">Enter Your Phone</p>
              <p className="text-gray-400 text-sm mt-1 mb-6">To view your order history</p>
              <input
                placeholder="10-digit phone number"
                value={inputPhone}
                onChange={e => setInputPhone(e.target.value)}
                type="tel" maxLength={10}
                onKeyDown={e => e.key === "Enter" && handlePhoneSubmit()}
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-center text-lg mb-3 focus:outline-none focus:border-orange-400"
              />
              <button onClick={handlePhoneSubmit}
                className="w-full py-3 rounded-2xl text-white font-black"
                style={{ background: "linear-gradient(135deg,#FF6B35,#FF8C42)" }}>
                View My Orders
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Search + Filters */}
            <div className="px-4 pt-3 space-y-2 flex-shrink-0">
              {/* Search */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                <input
                  placeholder="Search by item name or order ID..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-orange-300"
                />
              </div>

              {/* Status filter */}
              <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {[
                  { id: "all",       label: "All" },
                  { id: "pending",   label: "🔔 New" },
                  { id: "preparing", label: "👨‍🍳 Prep" },
                  { id: "ready",     label: "✅ Ready" },
                  { id: "done",      label: "🏁 Done" },
                  { id: "cancelled", label: "❌ Cancelled" },
                ].map(s => (
                  <button key={s.id} onClick={() => setStatusFilter(s.id)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border-2 flex-shrink-0"
                    style={{ background: statusFilter === s.id ? "#FF6B35" : "#fff", color: statusFilter === s.id ? "#fff" : "#666", borderColor: statusFilter === s.id ? "#FF6B35" : "#e5e7eb" }}>
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Time filter */}
              <div className="flex gap-1.5">
                {[
                  { id: "all", label: "All Time" },
                  { id: "30",  label: "Last 30 Days" },
                  { id: "365", label: "Last Year" },
                ].map(t => (
                  <button key={t.id} onClick={() => setTimeFilter(t.id)}
                    className="flex-1 py-1.5 rounded-xl text-xs font-semibold border-2"
                    style={{ background: timeFilter === t.id ? "#FF6B35" : "#fff", color: timeFilter === t.id ? "#fff" : "#666", borderColor: timeFilter === t.id ? "#FF6B35" : "#e5e7eb" }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders list */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3">
              {loading ? (
                <div className="text-center py-20">
                  <div className="w-10 h-10 rounded-full mx-auto animate-spin"
                    style={{ border: "3px solid #FFE0D0", borderTopColor: "#FF6B35" }} />
                  <p className="text-gray-400 mt-3 text-sm">Loading orders...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                  <span className="text-5xl">🛍️</span>
                  <p className="text-gray-500 font-bold mt-4">No orders found</p>
                  <p className="text-gray-300 text-sm mt-1">
                    {orders.length > 0 ? "Try changing your filters" : "Place your first order!"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 rounded-2xl p-3 mb-3 flex items-center gap-2">
                    <span>🔄</span>
                    <p className="text-xs text-blue-600 font-semibold">Status updates live from kitchen!</p>
                  </div>
                  {filtered.map(order => (
                    <OrderCard
                      key={order._docId || order.orderId}
                      order={order}
                      settings={settings}
                      branchId={order.branchId || branchId}
                    />
                  ))}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}