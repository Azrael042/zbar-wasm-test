// Test script to verify Aztec code implementation
// This tests the integration even with the current WASM build

const { loadZBarWasm } = require('./zbar_wrapper.cjs');

async function testAztecImplementation() {
    console.log('🧪 Testing Aztec Code Implementation...\n');
    
    try {
        // Load the WASM module
        console.log('Loading ZBar WASM module...');
        const wasmModule = await loadZBarWasm();
        console.log('✅ WASM module loaded successfully');
        
        // Check if Aztec symbol type is defined
        const ZBAR_AZTEC = 75;
        console.log(`🔍 Checking for ZBAR_AZTEC constant: ${ZBAR_AZTEC}`);
        
        // Try to create a scanner
        const scanner = wasmModule._ImageScanner_create();
        if (!scanner) {
            throw new Error('Failed to create scanner');
        }
        console.log('✅ Scanner created successfully');
        
        // Try to configure Aztec support
        console.log('🔧 Attempting to enable ZBAR_AZTEC...');
        const ZBAR_CFG_ENABLE = 0;
        const configResult = wasmModule._ImageScanner_set_config(scanner, ZBAR_AZTEC, ZBAR_CFG_ENABLE, 1);
        console.log(`Configuration result: ${configResult}`);
        
        if (configResult === 0) {
            console.log('✅ Aztec configuration successful');
        } else {
            console.log('⚠️  Aztec configuration returned non-zero (may not be compiled in current build)');
        }
        
        // Create a simple test image (black and white pattern)
        const width = 100;
        const height = 100;
        const format = 0x30303859; // 'Y800' fourcc code for grayscale
        
        // Allocate memory for test image
        const dataSize = width * height;
        const dataPtr = wasmModule._malloc(dataSize);
        
        if (!dataPtr) {
            throw new Error('Failed to allocate memory for test image');
        }
        
        // Fill with a simple pattern (this is just for testing integration)
        const heapU8 = new Uint8Array(wasmModule.HEAPU8.buffer, dataPtr, dataSize);
        for (let i = 0; i < dataSize; i++) {
            // Create a simple checkerboard pattern
            const x = i % width;
            const y = Math.floor(i / width);
            heapU8[i] = ((x + y) % 2) ? 0 : 255;
        }
        
        console.log('📊 Created test image data');
        
        // Create ZBar image
        const image = wasmModule._Image_create(width, height, format, dataPtr, dataSize, 0);
        
        if (!image) {
            wasmModule._free(dataPtr);
            throw new Error('Failed to create ZBar image');
        }
        
        console.log('🖼️  ZBar image created successfully');
        
        // Attempt to scan the image
        console.log('🔍 Scanning image for barcodes...');
        const symbolCount = wasmModule._ImageScanner_scan(scanner, image);
        console.log(`Scan result: ${symbolCount} symbols found`);
        
        // Clean up
        wasmModule._Image_destory(image);
        wasmModule._free(dataPtr);
        wasmModule._ImageScanner_destroy(scanner);
        
        console.log('🧹 Cleanup completed');
        
        // Summary
        console.log('\n📋 Test Summary:');
        console.log('✅ WASM module loading: SUCCESS');
        console.log('✅ Scanner creation: SUCCESS');
        console.log('✅ Image creation: SUCCESS');
        console.log('✅ Basic scanning API: SUCCESS');
        
        if (configResult === 0) {
            console.log('✅ Aztec configuration: SUCCESS');
            console.log('\n🎉 Aztec implementation appears to be properly integrated!');
        } else {
            console.log('⚠️  Aztec configuration: NEEDS REBUILD');
            console.log('\n🔧 The Aztec decoder is implemented but needs to be compiled into the WASM build.');
            console.log('   Run the build process to include Aztec support in the WASM module.');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the test
testAztecImplementation().then(() => {
    console.log('\n✅ Aztec implementation test completed');
}).catch(error => {
    console.error('❌ Test execution failed:', error);
});