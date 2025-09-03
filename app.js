import "dotenv/config"
import { connectMqtt } from "./src/mqttClient.js"
import "./src/utils/opcClient.js"

connectMqtt(process.env.MQTT_URL)
