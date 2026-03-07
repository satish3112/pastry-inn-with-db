import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

const STATUS_STEPS = {
  pending:   { label: "Received",  emoji: "🔔", step: 1, color: "#F59E0B" },
  preparing: { label: "Preparing", emoji: "👨‍🍳", step: 2, color: "#3B82F6" },
  ready:     { label: "Ready",     emoji: "✅", step: 3, color: "#10B981" },
  done:      { label: "Completed", emoji: "🏁", step: 4, color: "#6B7280" },
};

function OrderCard({ order, settings, onDelete }) {
  const [liveStatus, setLiveStatus] = useState(order.status || "pending");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!order.firebaseId || !order.branchId) return;
    const ref = doc(db, `branches/${order.branchId}/orders`, order.firebaseId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setLiveStatus(snap.data().status || "pending");
    });
    return () => unsub();
  }, [order.firebaseId, order.branchId]);

  const statusInfo = STATUS_STEPS[liveStatus] || STATUS_STEPS.pending;
  const currentStep = statusInfo.step;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4"
      style={{ border: "1px solid #f0f0f0" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ background: liveStatus === "done" ? "#f9fafb" : "#FFF8F0" }}>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-gray-800">{order.orderId}</span>
            <span>{statusInfo.emoji}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(order.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            {" · "}
            {new Date(order.placedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="text-right">
          <p className="font-black text-lg" style={{ color: "#FF6B35" }}>₹{order.total}</p>
          <p className="text-xs text-gray-400">{order.items?.length} item{order.items?.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Status bar */}
      <div className="px-4 py-3 border-b border-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-400">ORDER STATUS</span>
          <span className="text-xs font-black px-2 py-0.5 rounded-full"
            style={{ background: statusInfo.color + "20", color: statusInfo.color }}>
            {statusInfo.label}
          </span>
        </div>
        <div className="flex items-center">
          {Object.entries(STATUS_STEPS).map(([key, val], i, arr) => (
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
                  style={{ background: val.step < currentStep ? val.color : "#e5e7eb" }} />
              )}
            </div>
          ))}
        </div>
      </div>

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
          📱 Help on WhatsApp
        </a>
        {settings?.contactPhone && (
          <a href={`tel:${settings.contactPhone}`}
            className="flex-1 py-2 rounded-xl font-bold text-xs text-center border-2 border-gray-200 text-gray-600">
            📞 Call Us
          </a>
        )}
        {liveStatus === "done" && (
          <button onClick={() => onDelete(order.orderId)}
            className="px-3 py-2 rounded-xl bg-red-50 text-red-400 font-bold text-xs">
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}

export default function MyOrders({ onClose, settings, branchId }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    try {
      const key = `myOrders_${branchId}`;
      const saved = JSON.parse(localStorage.getItem(key) || "[]");
      saved.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
      setOrders(saved);
    } catch { setOrders([]); }
  }, [branchId]);

  const deleteOrder = (orderId) => {
    const updated = orders.filter(o => o.orderId !== orderId);
    setOrders(updated);
    localStorage.setItem(`myOrders_${branchId}`, JSON.stringify(updated));
  };

  const clearAll = () => {
    if (!window.confirm("Clear all order history?")) return;
    setOrders([]);
    localStorage.removeItem(`myOrders_${branchId}`);
  };

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
            <p className="text-orange-100 text-xs">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            {orders.length > 0 && (
              <button onClick={clearAll}
                className="text-xs text-white/70 hover:text-white border border-white/30 px-3 py-1 rounded-full">
                Clear All
              </button>
            )}
            <button onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white font-bold">
              ✕
            </button>
          </div>
        </div>

        {/* Orders list */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          {orders.length === 0 ? (
            <div className="text-center py-24">
              <span className="text-6xl">🛍️</span>
              <p className="text-gray-500 font-bold mt-4 text-lg">No orders yet</p>
              <p className="text-gray-300 text-sm mt-1">Your orders will appear here</p>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 rounded-2xl p-3 mb-4 flex items-center gap-2">
                <span className="text-lg">🔄</span>
                <p className="text-xs text-blue-600 font-semibold">Status updates live from our kitchen!</p>
              </div>
              {orders.map(order => (
                <OrderCard key={order.orderId} order={order} settings={settings} onDelete={deleteOrder} />
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}
