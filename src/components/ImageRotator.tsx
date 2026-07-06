"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface ImageRotatorProps {
  images: string[];
  interval?: number;
}

export default function ImageRotator({ images, interval = 4000 }: ImageRotatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images, interval]);

  if (!images || images.length === 0) return null;

  return (
    <>
      {images.map((src, idx) => (
        <Image
          key={src}
          src={src}
          alt={`Gallery image ${idx + 1}`}
          fill
          className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-[1500ms] ${
            idx === currentIndex ? "opacity-100" : "opacity-0"
          }`}
          priority={idx === 0}
        />
      ))}
    </>
  );
}
