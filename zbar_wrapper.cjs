// Node.js wrapper for the built zbar WASM module
const fs = require('fs');
const path = require('path');

async function loadZBarWasm() {
    // Read the WASM JavaScript loader
    const jsFile = path.join(__dirname, 'build', 'zbar.js');
    const moduleCode = fs.readFileSync(jsFile, 'utf8');
    
    // Create a proper execution context with Node.js globals
    const moduleFunc = new Function(
        'require', 
        'module', 
        'exports', 
        '__filename', 
        '__dirname',
        'process',
        'global',
        'Buffer',
        moduleCode + '\nreturn zbarWasm;'
    );
    
    // Call with proper Node.js context
    const zbarWasm = moduleFunc(
        require,
        { exports: {} },
        {},
        jsFile,
        path.dirname(jsFile),
        process,
        global,
        Buffer
    );
    
    // Initialize the WASM module
    const module = await zbarWasm();
    
    return module;
}

module.exports = { loadZBarWasm };