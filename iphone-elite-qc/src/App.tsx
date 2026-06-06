import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import QCCheckerForm from "./components/QCCheckerForm";
import SalesHistoryLedger from "./components/SalesHistoryLedger";
import StatisticsOverview from "./components/StatisticsOverview";
import SettingsConfig from "./components/SettingsConfig";
import { Transaction, QCPart } from "./types";
import { 
  DEFAULT_PARTS, 
  SAMPLE_TRANSACTIONS, 
  STORAGE_KEY_TRANSACTIONS, 
  STORAGE_KEY_PARTS 
} from "./data";

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState("checker");

  // Mobile sidebar menu drawer state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Global search input query string
  const [searchQuery, setSearchQuery] = useState("");

  // Ledger state containing all transaction records
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Default price multipliers override state
  const [partsConfig, setPartsConfig] = useState<QCPart[]>([]);

  // Load state from client-side persistent storage on initial load
  useEffect(() => {
    // 1. Load transactions
    const storedTrxStr = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (storedTrxStr) {
      try {
        setTransactions(JSON.parse(storedTrxStr));
      } catch (err) {
        setTransactions(SAMPLE_TRANSACTIONS);
      }
    } else {
      // Seed initial mock statistics data for visual excellence
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(SAMPLE_TRANSACTIONS));
      setTransactions(SAMPLE_TRANSACTIONS);
    }

    // 2. Load parts default pricing matrix definitions
    const storedPartsStr = localStorage.getItem(STORAGE_KEY_PARTS);
    if (storedPartsStr) {
      try {
        setPartsConfig(JSON.parse(storedPartsStr));
      } catch (err) {
        setPartsConfig(DEFAULT_PARTS);
      }
    } else {
      localStorage.setItem(STORAGE_KEY_PARTS, JSON.stringify(DEFAULT_PARTS));
      setPartsConfig(DEFAULT_PARTS);
    }
  }, []);

  // Save transaction handler callback
  const handleSaveTransaction = (newTransaction: Transaction) => {
    setTransactions(prev => {
      const updated = [newTransaction, ...prev];
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(updated));
      return updated;
    });
  };

  // Delete transaction handler callback
  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => {
      const filtered = prev.filter(t => t.id !== id);
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(filtered));
      return filtered;
    });
  };

  // Restore dynamic database logic
  const handleRestoreTransactions = (imported: Transaction[]) => {
    setTransactions(imported);
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(imported));
  };

  // Reset database ledger entirely
  const handleResetLedger = () => {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(SAMPLE_TRANSACTIONS));
    setTransactions(SAMPLE_TRANSACTIONS);
  };

  const handleResetAllData = () => {
    localStorage.removeItem(STORAGE_KEY_TRANSACTIONS);
    localStorage.removeItem("iphone_elite_shop_settings");
    setTransactions([]);
  };

  const handleRestoreAllData = (backup: any) => {
    if (backup.transactions) {
      setTransactions(backup.transactions);
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(backup.transactions));
    }
    if (backup.shopSettings) {
      localStorage.setItem("iphone_elite_shop_settings", JSON.stringify(backup.shopSettings));
    }
    window.dispatchEvent(new Event("storage"));
  };

  // Save price matrix overrides callback
  const handleSavePartsConfig = (updated: QCPart[]) => {
    setPartsConfig(updated);
    localStorage.setItem(STORAGE_KEY_PARTS, JSON.stringify(updated));
  };

  // Factory overrides callback
  const handleResetFactoryPartsConfig = () => {
    setPartsConfig(DEFAULT_PARTS);
    localStorage.setItem(STORAGE_KEY_PARTS, JSON.stringify(DEFAULT_PARTS));
  };

  // Map Tab Names cleanly for the Header View title
  const getHeaderTitle = () => {
    switch (activeTab) {
      case "checker":
        return "QC Diagnostic";
      case "history":
        return "Sales History";
      case "statistics":
        return "Operational Statistics";
      case "settings":
        return "App Settings";
      default:
        return "QC Dashboard";
    }
  };

  return (
    <div className="min-h-screen flex bg-dark-base relative overflow-x-hidden">
      {/* 1. Mobile backdrop blur overlay is z-45 */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="no-print fixed inset-0 bg-black/70 backdrop-blur-sm z-45 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* 2. Left Fixed/Floating Navigation Rail */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* 3. Scrollable Canvas Main Wrapper with responsive leftMargin on desktop */}
      <div className="flex-1 lg:ml-[260px] ml-0 min-h-screen flex flex-col transition-all duration-300">
        
        {/* 4. Global Top Bar */}
        <Topbar 
          title={getHeaderTitle()} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onSearchFocus={() => {
            // Automatically flip to history tab if user interacts with Search query
            if (activeTab !== "history" && activeTab !== "statistics") {
              setActiveTab("history");
            }
          }}
        />

        {/* 4. Active Sub-View panel injection */}
        <main className="mt-20 p-8 flex-1 overflow-y-auto max-w-[1600px] w-full mx-auto">
          {activeTab === "checker" && (
            <QCCheckerForm 
              onSaveTransaction={handleSaveTransaction} 
              partsConfig={partsConfig}
            />
          )}

          {activeTab === "history" && (
            <SalesHistoryLedger 
              transactions={transactions}
              onDeleteTransaction={handleDeleteTransaction}
              onRestoreTransactions={handleRestoreTransactions}
              onResetLedger={handleResetLedger}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === "statistics" && (
            <StatisticsOverview transactions={transactions} />
          )}

          {activeTab === "settings" && (
            <SettingsConfig 
              onResetAllData={handleResetAllData}
              onRestoreAllData={handleRestoreAllData}
              transactionsCount={transactions.length}
            />
          )}
        </main>
      </div>
    </div>
  );
}
