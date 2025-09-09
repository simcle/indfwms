import BarcodeScan from "../models/BarcodeScan.js";
import dayjs from 'dayjs'

export const getBarcodeScans = async (req, res) => {
    try {
        const { search, kodeJenis, startDate, endDate, page = 1, limit = 20 } = req.query

        const query = {}
        if(search) {
            query.kodeMaterial = search
        }
        if (kodeJenis) {
            query.kodeJenis = kodeJenis.toUpperCase()
        }

        if (startDate || endDate) {
            const stat = dayjs(startDate).startOf("day").format('YYYY-MM-DD HH:mm:ss')
            const end = dayjs(endDate).endOf('day').format('YYYY-MM-DD HH:mm:ss')

            query.scanDate = {}
            if (startDate) query.scanDate.$gte = stat
            if (endDate) query.scanDate.$lte = end
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