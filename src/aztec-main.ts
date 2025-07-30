/**
 * Aztec Barcode Decoder - Browser Integration
 * 
 * Optimized WebAssembly-based Aztec barcode scanner for browser environments.
 * Built from custom ZBar library with Aztec-only support for minimal size.
 */

// Core Aztec decoder exports
export { AztecDecoder } from './AztecDecoder'
export type { AztecScanResult, AztecScanOptions } from './AztecDecoder'

// WebAssembly instance management
export {
  getAztecInstance,
  setAztecModuleArgs,
  isAztecModuleAvailable,
  getAztecModuleInfo
} from './aztec-instance'
export type { AztecModuleArgs } from './aztec-instance'

// Low-level access for advanced users
export { ZBarSymbolType, ZBarConfigType, ZBarOrientation } from './enum'
export { ZBarImage } from './ZBarImage'
export { ZBarSymbol } from './ZBarSymbol'

// Convenience functions for common use cases
export {
  scanImageData,
  scanCanvas,
  scanVideoFrame,
  scanFile
} from './aztec-utils'

/**
 * Simple scan function for quick integration
 * Scans ImageData and returns the first Aztec code found
 */
export async function scanAztec(imageData: ImageData): Promise<string | null> {
  try {
    const results = await AztecDecoder.scanImageData(imageData, { maxSymbols: 1 })
    return results.length > 0 ? results[0].data : null
  } catch (error) {
    console.error('Aztec scan failed:', error)
    return null
  }
}

/**
 * Version information
 */
export const version = {
  library: '1.0.0',
  aztecDecoder: '1.0.0-custom',
  zbar: '0.23.90-aztec'
}

/**
 * Quick check if Aztec decoding is ready
 */
export async function isReady(): Promise<boolean> {
  try {
    await getAztecInstance()
    return true
  } catch {
    return false
  }
} 