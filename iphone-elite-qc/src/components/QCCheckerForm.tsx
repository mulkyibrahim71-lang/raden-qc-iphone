import { useState, useEffect } from "react";
import { 
  User, 
  Smartphone, 
  Coins, 
  ClipboardCheck, 
  Activity, 
  Save, 
  Printer, 
  CheckCircle, 
  AlertTriangle, 
  XSquare,
  XCircle, 
  Calendar,
  Check
} from "lucide-react";
import { QCPart, PartState, Transaction } from "../types";
import { DEFAULT_PARTS, IPHONE_MODELS, IPHONE_STORAGES } from "../data";
import { formatNumberIDR, parseIDR, formatIDR } from "../utils";

interface QCCheckerFormProps {
  onSaveTransaction: (transaction: Transaction) => void;
  partsConfig?: QCPart[];
}

export default function QCCheckerForm({ onSaveTransaction, partsConfig }: QCCheckerFormProps) {
  // Customer Info
  const [custName, setCustName] = useState("");
  const [custWa, setCustWa] = useState("");

  // Device Info
  const [deviceModel, setDeviceModel] = useState("iPhone 15 Pro Max");
  const [deviceStorage, setDeviceStorage] = useState("256GB");
  const [deviceColor, setDeviceColor] = useState("Natural Titanium");
  const [qcDate, setQcDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // Pricing Info
  const [buyPriceRaw, setBuyPriceRaw] = useState("");
  const [sellPriceRaw, setSellPriceRaw] = useState("");

  // Hardware Status
  const [partsState, setPartsState] = useState<Record<string, PartState>>({});

  // Verified/inspected parts indicators
  const [checkedParts, setCheckedParts] = useState<Record<string, boolean>>({});

  // Additional Diagnostic notes
  const [notes, setNotes] = useState("");

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Shop Settings configuration
  const [shopSettings, setShopSettings] = useState({
    shopName: "VANTAGE LUXE",
    whatsapp: "081234567890",
    address: "ITC Kuningan Lantai 3 Blok A, Jakarta Selatan"
  });

  useEffect(() => {
    const saved = localStorage.getItem("iphone_elite_shop_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setShopSettings(prev => ({ ...prev, ...parsed }));
      } catch (e) {}
    }
  }, []);

  // Initialize part states
  useEffect(() => {
    const initialState: Record<string, PartState> = {};
    const partsToUse = partsConfig && partsConfig.length > 0 ? partsConfig : DEFAULT_PARTS;
    partsToUse.forEach((part) => {
      initialState[part.name] = {
        conditionIdx: 0,
        repairCost: 0,
        ...(part.hasHealth ? { bhVal: 100 } : {})
      };
    });
    setPartsState(initialState);
    setCheckedParts({});
  }, [partsConfig]);

  // Update cost when status changes
  const handleStatusChange = (partName: string, condIdx: number) => {
    const part = (partsConfig && partsConfig.length > 0 ? partsConfig : DEFAULT_PARTS).find(p => p.name === partName);
    if (!part) return;

    const condition = part.conditions[condIdx];
    let calculatedCost = 0;
    if (condition && !part.isInfoPart) {
      calculatedCost = condition.cost;
    }

    setPartsState(prev => ({
      ...prev,
      [partName]: {
        ...prev[partName],
        conditionIdx: condIdx,
        repairCost: calculatedCost
      }
    }));

    // Autocomplete verified badge
    setCheckedParts(prev => ({
      ...prev,
      [partName]: true
    }));
  };

  // Update repair cost field manually
  const handleCostChange = (partName: string, rawVal: string) => {
    const part = (partsConfig && partsConfig.length > 0 ? partsConfig : DEFAULT_PARTS).find(p => p.name === partName);
    if (part && part.isInfoPart) return; // Prevent cost modification on info-only segments like iCloud

    const numericCost = parseIDR(rawVal);
    setPartsState(prev => ({
      ...prev,
      [partName]: {
        ...prev[partName],
        repairCost: numericCost
      }
    }));

    // Autocomplete verified badge
    setCheckedParts(prev => ({
      ...prev,
      [partName]: true
    }));
  };

  // Update Battery Health
  const handleBHChange = (partName: string, bh: string) => {
    const numericBH = parseInt(bh, 10) || 100;
    setPartsState(prev => ({
      ...prev,
      [partName]: {
        ...prev[partName],
        bhVal: Math.max(0, Math.min(100, numericBH))
      }
    }));

    // Autocomplete verified badge
    setCheckedParts(prev => ({
      ...prev,
      [partName]: true
    }));
  };

  // Calculations
  const buyPrice = parseIDR(buyPriceRaw);
  const sellPrice = parseIDR(sellPriceRaw);

  const totalRepairCost = (Object.values(partsState) as any[]).reduce((acc, curr) => acc + (curr?.repairCost || 0), 0);
  const netProfit = sellPrice > 0 || buyPrice > 0 ? sellPrice - buyPrice - totalRepairCost : 0;

  // Determine eligibility
  let eligibility: "LAYAK BELI" | "PERTIMBANGKAN" | "BERESIKO TINGGI" | "AWAITING DATA" = "AWAITING DATA";
  let eligibilityBadgeClass = "border-white/20 text-on-surface-variant bg-white/5";
  let eligibilityContainerClass = "border shadow-none";
  let eligibilityDesc = "Input pricing and hardware status.";

  if (buyPrice > 0 && sellPrice > 0) {
    if (totalRepairCost < 500000) {
      eligibility = "LAYAK BELI";
      eligibilityBadgeClass = "border-emerald-500/55 text-emerald-400 bg-emerald-500/10";
      eligibilityContainerClass = "border-emerald-500/20 emerald-border-glow";
      eligibilityDesc = "Excellent condition. Low repair costs.";
    } else if (totalRepairCost <= 1000000) {
      eligibility = "PERTIMBANGKAN";
      eligibilityBadgeClass = "border-amber-500/55 text-amber-400 bg-amber-500/10";
      eligibilityContainerClass = "border-amber-500/20 amber-border-glow";
      eligibilityDesc = "Repair costs are moderate. Check margins.";
    } else {
      eligibility = "BERESIKO TINGGI";
      eligibilityBadgeClass = "border-red-500/55 text-red-500 bg-red-500/10";
      eligibilityContainerClass = "border-red-500/20 red-border-glow";
      eligibilityDesc = "High repair overhead detected.";
    }
  }

  // Handle Save
  const handleSave = () => {
    if (!custName.trim()) {
      alert("Masukkan Nama Pelanggan terlebih dahulu!");
      return;
    }

    const transactionID = `TRX-QC-${Math.floor(9000 + Math.random() * 1000)}`;

    const newTransaction: Transaction = {
      id: transactionID,
      date: qcDate,
      customerName: custName,
      customerWa: custWa,
      deviceModel,
      deviceStorage,
      deviceColor,
      buyPrice,
      sellPrice,
      totalRepairCost,
      netProfit,
      eligibility,
      notes,
      partsState
    };

    onSaveTransaction(newTransaction);
    
    // Clear Form inputs
    setCustName("");
    setCustWa("");
    setBuyPriceRaw("");
    setSellPriceRaw("");
    setNotes("");
    
    // Reset Checklist
    const resetState: Record<string, PartState> = {};
    const partsToUse = partsConfig.length > 0 ? partsConfig : DEFAULT_PARTS;
    partsToUse.forEach((part) => {
      resetState[part.name] = {
        conditionIdx: 0,
        repairCost: 0,
        ...(part.hasHealth ? { bhVal: 100 } : {})
      };
    });
    setPartsState(resetState);
    setCheckedParts({});

    // Trigger Toast banner
    setToastMessage("Data QC berhasil disimpan ke database lokal!");
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Print Document Trigger
  const handlePrint = () => {
    window.print();
  };

  const partsToRender = partsConfig.length > 0 ? partsConfig : DEFAULT_PARTS;

  const checkedCount = Object.values(checkedParts).filter(Boolean).length;
  const totalCount = partsToRender.length;
  const completionPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black border border-white px-6 py-4 rounded-none text-white font-medium text-[11px] tracking-[0.15em] uppercase flex items-center gap-3 z-100 shadow-2xl">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          {toastMessage}
        </div>
      )}

      {/* Primary Action Row */}
      <section className="mb-8 no-print">
        <div className="premium-card p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="font-display text-[16px] tracking-[0.2em] font-bold text-white uppercase">
              VALUATION & DIAGNOSTICS ENGINE
            </h2>
            <p className="text-white/40 font-medium text-[11px] tracking-[0.05em] uppercase mt-1">
              Automated hardware checklist and margin extraction.
            </p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={handlePrint}
              className="flex-1 md:flex-none px-6 py-3.5 rounded-none border border-white/10 bg-white/5 hover:bg-white/15 active:scale-98 text-white font-medium text-[11px] tracking-[0.2em] flex items-center justify-center gap-2 transition-all cursor-pointer uppercase"
            >
              <Printer className="w-4 h-4 text-white/50" />
              <span>Print QC</span>
            </button>
            <button 
              onClick={handleSave}
              className="flex-1 md:flex-none px-6 py-3.5 rounded-none bg-white text-black hover:bg-white/90 active:scale-98 font-bold text-[11px] tracking-[0.2em] flex items-center justify-center gap-2 transition-all cursor-pointer uppercase shadow-2xl"
            >
              <Save className="w-4 h-4 text-black" />
              <span>Save Session</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Form Fields Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Aspect: Identity and Spec Parameters (4 cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-8 no-print">
          
          {/* Customer Metadata Card */}
          <div className="premium-card p-6">
            <h3 className="font-display text-xs font-bold text-white mb-6 uppercase tracking-[0.2em] flex items-center gap-2.5 pb-3 border-b border-white/10">
              <User className="w-4 h-4 text-white/40" />
              CUSTOMER PROFILE
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[9px] text-white/40 mb-2 font-bold uppercase tracking-[0.2em]">
                  CUSTOMER NAME
                </label>
                <input 
                  type="text" 
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Alexander Vance"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-none px-3.5 py-2.5 text-white text-[13px] focus:border-white focus:bg-white/[0.05] outline-none transition-all placeholder-white/20 uppercase tracking-wide"
                />
              </div>
              
              <div>
                <label className="block text-[9px] text-white/40 mb-2 font-bold uppercase tracking-[0.2em]">
                  WHATSAPP CONTACT
                </label>
                <input 
                  type="tel" 
                  value={custWa}
                  onChange={(e) => setCustWa(e.target.value)}
                  placeholder="08xxxxxxxx"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-none px-3.5 py-2.5 text-white font-mono text-[13px] focus:border-white focus:bg-white/[0.05] outline-none transition-all placeholder-white/20"
                />
              </div>
            </div>
          </div>

          {/* Model Specification Specifications */}
          <div className="premium-card p-6">
            <h3 className="font-display text-xs font-bold text-white mb-6 uppercase tracking-[0.2em] flex items-center gap-2.5 pb-3 border-b border-white/10">
              <Smartphone className="w-4 h-4 text-white/40" />
              DEVICE MATRIX
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-[9px] text-white/40 mb-2 font-bold uppercase tracking-[0.2em]">
                  IPHONE MODEL
                </label>
                <select 
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 hover:border-white/20 rounded-none p-3.5 text-white focus:border-white outline-none select-none transition-all cursor-pointer text-xs uppercase tracking-wider"
                >
                  {IPHONE_MODELS.map(model => (
                    <option key={model} value={model} className="bg-[#121212] text-white py-2">{model}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] text-white/40 mb-2 font-bold uppercase tracking-[0.2em]">
                    STORAGE
                  </label>
                  <select 
                    value={deviceStorage}
                    onChange={(e) => setDeviceStorage(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 hover:border-white/20 rounded-none p-3.5 text-white focus:border-white outline-none transition-all cursor-pointer text-xs uppercase tracking-wider"
                  >
                    {IPHONE_STORAGES.map(storage => (
                      <option key={storage} value={storage} className="bg-[#121212] text-white">{storage}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] text-white/40 mb-2 font-bold uppercase tracking-[0.2em]">
                    COLOR
                  </label>
                  <input 
                    type="text"
                    value={deviceColor}
                    onChange={(e) => setDeviceColor(e.target.value)}
                    placeholder="Titanium"
                    className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-white rounded-none p-3 text-white outline-none transition-all text-xs uppercase tracking-wider"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] text-white/40 mb-2 font-bold uppercase tracking-[0.2em]">
                  QC DATE
                </label>
                <div className="relative">
                  <input 
                    type="date"
                    value={qcDate}
                    onChange={(e) => setQcDate(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded-none p-3.5 text-white focus:border-white outline-none transition-all cursor-pointer text-xs uppercase tracking-wider font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Buying & Selling Price Estimation Valuation */}
          <div className="premium-card p-6">
            <h3 className="font-display text-xs font-bold text-white mb-6 uppercase tracking-[0.2em] flex items-center gap-2.5 pb-3 border-b border-white/10">
              <Coins className="w-4 h-4 text-white/40" />
              MARGIN PARAMETERS
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-[9px] text-white/40 mb-2 font-bold uppercase tracking-[0.2em]">
                  EST. PURCHASE PRICE (RP)
                </label>
                <div className="relative">
                  <span className="absolute left-0 bottom-2 text-base font-semibold text-white/30 font-mono">IDR.</span>
                  <input 
                    type="text" 
                    value={buyPriceRaw}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^0-9]/g, "");
                      setBuyPriceRaw(digits ? parseInt(digits, 10).toLocaleString("id-ID") : "");
                    }}
                    placeholder="0"
                    className="w-full bg-transparent border-b border-white/20 pl-10 py-2 font-mono text-xl text-white font-medium focus:border-white outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] text-white/40 mb-2 font-bold uppercase tracking-[0.2em]">
                  TARGET RETAIL PRICE (RP)
                </label>
                <div className="relative">
                  <span className="absolute left-0 bottom-2 text-base font-semibold text-white/30 font-mono">IDR.</span>
                  <input 
                    type="text" 
                    value={sellPriceRaw}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^0-9]/g, "");
                      setSellPriceRaw(digits ? parseInt(digits, 10).toLocaleString("id-ID") : "");
                    }}
                    placeholder="0"
                    className="w-full bg-transparent border-b border-white/20 pl-10 py-2 font-mono text-xl text-white font-medium focus:border-white outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Aspect: Core Checklist & Bento Scoring (8 cols) */}
        <div className="col-span-12 lg:col-span-8 space-y-8 no-print">
          
          {/* Hardware status list matrix */}
          <div className="premium-card overflow-hidden">
            <div className="bg-white/[0.02] px-6 py-5 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-display text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-white/50" />
                Hardware Health Metrics
              </h3>
              <span className="text-[9px] uppercase tracking-[0.25em] bg-white/5 text-white px-3 py-1.5 rounded-none border border-white/15 font-bold">
                15 CHECKPOINTS
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#0e0e0e] text-white/40 text-[9px] tracking-[0.2em] uppercase font-bold border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 font-bold">HARDWARE COMPONENT</th>
                    <th className="px-6 py-4 font-bold">INSCRIPTION / STATUS</th>
                    <th className="px-6 py-4 text-right font-bold w-48">EST. OVERHEAD (RP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {partsToRender.map((part) => {
                    const status = partsState[part.name] || { conditionIdx: 0, repairCost: 0 };
                    const isChecked = !!checkedParts[part.name];
                    return (
                      <tr 
                        key={part.name} 
                        className={`hover:bg-white/[0.03] transition-colors duration-200 ${isChecked ? 'bg-white/[0.015]' : ''}`}
                      >
                        {/* Part label column */}
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-3.5">
                            <button
                              type="button"
                              onClick={() => {
                                setCheckedParts(prev => ({
                                  ...prev,
                                  [part.name]: !prev[part.name]
                                }));
                              }}
                              className={`w-4.5 h-4.5 flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                                isChecked 
                                  ? "border-white bg-white text-black" 
                                  : "border-white/10 hover:border-white/30 text-transparent bg-transparent"
                              }`}
                              title={isChecked ? "Mark as Unverified" : "Mark as Verified"}
                            >
                              <Check className="w-3.5 h-3.5 font-bold" />
                            </button>
                            <div className="min-w-0">
                              <div className={`font-semibold text-[13px] tracking-wide transition-colors ${isChecked ? 'text-white font-medium' : 'text-white/60'}`}>
                                {part.name}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Dropdown status selector */}
                        <td className="px-6 py-4.5">
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-[340px]">
                            <select 
                              value={status.conditionIdx}
                              onChange={(e) => handleStatusChange(part.name, parseInt(e.target.value, 10))}
                              className={`bg-[#121212] border hover:border-white/30 rounded-none p-2 py-1.5 text-[11px] tracking-wider text-white focus:border-white outline-none transition-all cursor-pointer flex-1 uppercase font-light ${
                                isChecked ? "border-white/20" : "border-white/10"
                              }`}
                            >
                              {part.conditions.map((opt, i) => (
                                <option key={opt.label} value={i} className="bg-[#121212] text-white uppercase">{opt.label}</option>
                              ))}
                            </select>

                            {part.hasHealth && (
                              <div className="flex items-center gap-1.5 shrink-0 self-center">
                                <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider">BH:</span>
                                <div className="relative">
                                  <input 
                                    type="number" 
                                    min="0"
                                    max="100"
                                    value={status.bhVal ?? 100}
                                    onChange={(e) => handleBHChange(part.name, e.target.value)}
                                    className="w-14 bg-[#050505] border border-white/15 text-[11px] rounded-none py-1.5 px-2 text-white font-mono focus:border-white outline-none text-center"
                                    placeholder="100"
                                  />
                                  <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-white/30 font-mono">%</span>
                                </div>
                              </div>
                            )}

                            {/* Done checkmark icon */}
                            {isChecked && (
                              <span className="inline-flex items-center justify-center text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-1 rounded-none text-[8px] font-bold tracking-widest uppercase">
                                <Check className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Interactive Repair cost field */}
                        <td className="px-6 py-4.5 text-right font-mono">
                          {part.isInfoPart ? (
                            <span className="inline-block text-[9px] font-extrabold tracking-widest text-[#c8a47e] bg-[#c8a47e]/10 border border-[#c8a47e]/20 px-2.5 py-1 text-right">
                              INFO
                            </span>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-[10px] text-white/30 uppercase">RP.</span>
                              <input 
                                type="text" 
                                value={status.repairCost === 0 ? "0" : formatNumberIDR(status.repairCost)}
                                onChange={(e) => handleCostChange(part.name, e.target.value)}
                                disabled={part.isInfoPart}
                                className="bg-transparent border-b border-white/10 text-right font-mono text-white text-[13px] w-30 focus:border-white outline-none py-0.5 transition-all"
                              />
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Verification Stats Progress Bar block */}
            <div className="bg-[#0b0b0b]/60 border-t border-white/10 p-5 px-6 space-y-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-[9px] text-white/40 font-extrabold uppercase tracking-[0.2em] block leading-none">
                    INSPECTION VERIFICATION METRICS
                  </span>
                  <p className="text-[10px] text-white/60 tracking-wider uppercase font-medium">
                    {checkedCount} OUT OF {totalCount} HARDWARE CHECKPOINTS INSPECTED
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest block leading-none mb-1">COMPLETION STATUS</span>
                  <div className="font-mono text-xl font-bold text-white tracking-wider leading-none">
                    {completionPercent}%
                  </div>
                </div>
              </div>
              
              {/* Premium Progress Bar Track */}
              <div className="relative w-full h-1 bg-white/5 overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-white transition-all duration-500 ease-out shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Summary Bento Cells */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Net calculations box */}
            <div className="premium-card p-6 border-l border-white flex flex-col justify-between min-h-[180px]">
              <div className="space-y-1">
                <span className="text-[9px] text-white/40 font-bold tracking-[0.2em] uppercase">
                  TOTAL DIAGNOSTIC OVERHEAD
                </span>
                <div className="font-mono text-2xl font-semibold text-white mt-1">
                  {formatIDR(totalRepairCost)}
                </div>
              </div>
              
              <div className="pt-5 border-t border-white/10 space-y-1">
                <span className="text-[9px] text-white/40 font-bold tracking-[0.2em] uppercase">
                  ESTIMATED RETAIL SPREAD (PROFIT)
                </span>
                <div className={`font-mono text-xl font-bold mt-1 ${netProfit >= 0 ? "text-emerald-400" : "text-amber-500"}`}>
                  {formatIDR(netProfit)}
                </div>
              </div>
            </div>

            {/* Decision Analysis Box */}
            <div className={`premium-card p-6 flex flex-col items-center justify-center text-center transition-all duration-700 min-h-[180px] ${eligibilityContainerClass}`}>
              <span className="text-[9px] text-white/40 font-bold tracking-[0.2em] uppercase mb-4">
                INVESTMENT VERDICT
              </span>
              <div className={`px-7 py-3 rounded-none font-bold text-[11px] tracking-[0.2em] uppercase border mb-4 shadow-sm flex items-center gap-2 ${eligibilityBadgeClass}`}>
                {eligibility === "LAYAK BELI" && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                {eligibility === "PERTIMBANGKAN" && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                {eligibility === "BERESIKO TINGGI" && <XCircle className="w-4 h-4 text-red-400" />}
                <span>{eligibility}</span>
              </div>
              <p className="text-[10px] text-white/50 tracking-wider uppercase font-medium">
                {eligibilityDesc}
              </p>
            </div>
          </div>

          {/* Notes module */}
          <div className="premium-card p-6">
            <label className="block text-[9px] text-white/40 mb-4 font-bold uppercase tracking-[0.2em]">
              PHYSICAL APPRAISAL & COMPLIANCE NOTES
            </label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Input physical screen details, cosmetic grades (A/B/C), chassis micro-scratches, or custom remarks..." 
              rows={4}
              className="w-full bg-[#0e0e0e] border border-white/10 focus:border-white p-4 text-[13px] text-white outline-none transition-all resize-none font-sans leading-relaxed rounded-none"
            />
          </div>
        </div>
      </div>

      {/* Hidden Print Document Layout - Optimized cleanly for standard A4 Printing */}
      <div className="hidden print:block absolute inset-0 bg-white text-black p-12 font-sans z-[1000] h-full" id="print-area">
        <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-[0.15em] text-black uppercase font-display">{shopSettings.shopName || "VANTAGE LUXE"}</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mt-1">Official Certified Diagnostic Certificate</p>
            {shopSettings.address && (
              <p className="text-[9px] text-neutral-500 mt-1.5 uppercase max-w-sm tracking-normal leading-normal">{shopSettings.address}</p>
            )}
            {shopSettings.whatsapp && (
              <p className="text-[9px] text-neutral-500 font-mono tracking-normal leading-normal uppercase">WA: {shopSettings.whatsapp}</p>
            )}
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] font-semibold text-neutral-500">SESSION ID: TRX-QC-{Math.floor(10000 + Math.random() * 89999)}</div>
            <div className="text-xs font-bold text-neutral-800 mt-1">INSPECTION DATE: {qcDate}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8 border border-neutral-200 p-5">
          <div className="space-y-1 text-xs">
            <h3 className="font-bold border-b border-neutral-100 pb-1 mb-2 uppercase text-[9px] text-neutral-400 tracking-wider">Client Portfolio</h3>
            <p className="text-black">Client Name: <span className="font-bold">{custName || "Private Collector"}</span></p>
            <p className="text-neutral-600">WhatsApp: <span className="font-mono">{custWa || "-"}</span></p>
          </div>
          <div className="space-y-1 text-xs">
            <h3 className="font-bold border-b border-neutral-100 pb-1 mb-2 uppercase text-[9px] text-neutral-400 tracking-wider">Spec Specifications</h3>
            <p className="text-black">Model Variant: <span className="font-bold">{deviceModel}</span></p>
            <p className="text-neutral-600">Build Signature: <span className="font-semibold">{deviceStorage} ({deviceColor || "Silver Slate"})</span></p>
          </div>
        </div>

        <table className="w-full text-left border-collapse border border-neutral-200 text-xs mb-8">
          <thead>
            <tr className="bg-neutral-50 text-[9px] font-bold text-neutral-500 border-b border-neutral-200 uppercase tracking-wider">
              <th className="p-3 border">Diagnostic Checkpoint</th>
              <th className="p-3 border">Appraisal State</th>
              <th className="p-3 text-right border">Overhead Cost</th>
            </tr>
          </thead>
          <tbody>
            {partsToRender.map((part) => {
              const status = partsState[part.name] || { conditionIdx: 0, repairCost: 0 };
              const currentCondition = part.conditions[status.conditionIdx];
              return (
                <tr key={part.name} className="border-b text-neutral-800 animate-none">
                  <td className="p-3 border font-semibold">{part.name}</td>
                  <td className="p-3 border text-neutral-600">
                    {currentCondition?.label || "NORMAL / MULUS"} 
                    {status.bhVal ? ` (BH: ${status.bhVal}%)` : ""}
                  </td>
                  <td className="p-3 text-right font-mono border">
                    {part.isInfoPart ? "INFO" : `Rp ${formatNumberIDR(status.repairCost)}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {notes && (
          <div className="mb-8 border border-neutral-200 p-4">
            <h4 className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Remarks & Compliance Notes</h4>
            <p className="text-xs text-neutral-800 italic leading-relaxed">"{notes}"</p>
          </div>
        )}

        <div className="flex justify-end pt-5">
          <div className="w-1/2 space-y-3 px-5 py-4 border border-black">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-500 uppercase tracking-wider text-[9px]">Purchase Price:</span>
              <span className="font-mono font-bold text-black">Rp {formatNumberIDR(buyPrice)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-neutral-500 uppercase tracking-wider text-[9px]">Overhead Costs:</span>
              <span className="font-mono font-bold text-neutral-700">Rp {formatNumberIDR(totalRepairCost)}</span>
            </div>
            <div className="flex justify-between text-[13px] font-bold border-t border-black pt-2 text-black uppercase">
              <span>Capital Sum:</span>
              <span className="font-mono">Rp {formatNumberIDR(buyPrice + totalRepairCost)}</span>
            </div>
            <div className="flex justify-between text-[13px] font-bold text-black uppercase">
              <span>Spread Margin:</span>
              <span className={`font-mono ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>Rp {formatNumberIDR(netProfit)}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-dashed border-neutral-300 text-center">
              <span className="border border-black px-4 py-2 font-bold uppercase text-[9px] tracking-widest inline-block text-black">
                DECISION SUMMARY: {eligibility}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-dashed border-neutral-200 pt-4 text-[9px] text-neutral-400 text-center tracking-wider uppercase">
          Authorized Appraisal Certificate • Vantage Luxe Laboratories. 
        </div>
      </div>
    </>
  );
}
