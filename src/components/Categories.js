export default function Categories({ categories, selected, setSelected }) {
  const emojis = {
    "All": "🍽️", "Hot Beverages": "☕", "Cold Beverages & Shakes": "🥤",
    "Snacks": "🍟", "Burgers": "🍔", "Sandwiches": "🥪", "Rolls": "🌯",
    "Mojitos": "🍹", "Veg Pizza": "🍕", "Non Veg Pizza": "🍗", "Desserts": "🍫",
  };

  return (
    <div className="mb-5">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
        {categories.map(cat => {
          const isSelected = selected === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelected(cat)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200"
              style={{
                background: isSelected ? "linear-gradient(135deg,#FF6B35,#FF8C42)" : "#fff",
                color: isSelected ? "#fff" : "#555",
                border: isSelected ? "none" : "1.5px solid #e5e7eb",
                boxShadow: isSelected ? "0 4px 14px rgba(255,107,53,0.35)" : "none",
                transform: isSelected ? "scale(1.05)" : "scale(1)",
              }}
            >
              <span>{emojis[cat] || "🍴"}</span>
              <span>{cat}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
