import "dotenv/config";
import {
  OPCUAClient,
  AttributeIds,
  TimestampsToReturn,
  ClientSubscription,
  ClientMonitoredItem
} from "node-opcua";

import { publish } from "../mqttClient.js";
import { parseBarcode } from "./parseBarcode.js";
import BarcodeScan from "../models/BarcodeScan.js";

const endpointUrl = process.env.OPC_URL;
const certificateFile = process.env.OPC_CERT;
const privateKeyFile = process.env.OPC_KEY;

// Semua tag
const monitoredNodes = [
  { name: "Minyak_Count_Box", nodeId: "ns=4;s=Minyak_Count_Box" },
  { name: "Minyak_Count_Match", nodeId: "ns=4;s=Minyak_Count_Match" },
  { name: "Minyak_Count_NotMatch", nodeId: "ns=4;s=Minyak_Count_NotMatch" },
  { name: "Bumbu_Count_Box", nodeId: "ns=4;s=Bumbu_Count_Box" },
  { name: "Bumbu_Count_Match", nodeId: "ns=4;s=Bumbu_Count_Match" },
  { name: "Bumbu_Count_NotMatch", nodeId: "ns=4;s=Bumbu_Count_NotMatch" },
  { name: "Monitor_Barcode_1", nodeId: "ns=4;s=OPC_Monitor_Barcode_1" },
  { name: "Monitor_Barcode_2", nodeId: "ns=4;s=OPC_Monitor_Barcode_2" },
  { name: "Monitor_Barcode_3", nodeId: "ns=4;s=OPC_Monitor_Barcode_3" },
  { name: "Monitor_Barcode_4", nodeId: "ns=4;s=OPC_Monitor_Barcode_4" },
  { name: "Monitor_Barcode_5", nodeId: "ns=4;s=OPC_Monitor_Barcode_5" }
];

// Tag group untuk barcode
const barcodeTags = new Set([
  "Monitor_Barcode_1",
  "Monitor_Barcode_2",
  "Monitor_Barcode_3",
  "Monitor_Barcode_4",
  "Monitor_Barcode_5"
]);

const client = OPCUAClient.create({
  endpointMustExist: false,
  securityMode: "None",
  securityPolicy: "None",
  certificateFile,
  privateKeyFile
});

// skip first initial
const initialTriggers = new Set();

// Menyimpan nilai terakhir tag non-barcode
const latestValues = {};
async function main() {
  try {
    await client.connect(endpointUrl);
    console.log("✅ Connected to", endpointUrl);

    const session = await client.createSession();
    console.log("📘 Session created");

    const subscription = ClientSubscription.create(session, {
      requestedPublishingInterval: 1000,
      requestedLifetimeCount: 100,
      requestedMaxKeepAliveCount: 10,
      publishingEnabled: true,
      priority: 1
    });

    subscription.on("started", () => {
      console.log("🔁 Subscription started. ID:", subscription.subscriptionId);
    });

    for (const tag of monitoredNodes) {
      const item = ClientMonitoredItem.create(
        subscription,
        { nodeId: tag.nodeId, attributeId: AttributeIds.Value },
        {
          samplingInterval: 1000,
          discardOldest: true,
          queueSize: 10
        },
        TimestampsToReturn.Both
      );

      item.on("changed", async (dataValue) => {
        let raw = dataValue.value.value;

        // Cek dan skip trigger pertama
        if (!initialTriggers.has(tag.name)) {
          initialTriggers.add(tag.name);
          return; // abaikan perubahan pertama
        }

        // Jika nilai array, ubah ke bentuk object
        if (Array.isArray(raw)) {
          raw = {
            flag: raw[0],
            count: raw[1]
          };
        }
        
        const now = new Date().toISOString();

        if (barcodeTags.has(tag.name)) {
          const parsed = parseBarcode(raw)
          console.log(parsed)
          if(parsed.valid && parsed.sapInfo) {
            const saved = await BarcodeScan.create({
              origin: parsed.origin,
              kodeSAP: parsed.kodeSAP,
              kodeMaterial: parsed.kodeMaterial,
              description: parsed.sapInfo.description,
              label: parsed.sapInfo.label,
              typeCode: parsed.sapInfo.typeCode,
              kodeJenis: parsed.kodeJenis,
              batch: parsed.batch,
              packNo: parsed.packNo,
              cartNo: parsed.cartNo,
              content: parsed.content,
              weight: parsed.weight,
              pitch: parsed.pitch,
              bestBeforeRaw: parsed.bestBeforeRaw,
              bestBefore: parsed.bestBefore,
              additionalText: parsed.additionalText,
              processOrder: parsed.processOrder,
              scanDate: parsed.scanDate
            });
            publish("opc/barcode", saved.toObject())

          }
        } else {
          // Simpan dan kirim semua data non-barcode
          latestValues[tag.name] = raw;
          latestValues.timestamp = now;

          const payload = { ...latestValues };
          // console.log("📦 [DATA]", payload);
          publish("opc/data", payload);
        }
      });
    }
  } catch (err) {
    console.error("❌ OPC UA Error:", err.message);
  }
}

main();