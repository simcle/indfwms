import mqtt from 'mqtt'

let client = null;
export const connectMqtt = (brokerUrl = 'mqtt://10.10.40.19:1883', options = {}) => {
    client = mqtt.connect(brokerUrl, {
      clientId: 'mqtt_indofood_' + Math.random().toString(16).slice(2, 8),
      reconnectPeriod: 3000,
      ...options
    })

    client.on('connect', () => {
        console.log('[MQTT] Connected')
    })
  
    client.on('reconnect', () => {
        console.log('[MQTT] Reconnecting...')
    })
  
    client.on('error', (err) => {
        console.error('[MQTT] Error:', err.message)
    })
  
    client.on('close', () => {
        console.warn('[MQTT] Disconnected')
    })
}

export const publish = (topic, message) => {
    if (!client) return console.warn('[MQTT] Not connected')
    client.publish(topic, typeof message === 'string' ? message : JSON.stringify(message), { retain: true})
}