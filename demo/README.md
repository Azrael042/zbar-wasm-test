# Aztec Barcode Decoder Demo

🔲 This demo showcases the WebAssembly-powered Aztec barcode decoder built from your custom ZBar library.

## Features

- **📁 File Upload**: Drag and drop or select image files to scan for Aztec codes
- **📹 Camera Scanning**: Real-time Aztec code scanning using device camera
- **⚡ Fast Performance**: Optimized WebAssembly with ~29KB binary size
- **🎯 Aztec-Only**: Specialized decoder for maximum efficiency

## Getting Started

### Option 1: Open Directly in Browser

1. Open `aztec-demo.html` in a modern web browser
2. The demo will automatically load the WebAssembly module
3. Try uploading an image with an Aztec code or use camera scanning

### Option 2: Serve with HTTP Server

For camera access and full functionality, serve the demo over HTTPS:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server . -p 8000

# Using any other static file server
```

Then visit: `http://localhost:8000/aztec-demo.html`

## WebAssembly Build

The demo uses the optimized Aztec-only WebAssembly build:

- **Standard Build**: `../build-aztec/aztec.js` + `aztec.wasm` (43KB total)
- **Inlined Build**: `../build-aztec/aztec-inlined.js` (51KB single file)

## Technical Specifications

| Feature | Value |
|---------|-------|
| Library Size | ~29KB WASM + 14KB JS |
| Supported Codes | Aztec Only |
| Memory Usage | ~1MB runtime |
| Performance | < 50ms typical scan time |
| Browser Support | All modern browsers with WebAssembly |

## Browser Compatibility

- ✅ Chrome 57+
- ✅ Firefox 52+
- ✅ Safari 11+
- ✅ Edge 16+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## API Usage

The demo demonstrates direct WebAssembly usage. For production applications, use the TypeScript bindings:

```typescript
import { AztecDecoder } from '../src/aztec-main'

// Scan an image
const results = await AztecDecoder.scanImageData(imageData)

// Start camera scanning
const { scanner, stop } = await startCameraScanning(
  (results) => console.log('Found:', results),
  (error) => console.error('Error:', error)
)
```

## Sample Images

To test the decoder, you can generate Aztec codes using online generators:
- [Online Aztec Generator](https://www.qr-code-generator.com/aztec/)
- [ZXing Aztec Generator](https://zxing.appspot.com/generator)

## Troubleshooting

### Camera Not Working
- Ensure you're serving over HTTPS or localhost
- Grant camera permissions when prompted
- Try switching between front/rear cameras

### Scan Issues
- Ensure good lighting and focus
- Try different angles and distances
- Verify the image contains a valid Aztec code

### Loading Errors
- Check browser console for detailed error messages
- Ensure WebAssembly files are accessible
- Verify all files are served from the same origin 