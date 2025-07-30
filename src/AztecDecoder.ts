import { CppObject } from './CppObject'
import { ZBarImage } from './ZBarImage'
import { ZBarSymbol } from './ZBarSymbol'
import { ZBarSymbolType, ZBarConfigType } from './enum'

/**
 * Aztec barcode decoder interface
 * Optimized for Aztec code scanning with simplified API
 */
export interface AztecScanResult {
  /** Decoded text data */
  data: string
  /** Symbol type (always AZTEC) */
  type: 'AZTEC'
  /** Raw symbol data as Uint8Array */
  rawData: Uint8Array
  /** Symbol quality/confidence score */
  quality: number
  /** Location points of the detected symbol */
  location?: Array<{x: number, y: number}>
}

/**
 * Configuration options for Aztec scanning
 */
export interface AztecScanOptions {
  /** Enable result caching (default: true) */
  enableCache?: boolean
  /** Maximum number of symbols to find (default: 1) */
  maxSymbols?: number
  /** Timeout in milliseconds (default: 5000) */
  timeoutMs?: number
}

/**
 * Specialized Aztec barcode decoder
 * Provides a clean, browser-optimized interface for Aztec code scanning
 */
export class AztecDecoder extends CppObject {
  private static defaultInstance: AztecDecoder | null = null

  /**
   * Create a new Aztec decoder instance
   */
  static async create(): Promise<AztecDecoder> {
    const inst = await import('./aztec-instance').then(m => m.getAztecInstance())
    const ptr = inst._ImageScanner_create()
    const decoder = new this(ptr, inst)
    
    // Configure for Aztec-only scanning
    decoder.setConfig(ZBarSymbolType.ZBAR_AZTEC, ZBarConfigType.ZBAR_CFG_ENABLE, 1)
    decoder.setConfig(ZBarSymbolType.ZBAR_NONE, ZBarConfigType.ZBAR_CFG_BINARY, 1)
    
    return decoder
  }

  /**
   * Get a shared default instance (lazy-loaded)
   */
  static async getDefaultInstance(): Promise<AztecDecoder> {
    if (!this.defaultInstance) {
      this.defaultInstance = await this.create()
    }
    return this.defaultInstance
  }

  /**
   * Scan ImageData from canvas for Aztec codes
   */
  static async scanImageData(
    imageData: ImageData, 
    options: AztecScanOptions = {}
  ): Promise<AztecScanResult[]> {
    const decoder = await this.getDefaultInstance()
    return decoder.scanImageData(imageData, options)
  }

  /**
   * Scan a canvas element for Aztec codes
   */
  static async scanCanvas(
    canvas: HTMLCanvasElement,
    options: AztecScanOptions = {}
  ): Promise<AztecScanResult[]> {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas 2D context')
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    return this.scanImageData(imageData, options)
  }

  /**
   * Scan a video frame for Aztec codes
   */
  static async scanVideoFrame(
    video: HTMLVideoElement,
    options: AztecScanOptions = {}
  ): Promise<AztecScanResult[]> {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0)
    
    return this.scanCanvas(canvas, options)
  }

  /**
   * Dispose of the decoder and free memory
   */
  destroy(): void {
    this.checkAlive()
    this.inst._ImageScanner_destory(this.ptr) // Note: keeping original typo for compatibility
    this.ptr = 0
  }

  /**
   * Configure scanner settings
   */
  setConfig(symbolType: ZBarSymbolType, config: ZBarConfigType, value: number): number {
    this.checkAlive()
    return this.inst._ImageScanner_set_config(this.ptr, symbolType, config, value)
  }

  /**
   * Enable or disable result caching
   */
  enableCache(enable: boolean = true): void {
    this.checkAlive()
    this.inst._ImageScanner_enable_cache(this.ptr, enable)
  }

  /**
   * Scan ImageData for Aztec codes
   */
  async scanImageData(
    imageData: ImageData,
    options: AztecScanOptions = {}
  ): Promise<AztecScanResult[]> {
    const { enableCache = true, maxSymbols = 1, timeoutMs = 5000 } = options
    
    this.enableCache(enableCache)
    
    // Create ZBar image from ImageData
    const image = await ZBarImage.createFromRGBABuffer(
      imageData.width,
      imageData.height,
      imageData.data.buffer
    )

    try {
      // Scan with timeout
      const scanPromise = this.performScan(image)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Scan timeout')), timeoutMs)
      })

      await Promise.race([scanPromise, timeoutPromise])
      
      // Get results
      const symbols = image.getSymbols()
      const results: AztecScanResult[] = []

      for (let i = 0; i < Math.min(symbols.length, maxSymbols); i++) {
        const symbol = symbols[i]
        if (symbol.getType() === ZBarSymbolType.ZBAR_AZTEC) {
          results.push({
            data: symbol.getData(),
            type: 'AZTEC',
            rawData: symbol.getDataBytes(),
            quality: symbol.getQuality(),
            location: symbol.getLocation()
          })
        }
      }

      return results
    } finally {
      image.destroy()
    }
  }

  /**
   * Internal scan method
   */
  private async performScan(image: ZBarImage): Promise<number> {
    this.checkAlive()
    return this.inst._ImageScanner_scan(this.ptr, image.getPointer())
  }
} 