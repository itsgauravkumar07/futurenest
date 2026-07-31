"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  images: { url: string }[];
  title: string;
}

export default function PropertyGallery({ images, title }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-lg bg-ink-50 text-slate-light">
        No image available
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-ink-50">
        <Image src={images[activeIndex].url} alt={title} fill className="object-cover" priority />
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`relative aspect-square overflow-hidden rounded-md ring-2 transition-colors ${
                i === activeIndex ? "ring-accent" : "ring-transparent hover:ring-line"
              }`}
              aria-label={`View photo ${i + 1}`}
            >
              <Image src={img.url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
