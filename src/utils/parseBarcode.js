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
    return {
        valid: true,
        origin: barcode,
        kodeMaterial,
        kodeJenis: jenisMap[kodeJenisChar] || "Unknown"
    }
    
}