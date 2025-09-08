import fs from 'fs'
import path from 'path'

const sapCodePath = path.resolve('src/utils/sap_code.json');

let sapCodes = [];
try {
  const rawData = fs.readFileSync(sapCodePath);
  sapCodes = JSON.parse(rawData);
} catch (err) {
  console.error("❌ Failed to load sap_code.json:", err.message);
}

// Mapping bulan dari huruf
const monthMap = {
  A: 1, B: 2, C: 3, D: 4,
  E: 5, F: 6, G: 7, H: 8,
  I: 9, J: 10, K: 11, L: 12
};

function parseBestBefore(raw) {
  if (!raw || raw.length !== 5) return null;

  const day = parseInt(raw.slice(0, 2), 10);
  const monthCode = raw[2].toUpperCase();
  const year = parseInt("20" + raw.slice(3), 10);
  const month = monthMap[monthCode];

  if (!month || isNaN(day) || isNaN(year)) return null;

  const date = new Date(year, month - 1, day);
  return date.toISOString().split("T")[0]; // format: yyyy-mm-dd
}

export const parseBarcode = (barcodeRaw) => {
  const barcode = String(barcodeRaw).trim();

  if (barcode.length !== 73) {
    return {
      valid: false,
      message: "Barcode length invalid",
      original: barcode
    };
  }

  const kodeMaterialRaw = barcode.slice(0, 18);
  const kodeMaterial = kodeMaterialRaw.replace(/^0+/, '');
  const sapInfo = sapCodes.find(entry => entry.sapCode === kodeMaterialRaw);

  const kodeJenisChar = barcode.slice(18, 19);
  const jenisMap = { B: "SEASONING", M: "OIL", S: "VEGETABLE" };

  const batchNumber = barcode.slice(19, 27);
  const packNo = barcode.slice(27, 30);
  const cartNo = barcode.slice(32, 35);
  const content = barcode.slice(39, 43);
  const weight = barcode.slice(44, 49);
  const pitch = barcode.slice(49, 52);
  const bestBeforeRaw = barcode.slice(52, 57);
  const bestBefore = parseBestBefore(bestBeforeRaw);
  const additionalText = barcode.slice(59, 62);
  const processOrder = barcode.slice(62, 73);

  return {
    valid: true,
    origin: barcode,
    kodeSAP: kodeMaterialRaw,
    sapInfo: sapInfo ? {
      description: sapInfo.description,
      label: sapInfo.label,
      typeCode: sapInfo.typeCode
    } : null,
    kodeMaterial,
    kodeJenis: jenisMap[kodeJenisChar] || "Unknown",
    batch: batchNumber,
    packNo,
    cartNo,
    content,
    weight,
    pitch,
    bestBeforeRaw,
    bestBefore,
    additionalText,
    processOrder,
    scanDate: new Date()
  };
};