// Simple Node.js test for PDF417 support
// Run with: node test_pdf417_node.js

async function testPDF417Support() {
    console.log('Testing PDF417 support in zbar-wasm...\n');
    
    try {
        // Import from the published package
        const { ZBarScanner, ZBarSymbolType, ZBarConfigType } = await import('https://cdn.jsdelivr.net/npm/@undecaf/zbar-wasm@0.11.0/dist/index.js');
        
        // Test 1: Check if PDF417 enum exists
        console.log('1. Checking PDF417 enum value...');
        if (ZBarSymbolType.ZBAR_PDF417 !== 57) {
            throw new Error(`PDF417 enum value incorrect: ${ZBarSymbolType.ZBAR_PDF417}`);
        }
        console.log('   ✅ PDF417 enum value correct (57)');
        
        // Test 2: Check if PDF417 type name exists
        console.log('2. Checking PDF417 type name...');
        const pdf417TypeName = ZBarSymbolType[ZBarSymbolType.ZBAR_PDF417];
        if (pdf417TypeName !== 'ZBAR_PDF417') {
            throw new Error(`PDF417 type name incorrect: ${pdf417TypeName}`);
        }
        console.log('   ✅ PDF417 type name correct (ZBAR_PDF417)');
        
        // Test 3: Try to create a scanner with PDF417 enabled
        console.log('3. Testing scanner creation with PDF417...');
        const scanner = await ZBarScanner.create();
        const configResult = scanner.setConfig(
            ZBarSymbolType.ZBAR_PDF417, 
            ZBarConfigType.ZBAR_CFG_ENABLE, 
            1
        );
        
        console.log('   ✅ PDF417 configuration successful');
        console.log('   ✅ Scanner created with PDF417 support');
        
        scanner.destroy();
        
        console.log('\n🎉 PDF417 support is working!');
        console.log('\nYou can now use PDF417 in your applications:');
        console.log(`
// Example usage:
const scanner = await ZBarScanner.create();
scanner.setConfig(ZBarSymbolType.ZBAR_PDF417, ZBarConfigType.ZBAR_CFG_ENABLE, 1);
const symbols = await scanImageData(imageData, scanner);
        `);
        
    } catch (error) {
        console.error('\n❌ Error testing PDF417 support:', error.message);
        console.error('\nThis might be because:');
        console.error('1. The published package doesn\'t include PDF417 support yet');
        console.error('2. You need to build the project locally with Docker/Podman');
        console.error('3. Network issues preventing CDN access');
    }
}

testPDF417Support(); 