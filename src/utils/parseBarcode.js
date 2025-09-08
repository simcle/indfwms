export const parseBarcode = (barcodeRaw) => {
    const barcode = String(barcodeRaw).trim()

    if (barcode.length !== 73) {
        return {
        valid: false,
        message: "Barcode length invalid",
        original: barcode
        };
    }

    // KODE MATERIAL
    const kodeMaterialRaw = barcode.slice(0, 18);
    const kodeMaterial = kodeMaterialRaw.replace(/^0+/, '');
    // KODE JENIS
    const kodeJenisChar = barcode.slice(18, 19);
    const jenisMap = {
        B: "SEASONING",
        M: "OIL",
        S: "VEGETABLE"
    };
    // BATCH NUMBER
    const batchNumber = barcode.slice(19, 27)
    // PACK NUMBER 
    const packNo = barcode.slice(27, 30)
    // CARTON NUMBER
    const cartNo = barcode.slice(32, 35)
    // CONTENT
    const content = barcode.slice(39, 43)
    // WEIGHT 
    const weight = barcode.slice(44, 49)
    // PITCH
    const pitch = barcode.slice(49, 52)
    // BEST BEFORE
    const bestBefore = barcode.slice(52, 57)
    const additionalText = barcode.slice(59, 62)
    const processOrder =  barcode.slice(62, 73)
    
    return {
        valid: true,
        origin: barcode,
        kodeSAP: kodeMaterialRaw,
        kodeMaterial,
        kodeJenis: jenisMap[kodeJenisChar] || "Unknown",
        batch: batchNumber,
        packNo,
        cartNo,
        content,
        weight,
        pitch,
        bestBefore,
        additionalText,
        processOrder
    }
    
}