const menuData = [

  // ☕ Hot Beverages
  { id: 1, name: "Filter Coffee", desc: "Freshly brewed South Indian filter coffee", price: 40, category: "Hot Beverages", available: true,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&fit=crop&q=80" },

  // 🍟 Snacks
  { id: 2, name: "French Fries", desc: "Crispy golden fries with dipping sauce", price: 70, category: "Snacks", available: true,
  image: "https://images.unsplash.com/photo-1630431341973-02e1b662ec35?w=400&fit=crop&q=80" },

  { id: 3, name: "KFC Chicken Popcorn (16 nos)", desc: "Crispy bite-sized chicken popcorn", price: 160, category: "Snacks", available: true,
    image: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&fit=crop&q=80" },

  { id: 4, name: "KFC Chicken Wings (8 nos)", desc: "Spicy and crunchy chicken wings", price: 160, category: "Snacks", available: true,
    image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&fit=crop&q=80" },

  { id: 5, name: "KFC Chicken Lollipop (4 nos)", desc: "Delicious deep-fried chicken lollipops", price: 160, category: "Snacks", available: true,
    image: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=400&fit=crop&q=80" },

  { id: 6, name: "KFC Strips Boneless (6 nos)", desc: "Tender boneless chicken strips", price: 160, category: "Snacks", available: true,
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&fit=crop&q=80"},

  // 🧋 Cold Coffee & Shakes
  { id: 7, name: "Cold Coffee", desc: "Iced coffee with creamy froth", price: 100, category: "Cold Beverages & Shakes", available: true,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&fit=crop&q=80" },

  { id: 8, name: "Chocolate Cold Coffee", desc: "Cold coffee blended with rich chocolate", price: 120, category: "Cold Beverages & Shakes", available: true,
    image: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400&fit=crop&q=80" },

  { id: 9, name: "Strawberry Shake", desc: "Sweet strawberry flavored thick shake", price: 120, category: "Cold Beverages & Shakes", available: true,
    image: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&fit=crop&q=80" },

  { id: 10, name: "Mango Shake", desc: "Refreshing mango milkshake", price: 120, category: "Cold Beverages & Shakes", available: true,
    image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=400&fit=crop&q=80" },

  { id: 11, name: "Black Currant Shake", desc: "Fruity black currant flavored shake", price: 120, category: "Cold Beverages & Shakes", available: true,
    image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&fit=crop&q=80" },

  { id: 12, name: "Vanilla Shake", desc: "Classic creamy vanilla milkshake", price: 120, category: "Cold Beverages & Shakes", available: true,
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&fit=crop&q=80" },

  { id: 13, name: "Chocolate Shake", desc: "Rich and creamy chocolate shake", price: 120, category: "Cold Beverages & Shakes", available: true,
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&fit=crop&q=80" },

  { id: 14, name: "Kit Kat Shake", desc: "Kit Kat blended milkshake with crunch", price: 130, category: "Cold Beverages & Shakes", available: true,
    image: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=400&fit=crop&q=80" },

  { id: 15, name: "Brownie Shake", desc: "Brownie blended thick shake", price: 130, category: "Cold Beverages & Shakes", available: true,
    image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&fit=crop&q=80"},

  // 🥪 Sandwiches
  { id: 16, name: "Corn Sandwich", desc: "Grilled sandwich stuffed with spiced corn", price: 80, category: "Sandwiches", available: true,
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&fit=crop&q=80" },

  { id: 17, name: "Paneer Sandwich", desc: "Grilled paneer sandwich with chutneys", price: 100, category: "Sandwiches", available: true,
    image: "https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?w=400&fit=crop&q=80" },

  { id: 18, name: "Chicken Sandwich", desc: "Grilled chicken sandwich", price: 100, category: "Sandwiches", available: true,
    image: "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=400&fit=crop&q=80" },

  { id: 19, name: "Tandoori Chicken Sandwich", desc: "Tandoori-spiced chicken sandwich", price: 120, category: "Sandwiches", available: true,
    image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&fit=crop&q=80" },

  // 🍔 Burgers
  { id: 20, name: "Veg Burger", desc: "Crispy veg patty burger with sauces", price: 80, category: "Burgers", available: true,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&fit=crop&q=80" },

  { id: 21, name: "Cheese Burger", desc: "Cheesy delight with soft toasted bun", price: 100, category: "Burgers", available: true,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&fit=crop&q=80" },

  { id: 22, name: "Chicken Burger", desc: "Juicy grilled chicken burger", price: 100, category: "Burgers", available: true,
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&fit=crop&q=80" },

  { id: 23, name: "Chicken Cheese Burger", desc: "Loaded with melted cheese and chicken patty", price: 120, category: "Burgers", available: true,
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&fit=crop&q=80" },

  // 🍹 Mojitos
  { id: 24, name: "Blue Mojito", desc: "Refreshing blue mint cooler", price: 80, category: "Mojitos", available: true,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&fit=crop&q=80" },

  { id: 25, name: "Virgin Mojito", desc: "Classic lime and mint mocktail", price: 80, category: "Mojitos", available: true,
    image: "https://images.unsplash.com/photo-1609951651556-5334e2706168?w=400&fit=crop&q=80" },

  { id: 26, name: "Watermelon Mojito", desc: "Cool watermelon mocktail", price: 80, category: "Mojitos", available: true,
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&fit=crop&q=80" },

  { id: 27, name: "Strawberry Mojito", desc: "Sweet strawberry mint drink", price: 80, category: "Mojitos", available: true,
    image: "https://images.unsplash.com/photo-1560508180-03f285f67ded?w=400&fit=crop&q=80" },

  { id: 28, name: "Double Berry Mojito", desc: "Mixed berry refreshing mojito", price: 80, category: "Mojitos", available: true,
    image: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=400&fit=crop&q=80" },

  { id: 29, name: "Blueberry Mojito", desc: "Blueberry-infused mint drink", price: 80, category: "Mojitos", available: true,
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&fit=crop&q=80" },

  // 🍫 Desserts
  { id: 30, name: "Brownie with Chocolate Syrup", desc: "Warm brownie with rich chocolate sauce", price: 90, category: "Desserts", available: true,
    image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&fit=crop&q=80" },

  { id: 31, name: "Brownie with Ice Cream", desc: "Hot brownie topped with vanilla ice cream", price: 120, category: "Desserts", available: true,
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&fit=crop&q=80" },

  // 🌯 Rolls
  { id: 32, name: "Corn Roll", desc: "Soft paratha roll filled with spiced corn", price: 80, category: "Rolls", available: true,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&fit=crop&q=80" },

  { id: 33, name: "Paneer Tikka Roll", desc: "Paneer tikka wrapped in butter paratha", price: 100, category: "Rolls", available: true,
    image: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400&fit=crop&q=80" },

  { id: 34, name: "Chicken Tikka Roll", desc: "Spicy chicken tikka roll", price: 100, category: "Rolls", available: true,
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400&fit=crop&q=80" },

  { id: 35, name: "Tandoori Chicken Roll", desc: "Smoky tandoori chicken wrapped roll", price: 100, category: "Rolls", available: true,
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&fit=crop&q=80" },

  // 🍕 Veg Pizza
  { id: 36, name: "Corn Pizza", desc: "Cheesy pizza generously topped with corn", price: 160, category: "Veg Pizza", available: true,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&fit=crop&q=80" },

  { id: 37, name: "Capsicum and Onion Pizza", desc: "Classic pizza with fresh onion & capsicum", price: 160, category: "Veg Pizza", available: true,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&fit=crop&q=80" },

  { id: 38, name: "Paneer Tikka Pizza", desc: "Spicy paneer tikka on crispy base", price: 180, category: "Veg Pizza", available: true,
    image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400&fit=crop&q=80" },

  { id: 39, name: "Paneer and Corn Pizza", desc: "Cheesy pizza with paneer & corn combo", price: 180, category: "Veg Pizza", available: true,
    image: "https://images.unsplash.com/photo-1601924582970-9238bcb495d9?w=400&fit=crop&q=80" },

  { id: 40, name: "Mushroom Pizza", desc: "Loaded with sautéed mushrooms and cheese", price: 180, category: "Veg Pizza", available: true,
    image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&fit=crop&q=80" },

  { id: 41, name: "Mushroom and Paneer Pizza", desc: "Double delight with paneer and mushroom", price: 180, category: "Veg Pizza", available: true,
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&fit=crop&q=80" },

    
  { id: 42, name: "Veg Paradise", desc: "Loaded veggie delight pizza", price: 200, category: "Veg Pizza", available: true,
    image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&fit=crop&q=80" },

  // 🍗 Non Veg Pizza
  { id: 43, name: "Chicken Tikka Pizza", desc: "Spicy chicken tikka topping on cheesy base", price: 200, category: "Non Veg Pizza", available: true,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&fit=crop&q=80" },

  { id: 44, name: "Tandoori Chicken Pizza", desc: "Smoky tandoori-style spicy chicken pizza", price: 200, category: "Non Veg Pizza", available: true,
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&fit=crop&q=80" },

  { id: 45, name: "Chicken Golden Delight", desc: "Golden cheese and tender chicken topping", price: 220, category: "Non Veg Pizza", available: true,
    image: "https://images.unsplash.com/photo-1548369937-47519962c11a?w=400&fit=crop&q=80" },

  { id: 46, name: "Chicken Supreme", desc: "Loaded with extra chiocken, peppers & cheese", price: 230, category: "Non Veg Pizza", available: true,
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&fit=crop&q=80" },

];

export default menuData;