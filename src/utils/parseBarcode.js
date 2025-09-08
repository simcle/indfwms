export const parseBarcode = (barcodeRaw) => {
    const barcode = String(barcodeRaw).trim()

    if (barcode.length !== 73) {
        return {
        valid: false,
        message: "Barcode length invalid",
        original: barcode
        };
    }

    const kodeMaterialRaw = barcode.slice(0, 18);
    const kodeMaterial = kodeMaterialRaw.replace(/^0+/, '');

    return {
        valid: true,
        origin: barcode,
        kodeMaterial
    }
    
}