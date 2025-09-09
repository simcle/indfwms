import BarcodeScan from "../models/BarcodeScan.js";

export const getBarcodeScans = async (req, res) => {
    try {
        const { kodeJenis, startDate, endDate, page = 1, limit = 20 } = req.query

        const query = {}

        if (kodeJenis) {
            query.kodeJenis = kodeJenis.toUpperCase()
        }

        if (startDate || endDate) {
            query.scanDate = {}
            if (startDate) query.scanDate.$gte = new Date(startDate)
            if (endDate) query.scanDate.$lte = new Date(endDate)
        }

        const skip = (parseInt(page) - 1) * parseInt(limit)
        const total = await BarcodeScan.countDocuments(query)
        const data = await BarcodeScan.find(query)
        .sort({ scanDate: -1 })
        .skip(skip)
        .limit(parseInt(limit))

        res.json({
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit),
            data
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}