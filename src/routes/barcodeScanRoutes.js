import express from 'express'
import { getBarcodeScans } from '../controllers/barcodeScanController.js'

const router = express.Router()

router.get('/', getBarcodeScans)

export default router