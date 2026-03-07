import { useState } from "react";
import { placeOrder, generateOrderId } from "../firebase";

export default function Cart({
  cart, cartTotal, onClose, onUpdateQty, onClear,
  onOrderPlaced, whatsappNumber, upiId, shopName, contactPhone, branchId
}) {
  const [paymentMode, setPaymentMode] = useState(null);
  const [orderNote, setOrderNote] = useState("");
  const [customerName, setCustomerName] = useState(() => localStorage.getItem("customerName") || "");
  const [customerPhone, setCustomerPhone] = useState(() => localStorage.getItem("customerPhone") || "");
  const [placing, setPlacing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [showUpiQr, setShowUpiQr] = useState(false);

  const handlePlaceOrder = async (method) => {
    if (!customerName.trim()) { alert("Please enter your name."); return; }
    if (!customerPhone.trim() || customerPhone.length < 10) { alert("Please enter a valid 10-digit phone number."); return; }

    setPlacing(true);
    const orderId = generateOrderId();
    const orderData = {
      orderId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items: cart.map(c => ({ name: c.name, qty: c.qty, price: c.price, total: c.price * c.qty })),
      total: cartTotal,
      note: orderNote.trim(),
      paymentMethod: method,
      shopName,
    };

    try {
      const firebaseId = await placeOrder(branchId, orderData);
      const finalOrder = { ...orderData, firebaseId, branchId, placedAt: new Date().toISOString() };

      // Save customer info
      localStorage.setItem("customerName", customerName.trim());
      localStorage.setItem("customerPhone", customerPhone.trim());

      // Save to order history (per branch)
      const key = `myOrders_${branchId}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.unshift(finalOrder);
      localStorage.setItem(key, JSON.stringify(existing));

      // Send WhatsApp
      const lines = cart.map(c => `• ${c.name} × ${c.qty} = ₹${c.price * c.qty}`).join("\n");
      const msg = `🛒 *New Order — ${orderId}*\n\n👤 *Customer:* ${customerName}\n📞 *Phone:* ${customerPhone}\n\n${lines}\n\n💰 *Total: ₹${cartTotal}*\n💳 *Payment:* ${method === "upi" ? "UPI" : "WhatsApp COD"}${orderNote ? `\n\n📝 *Note:* ${orderNote}` : ""}`;
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank");

      setConfirmedOrder(finalOrder);
      if (onOrderPlaced) onOrderPlaced(finalOrder);
      onClear();
    } catch (err) {
      alert("Failed to place order: " + err.message);
    }
    setPlacing(false);
  };

  const upiPayUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(shopName)}&am=${cartTotal}&cu=INR&tn=Food+Order`;
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiPayUrl)}&margin=8&format=png`;

  // ── ORDER CONFIRMED SCREEN ──────────────────────────────────────────
  if (confirmedOrder) {
    return (
      <>
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
        <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col bg-white"
          style={{ boxShadow: "-4px 0 30px rgba(0,0,0,0.15)" }}>
          <div className="flex-1 overflow-y-auto">
            <div className="text-center py-10 px-6"
              style={{ background: "linear-gradient(135deg,#FF6B35,#FF8C42)" }}>
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-white font-black text-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                Order Placed!
              </h2>
              <p className="text-orange-100 mt-1 text-sm">Your order has been received</p>
              <div className="mt-4 bg-white/20 rounded-2xl px-6 py-3 inline-block">
                <p className="text-white text-xs">Order ID</p>
                <p className="text-white font-black text-2xl tracking-widest">{confirmedOrder.orderId}</p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-orange-50 rounded-2xl p-4">
                <h3 className="font-black text-gray-800 mb-3">📋 Order Summary</h3>
                {confirmedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1 border-b border-orange-100 last:border-0">
                    <span className="text-gray-600">{item.name} × {item.qty}</span>
                    <span className="font-bold text-gray-800">₹{item.total}</span>
                  </div>
                ))}
                <div className="flex justify-between font-black text-orange-500 text-lg mt-3 pt-2 border-t border-orange-200">
                  <span>Total</span>
                  <span>₹{confirmedOrder.total}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="font-black text-gray-800 mb-2">👤 Your Details</h3>
                <p className="text-sm text-gray-600">Name: <strong>{confirmedOrder.customerName}</strong></p>
                <p className="text-sm text-gray-600">Phone: <strong>{confirmedOrder.customerPhone}</strong></p>
                <p className="text-sm text-gray-600">Payment: <strong>{confirmedOrder.paymentMethod === "upi" ? "UPI" : "WhatsApp COD"}</strong></p>
                {confirmedOrder.note && <p className="text-sm text-gray-600 mt-1">Note: <strong>{confirmedOrder.note}</strong></p>}
              </div>

              <div className="bg-blue-50 rounded-2xl p-4">
                <h3 className="font-black text-gray-800 mb-2">⏱️ What happens next?</h3>
                {["📱 We received your order on WhatsApp", "👨‍🍳 We'll start preparing your order", "✅ Your order will be ready soon!"].map((s, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-600 py-1">
                    <span className="text-lg">{s.split(" ")[0]}</span>
                    <span>{s.split(" ").slice(1).join(" ")}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl p-4 border-2 border-orange-200" style={{ background: "#FFF8F0" }}>
                <h3 className="font-black text-gray-800 mb-1">❓ Need Help?</h3>
                <p className="text-sm text-gray-500 mb-3">Quote Order ID <strong>{confirmedOrder.orderId}</strong></p>
                <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi! Query about order ${confirmedOrder.orderId}. My name is ${confirmedOrder.customerName}.`)}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-bold text-sm"
                  style={{ background: "#25D366" }}>
                  📱 Contact on WhatsApp
                </a>
                {contactPhone && (
                  <a href={`tel:${contactPhone}`}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm mt-2 border-2 border-gray-200 text-gray-700">
                    📞 Call Us: {contactPhone}
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="p-4 border-t">
            <button onClick={onClose}
              className="w-full py-4 rounded-2xl text-white font-black text-base hover:brightness-110"
              style={{ background: "linear-gradient(135deg,#FF6B35,#FF8C42)" }}>
              Back to Menu 🍽️
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── MAIN CART ──────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop — click outside to close */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col bg-white"
        style={{ boxShadow: "-4px 0 30px rgba(0,0,0,0.15)" }}
        onClick={e => e.stopPropagation()} // prevent closing when clicking inside
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22 }} className="font-bold text-gray-800">
              Your Cart 🛒
            </h2>
            <p className="text-gray-400 text-xs">{cart.reduce((s, c) => s + c.qty, 0)} items</p>
          </div>
          <div className="flex gap-2">
            {cart.length > 0 && (
              <button onClick={onClear}
                className="text-xs text-red-400 hover:text-red-600 border border-red-200 px-3 py-1 rounded-full transition">
                Clear All
              </button>
            )}
            <button onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable content — ONLY this div scrolls */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl">🛒</span>
              <p className="text-gray-400 mt-4 font-semibold">Your cart is empty</p>
            </div>
          ) : (
            <>
              {/* Cart items */}
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-3 bg-orange-50 rounded-2xl p-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-orange-100">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-800 truncate">{item.name}</p>
                    <p className="text-orange-500 font-black text-sm">₹{item.price} each</p>
                  </div>
                  <div className="flex items-center gap-1 bg-white rounded-xl p-1">
                    <button onClick={() => onUpdateQty(item.id, -1)}
                      className="w-7 h-7 rounded-lg bg-orange-100 text-orange-500 font-black flex items-center justify-center hover:bg-orange-200">−</button>
                    <span className="font-black text-gray-700 w-6 text-center text-sm">{item.qty}</span>
                    <button onClick={() => onUpdateQty(item.id, 1)}
                      className="w-7 h-7 rounded-lg text-white font-black flex items-center justify-center"
                      style={{ background: "#FF6B35" }}>+</button>
                  </div>
                  <div className="min-w-12 text-right">
                    <p className="font-black text-gray-800 text-sm">₹{item.price * item.qty}</p>
                  </div>
                </div>
              ))}

              {/* Customer details */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                <p className="font-black text-gray-700 text-sm">👤 Your Details</p>
                <input placeholder="Your Name *" value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-300" />
                <input placeholder="Phone Number * (10 digits)" value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  type="tel" maxLength={10}
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-300" />
                <textarea placeholder="Special instructions (optional)..."
                  value={orderNote} onChange={e => setOrderNote(e.target.value)}
                  rows={2}
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-300 resize-none" />
              </div>
            </>
          )}
        </div>

        {/* Footer — fixed at bottom, never scrolls */}
        {cart.length > 0 && (
          <div className="border-t px-4 py-4 space-y-3 flex-shrink-0" style={{ background: "#FFF8F0" }}>

            {/* Bill summary */}
            <div className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {cart.reduce((s, c) => s + c.qty, 0)} items · No delivery charges 🎉
              </div>
              <div className="font-black text-lg" style={{ color: "#FF6B35" }}>₹{cartTotal}</div>
            </div>

            {/* Payment buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setPaymentMode(paymentMode === "whatsapp" ? null : "whatsapp"); setShowUpiQr(false); }}
                className="py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition border-2"
                style={{
                  background: paymentMode === "whatsapp" ? "#25D366" : "#fff",
                  color: paymentMode === "whatsapp" ? "#fff" : "#25D366",
                  borderColor: "#25D366"
                }}>
                📱 WhatsApp
              </button>
              <button
                onClick={() => { setPaymentMode(paymentMode === "upi" ? null : "upi"); setShowUpiQr(false); }}
                className="py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition border-2"
                style={{
                  background: paymentMode === "upi" ? "#5F249F" : "#fff",
                  color: paymentMode === "upi" ? "#fff" : "#5F249F",
                  borderColor: "#5F249F"
                }}>
                💳 UPI Pay
              </button>
            </div>

            {/* WhatsApp panel */}
            {paymentMode === "whatsapp" && (
              <div className="bg-green-50 rounded-2xl p-3">
                <p className="text-xs text-green-700 mb-2 text-center">Pay on delivery or pickup</p>
                <button
                  onClick={() => handlePlaceOrder("whatsapp")}
                  disabled={placing}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm transition hover:brightness-110"
                  style={{ background: "#25D366", opacity: placing ? 0.7 : 1 }}>
                  {placing ? "Placing..." : "📱 Place Order on WhatsApp"}
                </button>
              </div>
            )}

            {/* UPI panel — compact, same height as WhatsApp panel */}
            {paymentMode === "upi" && (
              <div className="bg-purple-50 rounded-2xl p-3">
                <p className="text-xs text-purple-700 mb-2 text-center font-semibold">
                  Pay ₹{cartTotal} to <strong>{upiId}</strong>
                </p>

                {/* Toggle QR */}
                <button
                  onClick={() => setShowUpiQr(!showUpiQr)}
                  className="w-full py-2 rounded-xl text-xs font-bold mb-2 border-2 border-purple-200 text-purple-600 bg-white"
                >
                  {showUpiQr ? "▲ Hide QR Code" : "▼ Show QR Code"}
                </button>

                {showUpiQr && (
                  <div className="flex justify-center mb-2">
                    <img src={upiQrUrl} alt="UPI QR"
                      className="rounded-xl border-2 border-purple-200"
                      style={{ width: 140, height: 140 }} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <a href={upiPayUrl}
                    className="py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center"
                    style={{ background: "#5F249F" }}>
                    💳 Open UPI App
                  </a>
                  <button
                    onClick={() => handlePlaceOrder("upi")}
                    disabled={placing}
                    className="py-2.5 rounded-xl text-white font-bold text-xs transition hover:brightness-110"
                    style={{ background: "#FF6B35", opacity: placing ? 0.7 : 1 }}>
                    {placing ? "Placing..." : "✅ I've Paid"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
