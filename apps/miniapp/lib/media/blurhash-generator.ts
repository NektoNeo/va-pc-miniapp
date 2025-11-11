import { encode } from "blurhash";

/**
 * BlurhashGenerator - wrapper для blurhash encode
 * Генерирует компактный hash string для progressive image loading
 */
export class BlurhashGenerator {
  /**
   * Encode raw pixels to blurhash string
   * @param pixels - RGBA pixel data (Uint8ClampedArray)
   * @param width - Image width
   * @param height - Image height
   * @param componentX - Number of components in X direction (default: 4)
   * @param componentY - Number of components in Y direction (default: 3)
   * @returns Blurhash string (e.g., "LEHV6nWB2yk8pyo0adR*.7kCMdnj")
   */
  encode(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    componentX = 4,
    componentY = 3
  ): string {
    return encode(pixels, width, height, componentX, componentY);
  }

  /**
   * Quick encode для small thumbnail (оптимизировано)
   * Использует меньше компонентов для быстрого generation
   */
  encodeQuick(pixels: Uint8ClampedArray, width: number, height: number): string {
    return this.encode(pixels, width, height, 3, 2);
  }
}
