import MenuCard from "./MenuCard";

export default function MenuList({ items, cart, addToCart, updateQty }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <span className="text-6xl">🍽️</span>
        <p className="text-gray-400 mt-4 text-lg font-semibold">No items found</p>
        <p className="text-gray-300 text-sm mt-1">Try a different search or category</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map(item => (
        <MenuCard
          key={item.id}
          item={item}
          cartItem={cart.find(c => c.id === item.id)}
          addToCart={addToCart}
          updateQty={updateQty}
        />
      ))}
    </div>
  );
}
