export default function Footer({ activeTab, onTabChange, cartCount, ordersCount }) {
  const tabs = [
    { id: "home",    icon: "🏠", label: "Home" },
    { id: "cart",    icon: "🛒", label: "Cart",    badge: cartCount },
    { id: "orders",  icon: "📋", label: "Orders",  badge: ordersCount },
    { id: "account", icon: "👤", label: "Account" },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t"
      style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.08)", borderColor: "#f0f0f0" }}
    >
      <div className="flex items-center justify-around px-2 py-1 max-w-lg mx-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col items-center gap-0.5 py-2 px-5 rounded-xl transition relative"
            style={{ color: activeTab === tab.id ? "#FF6B35" : "#9ca3af" }}
          >
            <span className="text-2xl relative">
              {tab.icon}
              {tab.badge > 0 && (
                <span
                  className="absolute -top-1 -right-2 bg-red-500 text-white rounded-full flex items-center justify-center font-black"
                  style={{ fontSize: 9, minWidth: 16, height: 16, padding: "0 3px" }}
                >
                  {tab.badge}
                </span>
              )}
            </span>
            <span className="font-bold" style={{ fontSize: 10 }}>{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full"
                style={{ background: "#FF6B35" }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}