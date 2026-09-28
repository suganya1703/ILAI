"use client";

import React, { useState } from "react";
import Image from "next/image";
import { productContent } from "@/config/content";

interface ProductImageProps {
  className?: string;
  alt?: string;
  images?: string[];
}

export const ProductImagePlaceholder: React.FC<ProductImageProps> = ({
  className = "w-full h-auto aspect-square",
  alt = productContent.name,
  images = productContent.images,
}) => {
  const [firstError, setFirstError] = useState(false);
  const [secondError, setSecondError] = useState(false);

  const firstImage = firstError
    ? "/images/product.jpg"
    : images && images.length > 0
    ? images[0]
    : "/images/product/ilai-pad-1.jpg";

  const secondImage = secondError
    ? null
    : images && images.length > 1
    ? images[1]
    : null;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white border border-[#E2DCCB] shadow-md group flex items-center justify-center ${className}`}
    >
      {/* Primary Image */}
      <Image
        src={firstImage}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        loading="lazy"
        onError={() => setFirstError(true)}
        className={`object-cover rounded-2xl transition-all duration-500 ease-in-out ${
          secondImage ? "group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-105"
        }`}
      />

      {/* Secondary Hover Image for Desktop (displays on hover if 2+ images exist) */}
      {secondImage && (
        <Image
          src={secondImage}
          alt={`${alt} Alternate View`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
          onError={() => setSecondError(true)}
          className="object-cover rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out group-hover:scale-105 pointer-events-none"
        />
      )}
    </div>
  );
};
