import { useState, useEffect } from "react";
import { ClipboardCheck, History, BarChart3, Settings, LogOut, Smartphone, X, Search, Package } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen }: SidebarProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [shopName, setShopName] = useState("VANTAGE LUXE");

  useEffect(() => {
    const saved = localStorage.getItem("iphone_elite_shop_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.shopName) {
          setShopName(parsed.shopName);
        }
      } catch (e) {}
    }
  }, [activeTab]);

  const menuItems = [
    {
      id: "checker",
      label: "QC Checker",
      icon: Search,
    },
    {
      id: "history",
      label: "Riwayat Penjualan",
      icon: Package,
    },
    {
      id: "statistics",
      label: "Statistik",
      icon: BarChart3,
    },
    {
      id: "settings",
      label: "Pengaturan",
      icon: Settings,
    },
  ];

  return (
    <aside className={`no-print fixed top-0 left-0 bottom-0 w-[260px] bg-[#050505] border-r border-white/10 flex flex-col py-8 z-50 transition-transform duration-300 ${
      isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    }`}>
      <div className="px-6 mb-12 flex justify-between items-center">
        <div className="flex items-center space-x-3 mb-1 min-w-0">
          <div className="w-7 h-7 bg-white flex items-center justify-center rounded-sm shadow-xl shrink-0">
            <span className="text-black font-serif italic font-bold text-xs">V.</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-medium tracking-[0.25em] text-white uppercase font-display leading-none truncate max-w-[150px]">{shopName}</span>
            <span className="text-[8px] font-medium tracking-[0.15em] text-white/40 uppercase mt-1 leading-none">iPhone Elite QC</span>
          </div>
        </div>

        {/* Close Button on Mobile Drawer */}
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden p-1.5 text-white/45 hover:text-white hover:bg-white/5 transition-all cursor-pointer rounded-[2px]"
          title="Close drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-1.5 px-4">
        <div className="px-3 mb-4">
          <span className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold block">
            Core Modules
          </span>
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false); // Auto close mobile sidebar
              }}
              className={`w-full flex items-center gap-3 py-3 px-3.5 rounded-sm font-medium text-[11px] tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer text-left ${
                isActive
                  ? "bg-white/5 text-white border-l border-white pl-4"
                  : "text-white/45 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 opacity-80 ${isActive ? "text-white" : "text-white/40"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>



      <div className="px-4 pt-6 border-t border-white/10">
        {!showLogoutConfirm ? (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 py-3 px-3.5 rounded-sm font-medium text-[11px] tracking-[0.15em] uppercase text-white/45 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4 text-white/40 shrink-0" />
            <span>Logout</span>
          </button>
        ) : (
          <div className="bg-red-500/5 border border-red-500/15 p-3 rounded-none text-center space-y-2">
            <p className="text-[8px] tracking-[0.15em] uppercase font-bold text-red-400">Confirm Exit?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-none text-[8px] tracking-[0.2em] uppercase font-bold cursor-pointer transition-colors"
              >
                No
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  // Dynamic user experience confirmation callback
                }}
                className="flex-1 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-none text-[8px] tracking-[0.2em] uppercase font-bold cursor-pointer transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
