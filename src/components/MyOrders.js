import { useState } from "react";
import { subscribeToCustomerOrders } from "../firebase";

const STATUS_CONFIG = {
  pending:   { label: "Pending",    emoji: "🔔", color: "#D97706", bg: "#FEF3C7" },
  preparing: { label: "Preparing", emoji: "👨‍🍳", color: "#2563EB", bg: "#DBEAFE" },
  ready:     { label: "Ready",     emoji: "✅", color: "#16A34A", bg: "#DCFCE7" },
  done:      { label: "Done",      emoji: "🏁", color: "#6B7280", bg: "#F3F4F6" },
};

export default function MyOrders({ onClose, whatsappNumber, contactPhone }) {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [unsubFn, setUnsubFn] = useState(null);

  const handleSearch = () => {
    const cleaned = phone.replace(/\D/g, "").slice(-10);
    if (cleaned.length < 10) { alert("Enter a valid 10-digit phone number."); return; }
    setLoading(true);
    setSearched(false);
    if (unsubFn) unsubFn();
    const fn = subscribeToCustomerOrders(cleaned, (fetched) => {
      setOrders(fetched);
      setLoading(false);
      setSearched(true);
    });
    setUnsubFn(() => fn);
  };

  const handleClose = () => { if (unsubFn) unsubFn(); onClose(); };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-8 sm:bottom-8 z-50 w-full sm:w-full sm:max-w-md flex flex-col bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[95vh]">

        {/* Header */}
        <div className="text-white px-6 py-6 rounded-t-3xl flex-shrink-0" style={{ background: "linear-gradient(135deg,#FF6B35,#FF8C42)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-black text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>📋 My Orders</h2>
              <p className="text-orange-100 text-xs mt-0.5">All your orders — forever saved</p>
            </div>
            <button onClick={handleClose} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold">✕</button>
          </div>
          <div className="flex gap-2">
            <input type="tel" placeholder="Enter your 10-digit phone number"
              value={phone} onChange={e => setPhone(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()} maxLength={10}
              className="flex-1 px-4 py-3 rounded-xl text-gray-800 text-sm font-semibold focus:outline-none" />
            <button onClick={handleSearch} disabled={loading}
              className="px-5 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-sm transition">
              {loading ? "⏳" : "Search"}
            </button>
          </div>
        </div>

        {/* Orders list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {!searched && !loading && (
            <div className="text-center py-16">
              <span className="text-5xl">📱</span>
              <p className="text-gray-500 font-semibold mt-4">Enter your phone number above</p>
              <p className="text-gray-400 text-sm mt-1">See all orders from all branches</p>
              <p className="text-gray-300 text-xs mt-1">Orders are saved forever in our system</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-full mx-auto mb-4 animate-spin" style={{ border: "3px solid #FFE0D0", borderTopColor: "#FF6B35" }} />
              <p className="text-gray-400 font-semibold">Finding your orders...</p>
            </div>
          )}

          {searched && orders.length === 0 && (
            <div className="text-center py-16">
              <span className="text-5xl">🤔</span>
              <p className="text-gray-500 font-semibold mt-4">No orders found</p>
              <p className="text-gray-400 text-sm mt-1">Make sure you used this number while ordering</p>
            </div>
          )}

          {orders.map(order => {
            const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const time = order.createdAt?.toDate?.();
            const branchName = order.shopName || (
              order.branchId === "branch1" ? "Branch 1" :
              order.branchId === "branch2" ? "Branch 2" :
              order.branchId === "branch3" ? "Branch 3" : order.branchId
            );
            return (
              <div key={order._docId} className="bg-white rounded-2xl overflow-hidden" style={{ border: "1.5px solid #f0f0f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                {/* Top bar */}
                <div className="flex items-center justify-between px-4 py-3" style={{ background: st.bg }}>
                  <div>
                    <p className="font-black text-gray-800 text-sm">{order.orderId}</p>
                    <p className="text-xs text-gray-500">{time ? `${time.toLocaleDateString()} · ${time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black" style={{ color: "#FF6B35" }}>₹{order.total}</p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#fff", color: st.color }}>
                      {st.emoji} {st.label}
                    </span>
                  </div>
                </div>

                {/* Branch */}
                <div className="px-4 py-1.5 border-b" style={{ background: "#FFF8F0" }}>
                  <p className="text-xs text-orange-500 font-bold">🏪 {branchName}</p>
                </div>

                {/* Items */}
                <div className="px-4 py-3 border-b border-gray-50">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm py-0.5">
                      <span className="text-gray-500">{item.name} × {item.qty}</span>
                      <span className="font-bold text-gray-700">₹{item.total}</span>
                    </div>
                  ))}
                  {order.note && <p className="text-xs text-orange-500 mt-1.5 font-semibold">📝 {order.note}</p>}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <p className="text-xs text-gray-400">💳 {order.paymentMethod === "upi" ? "UPI" : "WhatsApp COD"}</p>
                  <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi! Query about order ${order.orderId}. My name is ${order.customerName}.`)}`}
                    target="_blank" rel="noreferrer"
                    className="text-xs font-bold px-3 py-1.5 rounded-xl text-white" style={{ background: "#25D366" }}>
                    📱 Get Help
                  </a>
                </div>
              </div>
            );
          })}

          {/* Contact */}
          {searched && orders.length > 0 && (
            <div className="bg-orange-50 rounded-2xl p-4">
              <p className="font-bold text-gray-700 text-sm mb-3">❓ Issue with an order?</p>
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-bold text-sm mb-2" style={{ background: "#25D366" }}>
                📱 Contact on WhatsApp
              </a>
              {contactPhone && (
                <a href={`tel:${contactPhone}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm border-2 border-gray-200 text-gray-600">
                  📞 Call: {contactPhone}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
