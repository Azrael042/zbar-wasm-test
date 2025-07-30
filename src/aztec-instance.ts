import type ZBarInstance from './ZBarInstance'

// Dynamic import for the Aztec-specific WebAssembly module
let aztecModule: any

// For browser environments, we'll load the module dynamically
// The actual module will be loaded when setAztecModuleArgs is called

let aztecInstancePromise: Promise<ZBarInstance>

/**
 * Arguments for configuring the Aztec WebAssembly module
 */
export type AztecModuleArgs = {
  /** Function to locate the .wasm file (for non-inlined builds) */
  locateFile?: (filename: string, directory: string) => string,
  /** Custom WebAssembly module to use */
  wasmBinary?: ArrayBuffer,
  /** Print function for debugging */
  print?: (text: string) => void,
  /** Error print function */
  printErr?: (text: string) => void,
  /** WebAssembly module factory function */
  moduleFactory?: any,
}

/**
 * Configure the Aztec WebAssembly module with custom arguments
 * Must be called before getAztecInstance() to take effect
 */
export function setAztecModuleArgs(args: AztecModuleArgs = {}): void {
  // Allow passing the module factory directly
  if (args.moduleFactory) {
    aztecModule = args.moduleFactory
  }
  
  if (!aztecModule) {
    throw new Error('Aztec WebAssembly module not available. Please provide moduleFactory or build with: make -f Makefile.aztec')
  }

  aztecInstancePromise = (async function(): Promise<ZBarInstance> {
    // Default configuration optimized for Aztec scanning
    const defaultArgs: AztecModuleArgs = {
      locateFile: (filename: string, directory: string) => {
        // For inlined builds, this won't be called
        // For regular builds, look for aztec.wasm in the same directory
        if (filename.endsWith('.wasm')) {
          return directory + 'aztec.wasm'
        }
        return directory + filename
      },
      print: (text: string) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Aztec WASM]', text)
        }
      },
      printErr: (text: string) => {
        console.error('[Aztec WASM Error]', text)
      }
    }

    const mergedArgs = { ...defaultArgs, ...args }
    
    try {
      const aztecInstance = await aztecModule(mergedArgs)
      
      if (!aztecInstance) {
        throw new Error('Failed to initialize Aztec WebAssembly module')
      }

      // Verify the module has the expected functions
      const requiredFunctions = [
        '_ImageScanner_create',
        '_ImageScanner_destory',
        '_ImageScanner_scan',
        '_Image_create',
        '_Image_destory'
      ]

      for (const funcName of requiredFunctions) {
        if (typeof aztecInstance[funcName] !== 'function') {
          throw new Error(`Required function ${funcName} not found in Aztec WASM module`)
        }
      }

      console.log('✅ Aztec WebAssembly decoder loaded successfully')
      return aztecInstance

    } catch (error) {
      console.error('Failed to load Aztec WebAssembly module:', error)
      throw new Error(`Aztec WASM initialization failed: ${error}`)
    }
  })()
}

/**
 * Get the Aztec WebAssembly instance
 * Returns a promise that resolves to the initialized module
 */
export async function getAztecInstance(): Promise<ZBarInstance> {
  // Initialize with default args if not already set
  if (!aztecInstancePromise) {
    setAztecModuleArgs()
  }

  return await aztecInstancePromise
}

/**
 * Check if the Aztec WebAssembly module is available
 */
export function isAztecModuleAvailable(): boolean {
  return !!aztecModule
}

/**
 * Get information about the loaded Aztec module
 */
export async function getAztecModuleInfo(): Promise<{
  loaded: boolean,
  version?: string,
  memoryInitialSize?: number,
  memoryMaxSize?: number
}> {
  try {
    const instance = await getAztecInstance()
    return {
      loaded: true,
      version: '1.0.0-aztec',
      memoryInitialSize: instance.HEAP8?.length || 0,
      memoryMaxSize: instance.HEAP8?.length || 0
    }
  } catch {
    return {
      loaded: false
    }
  }
} 