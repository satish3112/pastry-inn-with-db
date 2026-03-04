// Initial menu data — will be overridden by admin changes stored in localStorage
const menuData = [
  // ☕ Hot Beverages
  { id: 1, name: "Filter Coffee", desc: "Freshly brewed South Indian filter coffee", price: 40, category: "Hot Beverages", image: "", available: true },

  // 🍟 Snacks
  { id: 2, name: "French Fries", desc: "Crispy golden fries with dipping sauce", price: 70, category: "Snacks", image: "", available: true },
  { id: 3, name: "KFC Chicken Popcorn (16 nos)", desc: "Crispy bite-sized chicken popcorn", price: 160, category: "Snacks", image: "", available: true },
  { id: 4, name: "KFC Chicken Wings (8 nos)", desc: "Spicy and crunchy chicken wings", price: 160, category: "Snacks", image: "", available: true },
  { id: 5, name: "KFC Chicken Lollipop (4 nos)", desc: "Delicious deep-fried chicken lollipops", price: 160, category: "Snacks", image: "", available: true },
  { id: 6, name: "KFC Strips Boneless (6 nos)", desc: "Tender boneless chicken strips", price: 160, category: "Snacks", image: "", available: true },

  // 🧋 Cold Coffee & Shakes
  { id: 7, name: "Cold Coffee", desc: "Iced coffee with creamy froth", price: 100, category: "Cold Beverages & Shakes", image: "", available: true },
  { id: 8, name: "Chocolate Cold Coffee", desc: "Cold coffee blended with rich chocolate", price: 120, category: "Cold Beverages & Shakes", image: "", available: true },
  { id: 9, name: "Strawberry Shake", desc: "Sweet strawberry flavored thick shake", price: 120, category: "Cold Beverages & Shakes", image: "", available: true },
  { id: 10, name: "Mango Shake", desc: "Refreshing mango milkshake", price: 120, category: "Cold Beverages & Shakes", image: "", available: true },
  { id: 11, name: "Black Currant Shake", desc: "Fruity black currant flavored shake", price: 120, category: "Cold Beverages & Shakes", image: "", available: true },
  { id: 12, name: "Vanilla Shake", desc: "Classic creamy vanilla milkshake", price: 120, category: "Cold Beverages & Shakes", image: "", available: true },
  { id: 13, name: "Chocolate Shake", desc: "Rich and creamy chocolate shake", price: 120, category: "Cold Beverages & Shakes", image: "", available: true },
  { id: 14, name: "Kit Kat Shake", desc: "Kit Kat blended milkshake with crunch", price: 130, category: "Cold Beverages & Shakes", image: "", available: true },
  { id: 15, name: "Brownie Shake", desc: "Brownie blended thick shake", price: 130, category: "Cold Beverages & Shakes", image: "", available: true },

  // 🥪 Sandwiches
  { id: 16, name: "Corn Sandwich", desc: "Grilled sandwich stuffed with spiced corn", price: 80, category: "Sandwiches", image: "", available: true },
  { id: 17, name: "Paneer Sandwich", desc: "Grilled paneer sandwich with chutneys", price: 100, category: "Sandwiches", image: "", available: true },
  { id: 18, name: "Chicken Sandwich", desc: "Grilled chicken sandwich", price: 100, category: "Sandwiches", image: "", available: true },
  { id: 19, name: "Tandoori Chicken Sandwich", desc: "Tandoori-spiced chicken sandwich", price: 120, category: "Sandwiches", image: "", available: true },

  // 🍔 Burgers
  { id: 20, name: "Veg Burger", desc: "Crispy veg patty burger with sauces", price: 80, category: "Burgers", image: "", available: true },
  { id: 21, name: "Cheese Burger", desc: "Cheesy delight with soft toasted bun", price: 100, category: "Burgers", image: "", available: true },
  { id: 22, name: "Chicken Burger", desc: "Juicy grilled chicken burger", price: 100, category: "Burgers", image: "", available: true },
  { id: 23, name: "Chicken Cheese Burger", desc: "Loaded with melted cheese and chicken patty", price: 120, category: "Burgers", image: "", available: true },

  // 🍹 Mojitos
  { id: 24, name: "Blue Mojito", desc: "Refreshing blue mint cooler", price: 80, category: "Mojitos", image: "", available: true },
  { id: 25, name: "Virgin Mojito", desc: "Classic lime and mint mocktail", price: 80, category: "Mojitos", image: "", available: true },
  { id: 26, name: "Watermelon Mojito", desc: "Cool watermelon mocktail", price: 80, category: "Mojitos", image: "", available: true },
  { id: 27, name: "Strawberry Mojito", desc: "Sweet strawberry mint drink", price: 80, category: "Mojitos", image: "", available: true },
  { id: 28, name: "Double Berry Mojito", desc: "Mixed berry refreshing mojito", price: 80, category: "Mojitos", image: "", available: true },
  { id: 29, name: "Blueberry Mojito", desc: "Blueberry-infused mint drink", price: 80, category: "Mojitos", image: "", available: true },

  // 🍫 Desserts
  { id: 30, name: "Brownie with Chocolate Syrup", desc: "Warm brownie with rich chocolate sauce", price: 90, category: "Desserts", image: "", available: true },
  { id: 31, name: "Brownie with Ice Cream", desc: "Hot brownie topped with vanilla ice cream", price: 120, category: "Desserts", image: "", available: true },

  // 🌯 Rolls
  { id: 32, name: "Corn Roll", desc: "Soft paratha roll filled with spiced corn", price: 80, category: "Rolls", image: "", available: true },
  { id: 33, name: "Paneer Tikka Roll", desc: "Paneer tikka wrapped in butter paratha", price: 100, category: "Rolls", image: "", available: true },
  { id: 34, name: "Chicken Tikka Roll", desc: "Spicy chicken tikka roll", price: 100, category: "Rolls", image: "", available: true },
  { id: 35, name: "Tandoori Chicken Roll", desc: "Smoky tandoori chicken wrapped roll", price: 100, category: "Rolls", image: "", available: true },

  // 🍕 Veg Pizza
  { id: 36, name: "Corn Pizza", desc: "Cheesy pizza generously topped with corn", price: 160, category: "Veg Pizza", image: "", available: true },
  { id: 37, name: "Capsicum and Onion Pizza", desc: "Classic pizza with fresh onion & capsicum", price: 160, category: "Veg Pizza", image: "", available: true },
  { id: 38, name: "Paneer Tikka Pizza", desc: "Spicy paneer tikka on crispy base", price: 180, category: "Veg Pizza", image: "", available: true },
  { id: 39, name: "Paneer and Corn Pizza", desc: "Cheesy pizza with paneer & corn combo", price: 180, category: "Veg Pizza", image: "", available: true },
  { id: 40, name: "Mushroom Pizza", desc: "Loaded with sautéed mushrooms and cheese", price: 180, category: "Veg Pizza", image: "", available: true },
  { id: 41, name: "Mushroom and Paneer Pizza", desc: "Double delight with paneer and mushroom", price: 180, category: "Veg Pizza", image: "", available: true },
  { id: 42, name: "Veg Paradise", desc: "Loaded veggie delight pizza", price: 200, category: "Veg Pizza", image: "", available: true },

  // 🍗 Non Veg Pizza
  { id: 43, name: "Chicken Tikka Pizza", desc: "Spicy chicken tikka topping on cheesy base", price: 200, category: "Non Veg Pizza", image: "", available: true },
  { id: 44, name: "Tandoori Chicken Pizza", desc: "Smoky tandoori-style spicy chicken pizza", price: 200, category: "Non Veg Pizza", image: "", available: true },
  { id: 45, name: "Chicken Golden Delight", desc: "Golden cheese and tender chicken topping", price: 220, category: "Non Veg Pizza", image: "", available: true },
  { id: 46, name: "Chicken Supreme", desc: "Loaded with extra chicken, peppers & cheese", price: 230, category: "Non Veg Pizza", image: "", available: true },
];

export default menuData;
