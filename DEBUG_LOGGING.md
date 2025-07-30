# Debug Logging Control

## Overview
The Aztec decoder includes a comprehensive debug logging system that can be enabled for troubleshooting.

## Debug Flags

### Main ZBar Scanner
- **File**: `zbar-custom/zbar/img_scanner.c`
- **Flag**: `ZBAR_DEBUG_LOGGING`
- **Controls**: Image scanning, boundary protection, memory access debugging

### Aztec Decoder
- **File**: `zbar-custom/zbar/decoder/aztec.c`  
- **Flag**: `AZTEC_DEBUG_LOGGING`
- **Controls**: Bull's-eye detection, orientation, data extraction debugging

## Enabling Debug Output

### For Development/Troubleshooting:
1. Set flag to `1` in the respective source file:
   ```c
   #define ZBAR_DEBUG_LOGGING 1    // Enable ZBar scanner debug
   #define AZTEC_DEBUG_LOGGING 1   // Enable Aztec decoder debug
   ```

2. Rebuild the project:
   ```bash
   cd zbar-custom && make
   cd /projects/zbar-wasm-test && make -f Makefile.aztec clean-aztec && make -f Makefile.aztec aztec
   ```

3. Debug output will appear in browser console with emoji prefixes:
   - `🚨 ZBAR:` - Main scanner events
   - `🎯 AZTEC:` - Bull's-eye detection
   - `📊 AZTEC:` - Data extraction
   - `✅ AZTEC:` - Success messages

### For Production:
- Keep flags set to `0` (default) for optimal performance
- No debug output will be generated, improving speed and reducing console noise

## Performance Impact
- **Debug Disabled**: Minimal performance impact (compile-time optimization)
- **Debug Enabled**: Significant console output may slow scanning for large images

## Troubleshooting Common Issues
- **Memory crashes**: Enable `ZBAR_DEBUG_LOGGING` to trace boundary violations
- **Detection failures**: Enable `AZTEC_DEBUG_LOGGING` to trace pattern matching
- **False positives**: Use both flags to analyze scanning behavior 