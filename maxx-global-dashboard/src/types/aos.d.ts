// src/types/aos.d.ts
declare module "aos" {
  interface AosOptions {
    offset?: number;
    delay?: number;
    duration?: number;
    easing?: string;
    once?: boolean;
    mirror?: boolean;
    anchorPlacement?:
      | "top-bottom"
      | "top-center"
      | "top-top"
      | "center-bottom"
      | "center-center"
      | "center-top"
      | "bottom-bottom"
      | "bottom-center"
      | "bottom-top";
  }

  export function init(options?: AosOptions): void;
  export function refresh(): void;
  export function refreshHard(): void;
}
