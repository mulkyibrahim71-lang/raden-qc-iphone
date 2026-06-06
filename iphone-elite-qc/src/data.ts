import { QCPart } from "./types";

export const DEFAULT_PARTS: QCPart[] = [
  {
    name: "Layar",
    conditions: [
      { label: "NORMAL / MULUS", cost: 0 },
      { label: "TERDAPAT GARIS", cost: 400000 },
      { label: "SHADOW / BAYANGAN", cost: 400000 },
      { label: "BURN IN / GHOST IMAGE", cost: 500000 },
      { label: "DEAD PIXEL / TITIK HITAM", cost: 450000 },
      { label: "KUNING / COLOR SHIFT", cost: 300000 },
      { label: "RETAK (KACA SAJA)", cost: 300000 },
      { label: "PECAH / LCD RUSAK", cost: 600000 }
    ]
  },
  {
    name: "Kamera Belakang",
    conditions: [
      { label: "JERNIH / NORMAL", cost: 0 },
      { label: "BURAM / TIDAK FOKUS", cost: 300000 },
      { label: "GOYANG / GETER (OIS)", cost: 400000 },
      { label: "BLANK HITAM", cost: 450000 },
      { label: "ADA JAMUR / BEREMBUN", cost: 350000 },
      { label: "TITIK HITAM DI FOTO", cost: 300000 },
      { label: "FLASH MATI", cost: 200000 }
    ]
  },
  {
    name: "Kamera Depan",
    conditions: [
      { label: "JERNIH / NORMAL", cost: 0 },
      { label: "BURAM / TIDAK FOKUS", cost: 200000 },
      { label: "BLANK HITAM", cost: 300000 },
      { label: "FACE ID TIDAK BERFUNGSI", cost: 500000 },
      { label: "KAMERA MATI TOTAL", cost: 350000 }
    ]
  },
  {
    name: "Baterai",
    hasHealth: true,
    conditions: [
      { label: "HEALTH 90–100% (PRIMA)", cost: 0 },
      { label: "HEALTH 80–89% (NORMAL)", cost: 0 },
      { label: "HEALTH 70–79% (MULAI AUS)", cost: 150000 },
      { label: "HEALTH < 70% (HARUS GANTI)", cost: 250000 },
      { label: "KEMBUNG / BENGKOK", cost: 300000 },
      { label: "SERVICE (BUKAN ORIGINAL)", cost: 200000 }
    ]
  },
  {
    name: "Speaker",
    conditions: [
      { label: "NORMAL / JERNIH", cost: 0 },
      { label: "NGEBASS / CEMPRENG", cost: 150000 },
      { label: "VOLUME KECIL ABNORMAL", cost: 150000 },
      { label: "PECAH / DISTORSI SUARA", cost: 200000 },
      { label: "MATI TOTAL", cost: 300000 }
    ]
  },
  {
    name: "Mikrofon",
    conditions: [
      { label: "NORMAL", cost: 0 },
      { label: "SUARA KECIL / TIDAK JELAS", cost: 150000 },
      { label: "NOISE / BERISIK", cost: 150000 },
      { label: "MATI (TIDAK TEREKAM)", cost: 200000 }
    ]
  },
  {
    name: "Sinyal / Jaringan",
    conditions: [
      { label: "NORMAL SEMUA OPERATOR", cost: 0 },
      { label: "SINYAL LEMAH", cost: 0, infoText: "monitoring" },
      { label: "NO SIGNAL / SEARCHING", cost: 400000 },
      { label: "WIFI ONLY (BASEBAND MATI)", cost: 400000 },
      { label: "HP TERBLOKIR / BLACKLIST", cost: 200000, infoText: "perlu proses unblock" }
    ]
  },
  {
    name: "iCloud / Akun Apple ID",
    isInfoPart: true,
    conditions: [
      { label: "AMAN / iCLOUD OFF", cost: 0, isInfo: true },
      { label: "iCLOUD LOCK / ACTIVATION LOCK", cost: 0, isInfo: true, infoText: "TOLAK / SANGAT MURAH" },
      { label: "MASIH LOGIN (BELUM LOGOUT)", cost: 0, isInfo: true, infoText: "MINTA LOGOUT DULU" }
    ]
  },
  {
    name: "Tombol Home / Touch ID",
    conditions: [
      { label: "NORMAL & TOUCH ID BERFUNGSI", cost: 0 },
      { label: "TOMBOL BERFUNGSI, TOUCH ID MATI", cost: 200000 },
      { label: "TOMBOL TIDAK RESPONSIF", cost: 200000 },
      { label: "PENGGANTI / NON-ORIGINAL", cost: 0, infoText: "Touch ID mati" },
      { label: "N/A (MODEL TANPA HOME BUTTON)", cost: 0 }
    ]
  },
  {
    name: "Face ID",
    conditions: [
      { label: "NORMAL / BERFUNGSI", cost: 0 },
      { label: "LAMBAT / TIDAK KONSISTEN", cost: 200000 },
      { label: "MATI TOTAL", cost: 500000 },
      { label: "N/A (MODEL TANPA FACE ID)", cost: 0 }
    ]
  },
  {
    name: "Tombol Volume (+ / -)",
    conditions: [
      { label: "NORMAL", cost: 0 },
      { label: "MACET / KERAS DITEKAN", cost: 100000 },
      { label: "SALAH SATU TIDAK BERFUNGSI", cost: 150000 },
      { label: "KEDUANYA TIDAK BERFUNGSI", cost: 200000 }
    ]
  },
  {
    name: "Tombol Power / Side Button",
    conditions: [
      { label: "NORMAL", cost: 0 },
      { label: "MACET / KERAS DITEKAN", cost: 100000 },
      { label: "TIDAK BERFUNGSI", cost: 200000 }
    ]
  },
  {
    name: "Silent Switch",
    conditions: [
      { label: "NORMAL", cost: 0 },
      { label: "LONGGAR / GOYANG", cost: 100000 },
      { label: "MACET (TIDAK BISA PINDAH)", cost: 100000 },
      { label: "TIDAK BERFUNGSI", cost: 150000 }
    ]
  },
  {
    name: "Port Charging",
    conditions: [
      { label: "NORMAL", cost: 0 },
      { label: "LONGGAR / GOYANG", cost: 150000 },
      { label: "PENGISIAN LAMBAT / PUTUS-PUTUS", cost: 200000 },
      { label: "TIDAK BISA MENGISI SAMA SEKALI", cost: 250000 },
      { label: "KOTOR / BERDEBU (BISA BERSIHKAN)", cost: 0 }
    ]
  },
  {
    name: "Body / Casing Luar",
    conditions: [
      { label: "MULUS / TIDAK ADA CACAT", cost: 0 },
      { label: "BARET HALUS (WAJAR)", cost: 0 },
      { label: "BARET DALAM / LECET JELAS", cost: 0, infoText: "minus harga" },
      { label: "PENYOK / BENGKOK", cost: 200000 },
      { label: "RETAK / PECAH", cost: 350000 }
    ]
  },
  {
    name: "Vibrator / Haptic Engine",
    conditions: [
      { label: "NORMAL / BERGETAR", cost: 0 },
      { label: "LEMAH / TIDAK TERASA", cost: 150000 },
      { label: "BUNYI BERISIK SAAT GETAR", cost: 150000 },
      { label: "MATI TOTAL", cost: 200000 }
    ]
  }
];

