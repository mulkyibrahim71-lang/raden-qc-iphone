import { Search, Bell, Menu } from "lucide-react";

interface TopbarProps {
  title: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearchFocus?: () => void;
  onToggleSidebar?: () => void;
}

export default function Topbar({ title, searchQuery, setSearchQuery, onSearchFocus, onToggleSidebar }: TopbarProps) {
  return (
    <header className="no-print fixed top-0 right-0 lg:left-[260px] left-0 h-20 bg-[#050505]/85 backdrop-blur-[24px] border-b border-white/10 z-40 flex justify-between items-center px-4 sm:px-8 lg:px-10">
      <div className="flex items-center space-x-2.5 sm:space-x-4 min-w-0">
        {/* Burger menu button on mobile */}
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-white/50 hover:text-white hover:bg-white/5 transition-all cursor-pointer rounded-[2px]"
          title="Open Menu"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>

        <div className="w-[1px] h-5 bg-white/30 hidden sm:block"></div>
        <h2 className="font-display text-[11px] sm:text-xs tracking-[0.18em] sm:tracking-[0.25em] uppercase font-bold text-white/90 truncate max-w-[130px] sm:max-w-none">
          {title}
        </h2>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-6 shrink-0">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 w-3.5 h-3.5 group-focus-within:text-white transition-colors duration-200" />
          <input
            type="text"
            placeholder="SEARCH..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={onSearchFocus}
            className="w-24 sm:w-44 md:w-60 bg-white/5 text-white placeholder-white/35 text-[9px] sm:text-[10px] tracking-[0.1em] uppercase py-2 pl-10 pr-3 sm:pr-6 border border-white/10 focus:border-white focus:ring-0 outline-none transition-all duration-300 rounded-none font-medium"
          />
        </div>

        <div className="flex items-center gap-3 sm:gap-4 border-l border-white/10 pl-3 sm:pl-6">
          <button className="relative text-white/50 hover:text-white transition-colors duration-200 cursor-pointer p-1">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full" />
          </button>

          
          <div className="h-9 w-9 rounded-none bg-white/10 flex items-center justify-center text-white font-bold overflow-hidden border border-white/10">
            <img
              className="w-full h-full object-cover filter grayscale contrast-125 hover:grayscale-0 transition-all duration-300"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKSu0q6Vh7NlXbVQfoRMr9qigrqiv3R90jUBoP2vKY-s-SYAJzbN9yAPp5FjXx3DUYIi_VXlK-8ZuM_V0-5UGeV4P2P1uBb8PpszCrhCkHNMh_M-Kv8uGVWJ7dcv5M7zvioOTs6mMIPXdTdkLTHEloezaiy09OPJnpUMmRLqbqUM6rhp0PSpQAuu2cUtAYj3AVAyYm7tNp8rPCp20p97REAjcwGLX8daQYpTIR8pCIjy-e4IUvPpkCalwtFWjp5FUE8am7SxWWC6P-"
              alt="Professional engineer portrait"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
