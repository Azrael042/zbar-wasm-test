// Simple Node.js test for PDF417 support without dependencies
// This test uses the built files directly instead of npm packages

async function testPDF417Support() {
    console.log('Testing PDF417 support in zbar-wasm (simple test)...\n');
    
    try {
        // Try to test if we can build the project first
        console.log('1. Checking if project is built...');
        const fs = await import('fs');
        const path = await import('path');
        
        const distPath = path.join(process.cwd(), 'dist');
        const exists = fs.existsSync(distPath);
        
        if (!exists) {
            console.log('   ❌ Project not built yet. Need to run `make` first.');
            console.log('\nTo build the project:');
            console.log('1. Install Docker or Podman');
            console.log('2. Run: make');
            console.log('3. This will build the WASM files with PDF417 support');
            return;
        }
        
        console.log('   ✅ Project appears to be built');
        
        // Try to import the built module
        console.log('2. Testing local build...');
        const zbarPath = path.join(process.cwd(), 'dist', 'main.mjs');
        
        if (fs.existsSync(zbarPath)) {
            const zbarWasm = await import(zbarPath);
            
            // Test PDF417 enum
            if (zbarWasm.ZBarSymbolType && zbarWasm.ZBarSymbolType.ZBAR_PDF417 === 57) {
                console.log('   ✅ PDF417 enum found and correct (57)');
            } else {
                throw new Error('PDF417 enum not found or incorrect');
            }
            
            // Test scanner creation
            const scanner = await zbarWasm.ZBarScanner.create();
            const configResult = scanner.setConfig(
                zbarWasm.ZBarSymbolType.ZBAR_PDF417, 
                zbarWasm.ZBarConfigType.ZBAR_CFG_ENABLE, 
                1
            );
            console.log('   ✅ Scanner created with PDF417 support');
            scanner.destroy();
            
            console.log('\n🎉 PDF417 support is working in the local build!');
        } else {
            console.log('   ❌ Built files not found at expected location');
        }
        
    } catch (error) {
        console.error('\n❌ Error testing PDF417 support:', error.message);
        console.error('\nTo fix this:');
        console.error('1. Build the project: make');
        console.error('2. Or install system dependencies and run: npm install');
    }
}

testPDF417Support();