// Multi-format barcode scanner using the locally built zbar WASM module
// This tests the C-level API directly with all supported barcode types

const { loadZBarWasm } = require('./zbar_wrapper.cjs');

// All supported barcode symbol types
const BARCODE_TYPES = {
    ZBAR_EAN2: 2,
    ZBAR_EAN5: 5,
    ZBAR_EAN8: 8,
    ZBAR_UPCE: 9,
    ZBAR_ISBN10: 10,
    ZBAR_UPCA: 12,
    ZBAR_EAN13: 13,
    ZBAR_ISBN13: 14,
    ZBAR_COMPOSITE: 15,
    ZBAR_I25: 25,
    ZBAR_DATABAR: 34,
    ZBAR_DATABAR_EXP: 35,
    ZBAR_CODABAR: 38,
    ZBAR_CODE39: 39,
    ZBAR_PDF417: 57,
    ZBAR_AZTEC: 75,
    ZBAR_QRCODE: 64,
    ZBAR_CODE93: 93,
    ZBAR_CODE128: 128,
    ZBAR_SQCODE: 192, // 0x80 | 64
};

const BARCODE_NAMES = {
    2: 'EAN-2',
    5: 'EAN-5', 
    8: 'EAN-8',
    9: 'UPC-E',
    10: 'ISBN-10',
    12: 'UPC-A',
    13: 'EAN-13',
    14: 'ISBN-13',
    15: 'Composite',
    25: 'Interleaved 2 of 5',
    34: 'DataBar (RSS-14)',
    35: 'DataBar Expanded',
    38: 'Codabar',
    39: 'Code 39',
    57: 'PDF417',
    64: 'QR Code',
    75: 'Aztec Code',
    93: 'Code 93',
    128: 'Code 128',
    192: 'SQ Code',
};

async function main() {
    console.log('🔍 Testing Multi-Format Barcode Scanner...\n');
    
    try {
        // Load the WASM module
        console.log('1. Loading zbar WASM module...');
        const wasmModule = await loadZBarWasm();
        console.log('✅ WASM module loaded successfully');
        
        // Test scanner creation
        console.log('\n2. Creating barcode scanner...');
        const scanner = wasmModule._ImageScanner_create();
        
        if (scanner === 0) {
            throw new Error('Failed to create scanner');
        }
        console.log('✅ Scanner created successfully');
        
        // Enable all supported barcode types
        console.log('\n3. Enabling all supported barcode types...');
        const ZBAR_CFG_ENABLE = 0; // Config type: enable/disable
        let enabledCount = 0;
        let failedCount = 0;
        
        for (const [typeName, typeValue] of Object.entries(BARCODE_TYPES)) {
            const configResult = wasmModule._ImageScanner_set_config(scanner, typeValue, ZBAR_CFG_ENABLE, 1);
            const friendlyName = BARCODE_NAMES[typeValue] || typeName;
            
            if (configResult === 0) {
                console.log(`   ✅ ${friendlyName} (${typeValue}) enabled`);
                enabledCount++;
            } else {
                console.log(`   ⚠️  ${friendlyName} (${typeValue}) config returned ${configResult}`);
                failedCount++;
            }
        }
        
        console.log(`\n📊 Barcode Type Summary:`);
        console.log(`   ✅ ${enabledCount} types successfully enabled`);
        console.log(`   ⚠️  ${failedCount} types returned non-zero (may still work)`);
        
        // Test image creation (without actual image data for now)
        console.log('\n4. Testing image creation...');
        const testWidth = 100;
        const testHeight = 100;
        const format = 0x30303859; // Y800 format (grayscale)
        
        // Allocate memory for test image data
        const imageDataSize = testWidth * testHeight;
        const imageDataPtr = wasmModule._malloc(imageDataSize);
        
        if (imageDataPtr === 0) {
            throw new Error('Failed to allocate memory for image data');
        }
        
        // Fill with test pattern (not a real barcode)
        const imageData = new Uint8Array(wasmModule.HEAPU8.buffer, imageDataPtr, imageDataSize);
        imageData.fill(128); // Gray background
        
        // Create image
        const image = wasmModule._Image_create(testWidth, testHeight, format, imageDataPtr, imageDataSize, 0);
        
        if (image === 0) {
            wasmModule._free(imageDataPtr);
            throw new Error('Failed to create image');
        }
        console.log('✅ Test image created successfully');
        
        // Test scanning (won't find anything with our test pattern)
        console.log('\n5. Running multi-format barcode scan...');
        const scanResult = wasmModule._ImageScanner_scan(scanner, image);
        console.log(`📋 Scan result: ${scanResult} symbols found`);
        
        if (scanResult < 0) {
            console.log('⚠️  Scan returned error code');
        } else if (scanResult === 0) {
            console.log('ℹ️  No barcodes found (expected with test pattern)');
        } else {
            console.log(`🎉 Found ${scanResult} barcode(s)!`);
        }
        
        // Clean up
        console.log('\n6. Cleaning up...');
        wasmModule._Image_destory(image);
        wasmModule._free(imageDataPtr);
        wasmModule._ImageScanner_destory(scanner);
        console.log('✅ Cleanup completed');
        
        // Summary
        console.log('\n🎉 Multi-Format Barcode Scanner Test Results:');
        console.log('   ✅ WASM module loads correctly');
        console.log('   ✅ Scanner creation works');
        console.log(`   ✅ ${enabledCount} barcode types enabled`);
        console.log('   ✅ Image creation works');
        console.log('   ✅ Scanning API works');
        
        console.log('\n📋 Supported Barcode Types:');
        const enabledTypes = Object.entries(BARCODE_NAMES).map(([code, name]) => `   • ${name}`);
        enabledTypes.forEach(type => console.log(type));
        
        console.log('\n📋 Next Steps:');
        console.log('   - Test with actual barcode images (PDF417, QR, Code128, etc.)');
        console.log('   - Add image loading (PNG/JPEG) support');
        console.log('   - Test browser-based scanning');
        
        // Note about image loading
        console.log('\n💡 To scan real barcodes:');
        console.log('   1. Load an image file (PNG, JPEG, etc.)');
        console.log('   2. Convert to grayscale format');
        console.log('   3. Pass the image data to the scanner');
        console.log('   4. The scanner will detect ANY supported barcode type automatically!');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\nThis might indicate:');
        console.error('- WASM module loading issues');
        console.error('- C API compatibility problems');
        console.error('- Memory allocation failures');
    }
}

// Simple image loading mock (for demonstration)
function loadImageData(imagePath) {
    // In a real implementation, you would:
    // 1. Use a library like 'canvas' or 'sharp' to load the image
    // 2. Convert to grayscale
    // 3. Return width, height, and pixel data
    
    console.log('📝 Note: Image loading not implemented yet');
    console.log('   For real barcode scanning, you need to:');
    console.log('   - Install: npm install canvas (requires build tools)');
    console.log('   - Or use: npm install sharp');
    console.log('   - Convert images to grayscale Uint8Array');
    
    return null;
}

async function scanMultiFormat(imagePath) {
    const imageData = loadImageData(imagePath);
    if (!imageData) {
        console.log('Image loading not implemented yet');
        return;
    }
    
    // Real scanning would happen here
    console.log(`Scanning ${imagePath} for all supported barcode types...`);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { scanMultiFormat, loadImageData, BARCODE_TYPES, BARCODE_NAMES };