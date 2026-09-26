import React from "react";
import Image from "next/image";

interface ProductImageProps {
  className?: string;
  alt?: string;
}

export const ProductImagePlaceholder: React.FC<ProductImageProps> = ({
  className = "w-full h-auto aspect-square",
  alt = "ILAI Biodegradable Sanitary Pad Box",
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-md group flex items-center justify-center ${className}`}
    >
      <img
        src="/images/product.jpg"
        alt={alt}
        className="w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
};
