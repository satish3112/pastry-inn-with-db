export default function MenuCard({ item, cartItem, addToCart, updateQty }) {
  const { id, name, desc, price, image, category } = item;

  const vegCategories = ["Veg Pizza", "Sandwiches", "Rolls", "Desserts", "Mojitos", "Hot Beverages", "Cold Beverages & Shakes"];
  const isVeg = vegCategories.includes(category) || name.toLowerCase().includes("veg") || name.toLowerCase().includes("paneer") || name.toLowerCase().includes("corn") || name.toLowerCase().includes("mushroom");

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}
    >
      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-orange-50 to-amber-100 overflow-hidden">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <span className="text-5xl opacity-50">🍽️</span>
            <span className="text-xs text-gray-400 mt-1">No image</span>
          </div>
        )}

        {/* Veg / Non-veg indicator */}
        <div
          className="absolute top-2 left-2 w-5 h-5 rounded-sm flex items-center justify-center"
          style={{ border: `2px solid ${isVeg ? "#16a34a" : "#dc2626"}`, background: "#fff" }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: isVeg ? "#16a34a" : "#dc2626" }}
          />
        </div>

        {/* Category badge */}
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
          {category}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-bold text-gray-800 leading-tight" style={{ fontSize: 15 }}>{name}</h3>
          <span className="font-black text-orange-500 whitespace-nowrap" style={{ fontSize: 16 }}>₹{price}</span>
        </div>
        <p className="text-gray-400 text-xs mb-3 leading-relaxed">{desc}</p>

        {/* Cart controls */}
        {cartItem ? (
          <div className="flex items-center justify-between bg-orange-50 rounded-xl p-1">
            <button
              onClick={() => updateQty(id, -1)}
              className="w-9 h-9 rounded-lg font-black text-orange-500 hover:bg-orange-200 transition flex items-center justify-center text-lg"
            >
              −
            </button>
            <span className="font-black text-orange-500 text-lg">{cartItem.qty}</span>
            <button
              onClick={() => addToCart(item)}
              className="w-9 h-9 rounded-lg text-white font-black hover:brightness-110 transition flex items-center justify-center text-lg"
              style={{ background: "linear-gradient(135deg,#FF6B35,#FF8C42)" }}
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() => addToCart(item)}
            className="w-full py-2.5 rounded-xl text-white font-bold text-sm transition hover:brightness-110 active:scale-95"
            style={{ background: "linear-gradient(135deg,#FF6B35,#FF8C42)" }}
          >
            + Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
