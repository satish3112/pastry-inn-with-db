import { useState} from "react";
import { toggleWishlist, isWishlisted } from "../firebase";

export default function MenuCard({ item, cartItem, addToCart, updateQty }) {
  const [wishlisted, setWishlisted] = useState(() => isWishlisted(item.id));
  const qty = cartItem ? cartItem.qty : 0;

const handleWishlist = async (e) => {
  e.stopPropagation();
  const updated = toggleWishlist(item);
  setWishlisted(updated.some(w => w.id === item.id));
  window.dispatchEvent(new Event("wishlistChanged"));
  // Save to Firebase if phone known
  const phone = localStorage.getItem("customerPhone");
  if (phone) {
    const { saveWishlistToFirebase } = await import("../firebase");
    saveWishlistToFirebase(phone, updated);
  }
};

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
      style={{ border: "1px solid #f5f0eb" }}>

      {/* Image */}
      <div className="relative w-full h-40 bg-orange-50">
        {item.image
          ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>}

        {/* Heart / Wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition"
          style={{ background: wishlisted ? "#FF6B35" : "rgba(255,255,255,0.9)" }}
        >
          <span style={{ fontSize: 16 }}>{wishlisted ? "❤️" : "🤍"}</span>
        </button>

        {/* Veg / Non-veg indicator */}
        {item.veg !== undefined && (
          <div className="absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center bg-white"
            style={{ borderColor: item.veg ? "#16a34a" : "#dc2626" }}>
            <div className="w-2 h-2 rounded-full"
              style={{ background: item.veg ? "#16a34a" : "#dc2626" }} />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-3">
        <p className="font-black text-gray-800 text-sm leading-tight">{item.name}</p>
        {item.desc && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.desc}</p>}

        <div className="flex items-center justify-between mt-3">
          <span className="font-black text-base" style={{ color: "#FF6B35" }}>₹{item.price}</span>

          {/* Add / Qty control */}
          {qty === 0 ? (
            <button
              onClick={() => addToCart(item)}
              className="px-4 py-1.5 rounded-xl text-white font-black text-sm hover:brightness-110 transition"
              style={{ background: "linear-gradient(135deg,#FF6B35,#FF8C42)" }}
            >
              + Add
            </button>
          ) : (
            <div className="flex items-center gap-1 rounded-xl p-1"
              style={{ background: "#FFF0E8" }}>
              <button onClick={() => updateQty(item.id, -1)}
                className="w-7 h-7 rounded-lg bg-white text-orange-500 font-black flex items-center justify-center shadow-sm">
                −
              </button>
              <span className="font-black text-gray-700 w-6 text-center text-sm">{qty}</span>
              <button onClick={() => updateQty(item.id, 1)}
                className="w-7 h-7 rounded-lg text-white font-black flex items-center justify-center"
                style={{ background: "#FF6B35" }}>
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}