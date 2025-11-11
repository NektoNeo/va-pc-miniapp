"use client";

import { useState } from "react";
import { Blurhash } from "react-blurhash";
import Image from "next/image";

interface ImagePreviewProps {
  src: string;
  alt: string;
  blurhash?: string;
  width: number;
  height: number;
  className?: string;
}

/**
 * ImagePreview - Progressive image loading с blurhash placeholder
 * Сначала показывает blurhash, затем настоящее изображение
 */
export function ImagePreview({
  src,
  alt,
  blurhash,
  width,
  height,
  className = "",
}: ImagePreviewProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blurhash placeholder */}
      {blurhash && !isLoaded && (
        <Blurhash
          hash={blurhash}
          width="100%"
          height="100%"
          resolutionX={32}
          resolutionY={32}
          punch={1}
          className="absolute inset-0"
        />
      )}

      {/* Actual image */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}
