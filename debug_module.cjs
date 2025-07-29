// Debug script to inspect what's available in our built WASM module
// Run with: node debug_module.cjs

async function debugModule() {
    console.log('🔍 Debugging built WASM module...\n');
    
    try {
        // Load the built module  
        const zbarWasm = require('./build/zbar.js');
        
        console.log('📦 Loading module...');
        const Module = await zbarWasm();
        
        console.log('✅ Module loaded successfully!\n');
        
        // Inspect what's available
        console.log('📋 Available properties on Module:');
        console.log('=====================================');
        
        const props = Object.getOwnPropertyNames(Module);
        props.sort().forEach(prop => {
            const value = Module[prop];
            const type = typeof value;
            console.log(`${prop}: ${type}`);
            
            if (type === 'function') {
                try {
                    console.log(`  └─ Function signature: ${value.toString().substring(0, 100)}...`);
                } catch (e) {
                    console.log(`  └─ Native function`);
                }
            }
        });
        
        console.log('\n🔍 Looking for ZBar-related exports:');
        console.log('====================================');
        
        const zbarRelated = props.filter(prop => 
            prop.toLowerCase().includes('zbar') || 
            prop.toLowerCase().includes('scan') ||
            prop.toLowerCase().includes('symbol') ||
            prop.toLowerCase().includes('image')
        );
        
        if (zbarRelated.length > 0) {
            zbarRelated.forEach(prop => {
                console.log(`✅ ${prop}: ${typeof Module[prop]}`);
            });
        } else {
            console.log('❌ No obvious ZBar-related exports found');
        }
        
        console.log('\n🔍 Looking for C-style functions (starting with _):');
        console.log('==================================================');
        
        const cFunctions = props.filter(prop => prop.startsWith('_'));
        cFunctions.slice(0, 20).forEach(prop => {  // Show first 20
            console.log(`${prop}: ${typeof Module[prop]}`);
        });
        
        if (cFunctions.length > 20) {
            console.log(`... and ${cFunctions.length - 20} more C functions`);
        }
        
        console.log('\n🔍 Memory and utility functions:');
        console.log('=================================');
        
        ['_malloc', '_free', 'HEAP8', 'HEAPU8', 'HEAP32', 'ccall', 'cwrap'].forEach(name => {
            if (Module[name] !== undefined) {
                console.log(`✅ ${name}: ${typeof Module[name]}`);
            } else {
                console.log(`❌ ${name}: not found`);
            }
        });
        
        console.log('\n💡 Analysis:');
        console.log('============');
        
        if (Module.ZBarScanner) {
            console.log('✅ High-level JavaScript API available');
        } else if (cFunctions.some(f => f.includes('zbar'))) {
            console.log('🔧 Only C-level API available - need to use direct C functions');
        } else {
            console.log('❌ No obvious ZBar functions found - check build configuration');
        }
        
    } catch (error) {
        console.error('❌ Error loading module:', error.message);
    }
}

debugModule();