import { useState } from "react";

export default function Cart({ cart, cartTotal, onClose, onUpdateQty, onClear, whatsappNumber, upiId, shopName }) {
  const [paymentMode, setPaymentMode] = useState(null); // null | 'whatsapp' | 'upi'
  const [orderNote, setOrderNote] = useState("");
  const [ordered, setOrdered] = useState(false);

  const handleWhatsApp = () => {
    const lines = cart.map(c => `• ${c.name} × ${c.qty} = ₹${c.price * c.qty}`).join("\n");
    const msg = `🛒 *New Order from ${shopName}*\n\n${lines}\n\n💰 *Total: ₹${cartTotal}*${orderNote ? `\n\n📝 Note: ${orderNote}` : ""}`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    setOrdered(true);
  };


  // const upiPayUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(shopName)}&am=${cartTotal}&cu=INR&tn=${encodeURIComponent("Food Order")}`;
  // const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiPayUrl)}`;
  const upiPayUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(shopName)}&am=${cartTotal}&cu=INR&tn=Food+Order`;
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(upiPayUrl)}&margin=10&format=png`;
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col"
        style={{ background: "#fff", boxShadow: "-4px 0 30px rgba(0,0,0,0.15)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22 }} className="font-bold text-gray-800">
              Your Cart 🛒
            </h2>
            <p className="text-gray-400 text-xs">{cart.reduce((s, c) => s + c.qty, 0)} items</p>
          </div>
          <div className="flex gap-2">
            {cart.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-red-400 hover:text-red-600 border border-red-200 px-3 py-1 rounded-full transition"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl">🛒</span>
              <p className="text-gray-400 mt-4 font-semibold">Your cart is empty</p>
              <p className="text-gray-300 text-sm">Add some delicious items!</p>
            </div>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-3 bg-orange-50 rounded-2xl p-3">
                  {/* Image */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-orange-100">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-800 truncate">{item.name}</p>
                    <p className="text-orange-500 font-black text-sm">₹{item.price} each</p>
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 bg-white rounded-xl p-1">
                    <button
                      onClick={() => onUpdateQty(item.id, -1)}
                      className="w-7 h-7 rounded-lg bg-orange-100 text-orange-500 font-black flex items-center justify-center hover:bg-orange-200 transition"
                    >
                      −
                    </button>
                    <span className="font-black text-gray-700 w-5 text-center">{item.qty}</span>
                    <button
                      onClick={() => onUpdateQty(item.id, 1)}
                      className="w-7 h-7 rounded-lg text-white font-black flex items-center justify-center hover:brightness-110 transition"
                      style={{ background: "#FF6B35" }}
                    >
                      +
                    </button>
                  </div>

                  {/* Item total */}
                  <div className="text-right min-w-14">
                    <p className="font-black text-gray-800 text-sm">₹{item.price * item.qty}</p>
                  </div>
                </div>
              ))}

              {/* Order Note */}
              <textarea
                placeholder="Add a note (e.g. less spicy, no onion...)"
                value={orderNote}
                onChange={e => setOrderNote(e.target.value)}
                rows={2}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 resize-none"
              />
            </>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t px-5 py-5 space-y-3" style={{ background: "#FFF8F0" }}>
            {/* Bill summary */}
            <div className="bg-white rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal ({cart.reduce((s, c) => s + c.qty, 0)} items)</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600 font-semibold">
                <span>🎉 No delivery charges</span>
                <span>₹0</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-black text-gray-800 text-lg">
                <span>Total</span>
                <span style={{ color: "#FF6B35" }}>₹{cartTotal}</span>
              </div>
            </div>

            {!ordered ? (
              <>
                {/* Payment mode selection */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMode(paymentMode === "whatsapp" ? null : "whatsapp")}
                    className="py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition border-2"
                    style={{
                      background: paymentMode === "whatsapp" ? "#25D366" : "#fff",
                      color: paymentMode === "whatsapp" ? "#fff" : "#25D366",
                      borderColor: "#25D366"
                    }}
                  >
                    <span>📱</span> WhatsApp
                  </button>
                  <button
                    onClick={() => setPaymentMode(paymentMode === "upi" ? null : "upi")}
                    className="py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition border-2"
                    style={{
                      background: paymentMode === "upi" ? "#5F249F" : "#fff",
                      color: paymentMode === "upi" ? "#fff" : "#5F249F",
                      borderColor: "#5F249F"
                    }}
                  >
                    <span>💳</span> UPI Pay
                  </button>
                </div>

                {/* WhatsApp panel */}
                {paymentMode === "whatsapp" && (
                  <div className="bg-green-50 rounded-2xl p-4 text-center">
                    <p className="text-sm text-green-700 mb-3">Your order will be sent to us via WhatsApp. We'll confirm shortly!</p>
                    <button
                      onClick={handleWhatsApp}
                      className="w-full py-3 rounded-xl text-white font-bold transition hover:brightness-110"
                      style={{ background: "#25D366" }}
                    >
                      📱 Send Order on WhatsApp
                    </button>
                  </div>
                )}

                {/* UPI panel */}
                {paymentMode === "upi" && (
                  <div className="bg-purple-50 rounded-2xl p-4 text-center">
                    <p className="text-sm text-purple-700 mb-1 font-semibold">Pay ₹{cartTotal} via UPI</p>
                    <p className="text-xs text-purple-500 mb-3">Scan QR or click Pay Now</p>
                    <img
                      src={upiQrUrl}
                      alt="UPI QR Code"
                      className="mx-auto rounded-xl mb-3 border-2 border-purple-200"
                      style={{ width: 160, height: 160 }}
                    />
                    <p className="text-xs text-gray-500 mb-3">UPI ID: <strong>{upiId}</strong></p>
                    <a
                      href={upiPayUrl}
                      className="block w-full py-3 rounded-xl text-white font-bold transition hover:brightness-110 mb-2"
                      style={{ background: "#5F249F" }}
                    >
                      💳 Open UPI App & Pay
                    </a>
                    <p className="text-xs text-gray-400">After paying, send screenshot to our WhatsApp</p>
                    <button
                      onClick={handleWhatsApp}
                      className="mt-2 text-xs text-green-600 underline"
                    >
                      📱 Also send order on WhatsApp
                    </button>
                  </div>
                )}
              </>
            ) : (
              // Success state
              <div className="bg-green-50 rounded-2xl p-6 text-center">
                <span className="text-4xl">🎉</span>
                <p className="font-black text-green-700 mt-2 text-lg">Order Sent!</p>
                <p className="text-sm text-green-600 mt-1">We'll confirm your order shortly.</p>
                <button
                  onClick={() => { onClear(); onClose(); }}
                  className="mt-4 w-full py-3 rounded-xl text-white font-bold"
                  style={{ background: "#FF6B35" }}
                >
                  Done ✓
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
