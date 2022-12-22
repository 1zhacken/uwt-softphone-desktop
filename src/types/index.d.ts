import type { ContextBridgeApi } from '../electron/preload.js'

declare global {
  interface Window {
    bridge: ContextBridgeApi
  }
}