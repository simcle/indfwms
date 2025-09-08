import "dotenv/config"
import {
    OPCUAClient,
    AttributeIds,
    TimestampsToReturn,
    ClientSubscription,
    ClientMonitoredItem
} from "node-opcua";

import { publish } from "../mqttClient.js";

const endpointUrl = process.env.OPC_URL
const certificateFile = process.env.OPC_CERT
const privateKeyFile = process.env.OPC_KEY

// Daftar tag yang ingin disubscribe
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
    { name: "Monitor_Barcode_5", nodeId: "ns=4;s=OPC_Monitor_Barcode_5" },
];

const client = OPCUAClient.create({
    endpointMustExist: false,
    securityMode: "None",
    securityPolicy: "None",
    certificateFile,
    privateKeyFile
});


// Untuk menyimpan nilai terakhir semua tag
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

        item.on("changed", (dataValue) => {
            let raw = dataValue.value.value

            if (Array.isArray(raw)) {
                // Versi object
                raw = {
                    flag: raw[0],
                    count: raw[1]
                };
            }
            latestValues[tag.name] = raw
            latestValues.timestamp = new Date().toISOString();
            publish("opc/data", latestValues)
        });
    }

    } catch (err) {
        console.error("❌ Error:", err.message);
    }
}

main();