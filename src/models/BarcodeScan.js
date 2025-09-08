import mongoose from 'mongoose';

const barcodeScanSchema = new mongoose.Schema({
  origin: { type: String, required: true },    // full barcode string
  kodeSAP: String,                             // original SAP code (18 digit, masih ada nol)
  kodeMaterial: String,                        // SAP code yang sudah di-trim dari nol di depan
  description: String,                         // dari sapInfo
  label: String,                               // dari sapInfo
  typeCode: String,                            // dari sapInfo
  kodeJenis: String,                           // OIL, SEASONING, dll
  batch: String,
  packNo: String,
  cartNo: String,
  content: String,
  weight: String,
  pitch: String,
  bestBeforeRaw: String,                       // contoh: "14C25"
  bestBefore: Date,                            // parsed jadi tanggal ISO
  additionalText: String,
  processOrder: String,
  scanDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('BarcodeScan', barcodeScanSchema);