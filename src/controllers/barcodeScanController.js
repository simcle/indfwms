import BarcodeScan from "../models/BarcodeScan.js";

export const getBarcodeScans = async (req, res) => {
    try {
        const { typeCode, start, end, page = 1, limit = 20 } = req.query

        const query = {}

        if (typeCode) {
        query.typeCode = typeCode.toUpperCase()
        }

        if (start || end) {
        query.scanDate = {}
        if (start) query.scanDate.$gte = new Date(start)
        if (end) query.scanDate.$lte = new Date(end)
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