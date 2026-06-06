import React, { useState } from "react";
import { 
  FileJson, 
  Plus, 
  Trash2, 
  Eye, 
  Printer, 
  History, 
  TrendingUp, 
  Coins, 
  DollarSign, 
  Layers, 
  Sparkles, 
  Search, 
  Upload, 
  RefreshCw,
  FolderSync
} from "lucide-react";
import { Transaction } from "../types";
import { formatIDR } from "../utils";
import { IPHONE_MODELS } from "../data";

interface SalesHistoryLedgerProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onRestoreTransactions: (imported: Transaction[]) => void;
  onResetLedger: () => void;
  searchQuery: string;
}

export default function SalesHistoryLedger({ 
  transactions, 
  onDeleteTransaction, 
  onRestoreTransactions,
  onResetLedger,
  searchQuery
}: SalesHistoryLedgerProps) {
  
  // Filtering states
  const [modelFilter, setModelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Detailed Modal overlay View State
  const [activeDetailsId, setActiveDetailsId] = useState<string | null>(null);

  // Delete Confirm Modal State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Reset ledger confirm prompt boolean
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Filter calculations
  const filteredTransactions = transactions.filter(t => {
    const term = searchQuery.toLowerCase();
    const nameMatch = t.customerName.toLowerCase().includes(term);
    const modelMatchStr = t.deviceModel.toLowerCase().includes(term);
    const idMatch = t.id.toLowerCase().includes(term);
    const matchesSearch = nameMatch || modelMatchStr || idMatch;

    const matchesModel = modelFilter === "all" || t.deviceModel === modelFilter;
    
    let matchesStatus = true;
    if (statusFilter === "PASS") {
      matchesStatus = t.eligibility === "LAYAK BELI" || t.eligibility === "PERTIMBANGKAN";
    } else if (statusFilter === "FAIL") {
      matchesStatus = t.eligibility === "BERESIKO TINGGI";
    }

    return matchesSearch && matchesModel && matchesStatus;
  });

  // KPI Metrics sum calculation
  const totalCount = filteredTransactions.length;
  const totalRevenue = filteredTransactions.reduce((acc, curr) => acc + curr.sellPrice, 0);
  const totalCapital = filteredTransactions.reduce((acc, curr) => acc + (curr.buyPrice + curr.totalRepairCost), 0);
  const totalProfit = filteredTransactions.reduce((acc, curr) => acc + curr.netProfit, 0);
  const avgProfit = totalCount > 0 ? totalProfit / totalCount : 0;

  // Render Stats Cards
  const stats = [
    {
      title: "TOTAL TRANSACTIONS",
      value: totalCount.toLocaleString(),
      subtext: "+12% this month",
      icon: History,
      highlight: false
    },
    {
      title: "TOTAL REVENUE",
      value: formatIDR(totalRevenue),
      subtext: "Vol: Real-time",
      icon: DollarSign,
      highlight: false
    },
    {
      title: "TOTAL CAPITAL",
      value: formatIDR(totalCapital),
      subtext: "Buy Costs & Repair",
      icon: Coins,
      highlight: false
    },
    {
      title: "TOTAL PROFIT",
      value: formatIDR(totalProfit),
      subtext: `Margin: ${totalCapital > 0 ? Math.round((totalProfit / totalCapital) * 100) : 0}%`,
      icon: TrendingUp,
      highlight: true
    },
    {
      title: "AVG PROFIT / UNIT",
      value: formatIDR(Math.round(avgProfit)),
      subtext: "Yield Performance",
      icon: Layers,
      highlight: false
    }
  ];

  // Export JSON Database Backup
  const handleBackup = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `iPhone_Elite_QC_Ledger_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Restore Database via User JSON Input
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          onRestoreTransactions(imported);
          alert("Database Ledger berhasil dipulihkan!");
        } else {
          alert("Format file cadangan tidak valid!");
        }
      } catch (err) {
        alert("Gagal membaca file cadangan!");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // reset
  };

  // Select Transaction for Detail Panel
  const activeDetailObj = transactions.find(t => t.id === activeDetailsId);

  return (
    <div className="space-y-8">
      
      {/* 5-Column Statistics Cards */}
      <section className="no-print grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.title}
              className={`premium-card p-6 rounded-none space-y-2 relative overflow-hidden group transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.04)] ${
                stat.highlight ? "border-white/40" : ""
              }`}
            >
              <p className="text-white/40 font-bold text-[9px] tracking-[0.2em] uppercase">
                {stat.title}
              </p>
              <h3 className={`font-mono text-xl font-bold tracking-tight ${stat.highlight ? "text-white" : "text-white/90"}`}>
                {stat.value}
              </h3>
              <div className="text-white/60 font-semibold text-[10px] tracking-wider uppercase flex items-center gap-1">
                <span>{stat.subtext}</span>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-8 transition-all duration-300 text-white">
                <Icon className="w-20 h-20" />
              </div>
            </div>
          );
        })}
      </section>

      {/* Filters & Actions Panel */}
      <section className="no-print flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="premium-card flex items-center px-4 py-2 rounded-none gap-3">
            <select 
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="bg-transparent border-none text-[11px] tracking-wider uppercase text-white focus:ring-0 cursor-pointer outline-none font-medium pr-8"
            >
              <option value="all" className="bg-[#121212] text-white">ALL MODELS</option>
              {IPHONE_MODELS.map(model => (
                <option key={model} value={model} className="bg-[#121212] text-white">{model.toUpperCase()}</option>
              ))}
            </select>
            <div className="w-[1px] h-4 bg-white/10" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-[11px] tracking-wider uppercase text-white focus:ring-0 cursor-pointer outline-none font-medium pr-8"
            >
              <option value="all" className="bg-[#121212] text-white">ALL QC STATUS</option>
              <option value="PASS" className="bg-[#121212] text-white">INVESTMENT PASS</option>
              <option value="FAIL" className="bg-[#121212] text-white">HIGH RISK OVERHEAD</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="border border-white bg-transparent text-white hover:bg-white hover:text-black font-semibold px-6 py-3 rounded-none flex items-center gap-2 transition-all cursor-pointer text-[11px] tracking-[0.2em] uppercase hover:shadow-[0_0_15px_rgba(255,255,255,0.15)]"
          >
            <Printer className="w-4 h-4" />
            <span>EXPORT PDF REPORT</span>
          </button>
        </div>
      </section>

      {/* Main Transactions Ledger Layout */}
      <section className="premium-card rounded-none overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.01]">
          <h4 className="font-display text-xs font-bold text-white uppercase tracking-[0.2em]">Transaction Ledger</h4>
          <span className="text-white/40 font-medium text-[10px] uppercase tracking-wider">
            Showing {filteredTransactions.length} of {transactions.length} entries
          </span>
        </div>

        <div className="overflow-x-auto min-h-[350px]">
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/30">
              <History className="w-12 h-12 mb-4 opacity-15" />
              <p className="text-[11px] tracking-[0.2em] uppercase font-semibold opacity-50">No transactions recorded</p>
              <p className="text-[10px] tracking-wider opacity-30 uppercase mt-1">Initiate a Diagnostic session to generate logs.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-white/40 font-bold text-[9px] tracking-[0.18em] uppercase border-b border-white/10">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">DATE</th>
                  <th className="px-6 py-4">CLIENT NAME</th>
                  <th className="px-6 py-4">MODEL VARIANT</th>
                  <th className="px-6 py-4">STORAGE</th>
                  <th className="px-6 py-4">BUY PRICE</th>
                  <th className="px-6 py-4">RETAIL VALUE</th>
                  <th className="px-6 py-4">SPREAD MARGIN</th>
                  <th className="px-6 py-4 text-center">VERDICT</th>
                  <th className="px-6 py-4 text-right no-print">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTransactions.map((t) => {
                  const isPass = t.eligibility === "LAYAK BELI" || t.eligibility === "PERTIMBANGKAN";
                  const profitColor = t.netProfit >= 0 ? "text-emerald-400" : "text-amber-500";
                  const statusClass = isPass
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-500 border-red-500/20";
                  
                  return (
                    <tr 
                      key={t.id} 
                      className="hover:bg-white/[0.03] transition-colors duration-200 group"
                    >
                      <td className="px-6 py-4.5 font-mono text-white/50 text-xs">{t.id}</td>
                      <td className="px-6 py-4.5 text-white/50 text-xs font-mono">{t.date}</td>
                      <td className="px-6 py-4.5 text-white font-semibold text-[13px] tracking-wide uppercase">{t.customerName}</td>
                      <td className="px-6 py-4.5 text-white font-medium text-[13px] tracking-wide uppercase">{t.deviceModel}</td>
                      <td className="px-6 py-4.5 font-mono text-white/50 text-xs">{t.deviceStorage}</td>
                      <td className="px-6 py-4.5 font-mono text-white/50 text-xs">{formatIDR(t.buyPrice)}</td>
                      <td className="px-6 py-4.5 font-mono text-white/50 text-xs">{formatIDR(t.sellPrice)}</td>
                      <td className={`px-6 py-4.5 font-mono ${profitColor} font-semibold text-xs`}>
                        {t.netProfit >= 0 ? "+" : ""}{formatIDR(t.netProfit)}
                      </td>
                      <td className="px-6 py-4.5 text-center">
                        <span className={`border text-[9px] font-bold px-2.5 py-1 rounded-none uppercase tracking-widest ${statusClass}`}>
                          {isPass ? "PASS" : "FAIL"}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-right no-print">
                        <div className="flex justify-end gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button 
                            onClick={() => setActiveDetailsId(t.id)}
                            className="p-1.5 hover:bg-white/10 rounded-none text-white cursor-pointer" 
                            title="Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => {
                              setActiveDetailsId(t.id);
                              setTimeout(() => window.print(), 350);
                            }}
                            className="p-1.5 hover:bg-white/10 rounded-none text-white/60 cursor-pointer" 
                            title="Print Session Certificate"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmId(t.id)}
                            className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-none text-red-500 cursor-pointer" 
                            title="Delete Ledger Log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Database Backup & Cleaning tools */}
      <section className="no-print premium-card p-8 rounded-none border-l border-white/40">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h4 className="font-display text-xs font-bold text-white uppercase tracking-[0.2em]">Maintenance & Vault backup</h4>
            <p className="text-white/40 font-medium text-[11px] uppercase tracking-wide mt-1">
              Store or restore secure cryptographic records.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => document.getElementById("restoreDatabaseFile")?.click()}
              className="bg-transparent border border-white/10 hover:border-white/30 hover:bg-white/[0.03] active:scale-98 text-white font-medium px-5 py-2.5 rounded-none flex items-center gap-2 transition-all cursor-pointer text-[10px] tracking-[0.15em] uppercase"
            >
              <Upload className="w-3.5 h-3.5 opacity-75" />
              <span>Import Records</span>
            </button>
            <input 
              type="file" 
              id="restoreDatabaseFile" 
              accept=".json"
              onChange={handleRestoreFile}
              className="hidden" 
            />

            <button 
              onClick={handleBackup}
              className="bg-transparent border border-white/10 hover:border-white/30 hover:bg-white/[0.03] active:scale-98 text-white font-medium px-5 py-2.5 rounded-none flex items-center gap-2 transition-all cursor-pointer text-[10px] tracking-[0.15em] uppercase"
            >
              <FolderSync className="w-3.5 h-3.5 opacity-75" />
              <span>Export Ledger Backup</span>
            </button>

            <button 
              onClick={() => setShowResetConfirm(true)}
              className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 active:scale-98 text-red-400 font-semibold px-5 py-2.5 rounded-none flex items-center gap-2 transition-all cursor-pointer text-[10px] tracking-[0.15em] uppercase"
            >
              <RefreshCw className="w-3.5 h-3.5 text-red-400" />
              <span>Reset Ledger</span>
            </button>
          </div>
        </div>
      </section>

      {/* Transactions details modal card overlay */}
      {activeDetailObj && (
        <div className="fixed inset-0 bg-black/85 z-150 flex items-center justify-center p-4">
          <div className="premium-card w-full max-w-2xl rounded-none overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <h3 className="font-display font-bold text-white text-xs uppercase tracking-[0.2em]">
                DIAGNOSTIC ARCHIVE {activeDetailObj.id}
              </h3>
              <button 
                onClick={() => setActiveDetailsId(null)}
                className="text-white/40 hover:text-white font-bold px-3.5 py-1.5 border border-white/15 bg-transparent rounded-none text-[9px] tracking-wider uppercase cursor-pointer transition-colors"
              >
                Close Window
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Spec and stats row */}
              <div className="grid grid-cols-2 gap-6 bg-white/[0.01] rounded-none p-4 border border-white/10">
                <div>
                  <h5 className="text-white/40 text-[9px] font-bold uppercase tracking-[0.2em] mb-2">Customer Profile</h5>
                  <p className="text-white font-semibold text-[13px] tracking-wide uppercase">{activeDetailObj.customerName}</p>
                  <p className="text-white/60 text-xs font-mono mt-1">{activeDetailObj.customerWa || "-"}</p>
                </div>
                <div>
                  <h5 className="text-white/40 text-[9px] font-bold uppercase tracking-[0.2em] mb-2">Device Specification</h5>
                  <p className="text-white font-semibold text-[13px] tracking-wide uppercase">{activeDetailObj.deviceModel} ({activeDetailObj.deviceStorage})</p>
                  <p className="text-white/60 text-xs mt-1 uppercase tracking-wide">{activeDetailObj.deviceColor || "-"}</p>
                </div>
              </div>

              {/* Financial checklist row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/[0.01] border border-white/10 p-4 rounded-none">
                  <p className="text-white/40 text-[9px] font-bold tracking-[0.2em] mb-1 uppercase">Purchase Price</p>
                  <p className="text-base font-mono font-bold text-white">{formatIDR(activeDetailObj.buyPrice)}</p>
                </div>
                <div className="bg-white/[0.01] border border-white/10 p-4 rounded-none">
                  <p className="text-white/40 text-[9px] font-bold tracking-[0.2em] mb-1 uppercase">Diagnostic Cost</p>
                  <p className="text-base font-mono font-bold text-amber-500">{formatIDR(activeDetailObj.totalRepairCost)}</p>
                </div>
                <div className="bg-white/[0.01] border border-white/10 p-4 rounded-none">
                  <p className="text-white/40 text-[9px] font-bold tracking-[0.2em] mb-1 uppercase">Retail Spread</p>
                  <p className={`text-base font-mono font-bold ${activeDetailObj.netProfit >= 0 ? "text-emerald-400" : "text-red-500"}`}>
                    {formatIDR(activeDetailObj.netProfit)}
                  </p>
                </div>
              </div>

              {/* Hardware status rows */}
              <div>
                <h5 className="text-white/60 text-[9px] font-bold uppercase tracking-[0.2em] mb-3">Diagnostic Points Audited</h5>
                <div className="border border-white/10 rounded-none overflow-hidden divide-y divide-white/5 max-h-48 overflow-y-auto">
                  {Object.entries(activeDetailObj.partsState).map(([partName, state]) => (
                    <div key={partName} className="flex justify-between items-center px-4 py-3 bg-[#0c0c0c] text-xs">
                      <div>
                        <span className="text-white tracking-wide font-medium">{partName}</span>
                        {state.bhVal ? <span className="ml-2 text-[10px] text-white/40 font-mono">BH: {state.bhVal}%</span> : ""}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
                          {state.conditionIdx === 0 ? "Normal" : state.conditionIdx === 1 ? "Minor" : state.conditionIdx === 2 ? "Major" : "3rd Party"}
                        </span>
                        <span className="font-mono text-xs text-white font-medium">Rp {state.repairCost.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                  ))}
                  {Object.keys(activeDetailObj.partsState).length === 0 && (
                    <div className="p-4 text-center text-xs text-white/30 italic">Checked without specific hardware states override.</div>
                  )}
                </div>
              </div>

              {activeDetailObj.notes && (
                <div>
                  <h5 className="text-white/40 text-[9px] font-bold uppercase tracking-[0.2em] mb-2">Inspector Notes</h5>
                  <p className="text-xs text-white/70 italic bg-white/[0.01] border border-white/10 rounded-none p-4 leading-relaxed font-sans">
                    "{activeDetailObj.notes}"
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3 bg-white/[0.02]">
              <button 
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 hover:bg-white/10 border border-white/10 text-white font-semibold text-[10px] tracking-wider uppercase rounded-none cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
              <button 
                onClick={() => setActiveDetailsId(null)}
                className="px-5 py-2 bg-white hover:bg-white/80 text-black font-extrabold text-[10px] tracking-wider uppercase rounded-none cursor-pointer transition-colors"
              >
                Accept Check
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal card */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/85 z-150 flex items-center justify-center p-4">
          <div className="premium-card w-full max-w-sm rounded-[2px] p-6 text-center border-white/20">
            <div className="h-12 w-12 bg-white/5 text-white rounded-none flex items-center justify-center mx-auto mb-4 border border-white/15">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            
            <h5 className="text-xs font-bold uppercase tracking-[0.2em] text-white/90 mb-2 font-display">Confirm Removal</h5>
            <p className="text-[11px] uppercase tracking-wide text-white/50 leading-relaxed mb-6">
              Delete transaction record <span className="font-mono text-white font-bold">{deleteConfirmId}</span>? This action is permanent.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-[10px] tracking-wider uppercase rounded-none cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onDeleteTransaction(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="py-2.5 bg-red-600 text-white hover:bg-red-700 font-bold text-[10px] tracking-wider uppercase rounded-none cursor-pointer transition-colors"
              >
                Delete Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wipe Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4">
          <div className="premium-card w-full max-w-md rounded-none p-8 text-center border-red-500/30">
            <h5 className="text-xs font-bold text-red-400 mb-2 font-display uppercase tracking-[0.25em]">CRITICAL ACTION: Reset Ledger?</h5>
            <p className="text-xs text-white/50 leading-relaxed mb-6 uppercase tracking-wider">
              THIS ACTION WILL TOTALLY REMOVE THE TRANSACTIONS REGISTER DATABASE EXCLUSIVELY. ALL SAVED RECORDS ARE REMOVED ACCORDINGLY.
            </p>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 bg-white/5 text-white hover:bg-white/10 border border-white/10 font-bold text-[10px] tracking-widest uppercase rounded-none cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onResetLedger();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-3 bg-red-600 text-white font-extrabold text-[10px] tracking-widest uppercase rounded-none hover:bg-red-700 cursor-pointer transition-all"
              >
                Reset Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
