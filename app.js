import "dotenv/config"
import express from 'express'
import cors from 'cors'

import { connectDB } from "./src/utils/db.js"

import path from 'path'
import { fileURLToPath } from "url"

import { connectMqtt } from "./src/mqttClient.js"
import "./src/utils/opcClient.js"


// Routes
import barCodeSscanRoutes from './src/routes/barcodeScanRoutes.js'



await connectDB()

connectMqtt(process.env.MQTT_URL)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())

app.use(express.static(path.join(__dirname, 'public')))

app.use('/barcode', barCodeSscanRoutes);


const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})