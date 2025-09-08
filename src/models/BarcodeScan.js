import mongoose from 'mongoose'

const barcodeScanSchema = new mongoose.Schema({
  origin: String,
  kodeSAP: String,
  kodeMaterial: String,
  kodeJenis: String,
  batch: String,
  packNo: String,
  cartNo: String,
  content: String,
  weight: String,
  pitch: String,
  bestBefore: String,
  additionalText: String,
  processOrder: String,
  description: String,
  label: String,
  typeCode: String,
  scannedAt: {
    type: Date,
    default: Date.now
  }
})

export const BarcodeScan = mongoose.model('BarcodeScan', barcodeScanSchema)