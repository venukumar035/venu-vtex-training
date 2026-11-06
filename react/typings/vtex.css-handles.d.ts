declare module 'vtex.css-handles' {
  export function useCssHandles<T extends readonly string[]>(
    handles: T,
    options?: {
      classes?: Record<string, string>
      modifiers?: Record<string, string | boolean>
    }
  ): Record<T[number], string>
}