export const STORAGE_KEY_PARTS = "iphone_elite_qc_parts_v2_16parts";
export const STORAGE_KEY_TRANSACTIONS = "qc_transactions";


export const IPHONE_MODELS = [
  "iPhone 17 Pro Max",
  "iPhone 17 Pro",
  "iPhone 17 Plus",
  "iPhone 17",
  "iPhone 16 Pro Max",
  "iPhone 16 Pro",
  "iPhone 16 Plus",
  "iPhone 16",
  "iPhone 15 Pro Max",
  "iPhone 15 Pro",
  "iPhone 15 Plus",
  "iPhone 15",
  "iPhone 14 Pro Max",
  "iPhone 14 Pro",
  "iPhone 14 Plus",
  "iPhone 14",
  "iPhone 13 Pro Max",
  "iPhone 13 Pro",
  "iPhone 13",
  "iPhone 13 Mini",
  "iPhone 12 Pro Max",
  "iPhone 12 Pro",
  "iPhone 12",
  "iPhone 12 Mini",
  "iPhone 11 Pro Max",
  "iPhone 11 Pro",
  "iPhone 11",
  "iPhone XS Max",
  "iPhone XS",
  "iPhone XR",
  "iPhone X",
  "iPhone 8 Plus",
  "iPhone 8",
  "iPhone 7 Plus",
  "iPhone 7",
  "iPhone SE (3rd Gen)",
  "iPhone SE (2nd Gen)"
];

export const IPHONE_STORAGES = [
  "64GB",
  "128GB",
  "256GB",
  "512GB",
  "1TB"
];

export const SAMPLE_TRANSACTIONS = [
  {
    id: "TRX-QC-9842",
    date: "2023-11-24",
    customerName: "James Sterling",
    customerWa: "081234567890",
    deviceModel: "iPhone 15 Pro Max",
    deviceStorage: "512GB",
    deviceColor: "Natural Titanium",
    buyPrice: 15500000,
    sellPrice: 19999000,
    totalRepairCost: 0,
    netProfit: 4499000,
    eligibility: "LAYAK BELI" as const,
    notes: "Body mulus, iCloud aman, baterai health 100%. Kemungkinan untung tinggi.",
    partsState: {}
  },
  {
    id: "TRX-QC-9841",
    date: "2023-11-23",
    customerName: "Aria Thompson",
    customerWa: "082345678901",
    deviceModel: "iPhone 14 Pro",
    deviceStorage: "256GB",
    deviceColor: "Space Black",
    buyPrice: 12000000,
    sellPrice: 14500000,
    totalRepairCost: 0,
    netProfit: 2500000,
    eligibility: "LAYAK BELI" as const,
    notes: "Layar mulus, faceID lancar, body mulus.",
    partsState: {}
  },
  {
    id: "TRX-QC-9840",
    date: "2023-11-23",
    customerName: "Leo Vance",
    customerWa: "083456789012",
    deviceModel: "iPhone 13 Mini",
    deviceStorage: "128GB",
    deviceColor: "Starlight",
    buyPrice: 7000000,
    sellPrice: 6500000,
    totalRepairCost: 0, // In original screenshot, fail had totalRepairCost causing negative profit
    netProfit: -500000,
    eligibility: "BERESIKO" as const,
    notes: "Layar retak major fault, housing penyok, baterai drop, kempis. Beresiko merugi.",
    partsState: {}
  }
];
