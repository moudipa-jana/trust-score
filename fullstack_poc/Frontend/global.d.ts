declare module 'invariant' {
  export default function invariant(
    condition: any,
    message?: string,
    ...args: any[]
  ): void;
}
declare function ga(a: any, b: any, c: any, d: any, e?: any): void;
declare function gtag(a: any, b: any, c: any, d: any): void;

// Module declarations for file types
declare module '*.geojson' {
  const value: any;
  export default value;
}

declare module '*.json' {
  const value: any;
  export default value;
}

// Global declarations for CDN libraries
declare global {
  interface Window {
    Globe: any;
  }
}
