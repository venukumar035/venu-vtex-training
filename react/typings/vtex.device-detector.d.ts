declare module 'vtex.device-detector' {
  export interface DeviceContext {
    isMobile: boolean
    device: 'phone' | 'tablet' | 'desktop'
  }

  export function useDevice(): DeviceContext
}