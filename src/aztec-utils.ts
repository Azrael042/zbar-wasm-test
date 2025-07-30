import { AztecDecoder, AztecScanResult, AztecScanOptions } from './AztecDecoder'

/**
 * Utility functions for common Aztec barcode scanning scenarios
 */

/**
 * Scan ImageData for Aztec codes
 */
export async function scanImageData(
  imageData: ImageData, 
  options?: AztecScanOptions
): Promise<AztecScanResult[]> {
  return AztecDecoder.scanImageData(imageData, options)
}

/**
 * Scan a canvas element for Aztec codes
 */
export async function scanCanvas(
  canvas: HTMLCanvasElement,
  options?: AztecScanOptions
): Promise<AztecScanResult[]> {
  return AztecDecoder.scanCanvas(canvas, options)
}

/**
 * Scan a video frame for Aztec codes
 */
export async function scanVideoFrame(
  video: HTMLVideoElement,
  options?: AztecScanOptions
): Promise<AztecScanResult[]> {
  return AztecDecoder.scanVideoFrame(video, options)
}

/**
 * Scan an image file for Aztec codes
 */
export async function scanFile(
  file: File,
  options?: AztecScanOptions
): Promise<AztecScanResult[]> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    img.onload = async () => {
      try {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        
        const results = await scanCanvas(canvas, options)
        resolve(results)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image file'))
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Scan an image from a URL for Aztec codes
 */
export async function scanImageUrl(
  url: string,
  options?: AztecScanOptions
): Promise<AztecScanResult[]> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    img.onload = async () => {
      try {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        
        const results = await scanCanvas(canvas, options)
        resolve(results)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image from URL'))
    }

    // Handle CORS issues
    img.crossOrigin = 'anonymous'
    img.src = url
  })
}

/**
 * Create a continuous scanner for video streams
 */
export class AztecVideoScanner {
  private video: HTMLVideoElement
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private isScanning = false
  private animationFrame?: number
  private onResult?: (results: AztecScanResult[]) => void
  private onError?: (error: Error) => void

  constructor(video: HTMLVideoElement) {
    this.video = video
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!
  }

  /**
   * Start continuous scanning
   */
  start(
    onResult: (results: AztecScanResult[]) => void,
    onError?: (error: Error) => void,
    options?: AztecScanOptions
  ): void {
    this.onResult = onResult
    this.onError = onError
    this.isScanning = true

    const scan = async () => {
      if (!this.isScanning) return

      try {
        if (this.video.readyState >= 2) { // HAVE_CURRENT_DATA
          this.canvas.width = this.video.videoWidth
          this.canvas.height = this.video.videoHeight
          this.ctx.drawImage(this.video, 0, 0)

          const results = await scanCanvas(this.canvas, options)
          if (results.length > 0 && this.onResult) {
            this.onResult(results)
          }
        }
      } catch (error) {
        if (this.onError) {
          this.onError(error as Error)
        }
      }

      if (this.isScanning) {
        this.animationFrame = requestAnimationFrame(scan)
      }
    }

    scan()
  }

  /**
   * Stop continuous scanning
   */
  stop(): void {
    this.isScanning = false
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = undefined
    }
  }

  /**
   * Check if currently scanning
   */
  get scanning(): boolean {
    return this.isScanning
  }
}

/**
 * Get user camera stream and start scanning
 */
export async function startCameraScanning(
  onResult: (results: AztecScanResult[]) => void,
  onError?: (error: Error) => void,
  options?: AztecScanOptions & {
    /** Preferred camera facing mode */
    facingMode?: 'user' | 'environment'
    /** Video constraints */
    video?: MediaTrackConstraints
  }
): Promise<{
  scanner: AztecVideoScanner,
  video: HTMLVideoElement,
  stop: () => void
}> {
  const { facingMode = 'environment', video: videoConstraints, ...scanOptions } = options || {}

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode,
        ...videoConstraints
      }
    })

    const video = document.createElement('video')
    video.srcObject = stream
    video.autoplay = true
    video.playsInline = true

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve()
      video.onerror = reject
    })

    const scanner = new AztecVideoScanner(video)
    scanner.start(onResult, onError, scanOptions)

    const stop = () => {
      scanner.stop()
      stream.getTracks().forEach(track => track.stop())
    }

    return { scanner, video, stop }
  } catch (error) {
    throw new Error(`Failed to start camera: ${error}`)
  }
} 