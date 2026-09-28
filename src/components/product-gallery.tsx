"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";

interface ProductGalleryProps {
  images?: string[];
  productName?: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images = [],
  productName = "ILAI Sanitary Pad",
}) => {
  // Ensure valid images array (support 1 to 8 images, fallback if empty)
  const validImages = images && images.length > 0
    ? images.slice(0, 8)
    : ["/images/product/ilai-pad-1.jpg"];

  const totalImages = validImages.length;
  const hasMultiple = totalImages > 1;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Fallback image error trackers
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  const getImageSrc = (index: number) => {
    if (imageErrors[index]) {
      return "/images/product.jpg";
    }
    return validImages[index] || "/images/product/ilai-pad-1.jpg";
  };

  // Navigation handlers
  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  }, [totalImages]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  }, [totalImages]);

  const handleLightboxPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  }, [totalImages]);

  const handleLightboxNext = useCallback(() => {
    setLightboxIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  }, [totalImages]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft" && hasMultiple) {
        handleLightboxPrev();
      } else if (e.key === "ArrowRight" && hasMultiple) {
        handleLightboxNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Prevent background scrolling while lightbox is active
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isLightboxOpen, hasMultiple, handleLightboxPrev, handleLightboxNext]);

  // Touch swipe support for mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const deltaX = touchStartX.current - touchEndX.current;
    const swipeThreshold = 45; // Minimum px distance to register swipe

    if (deltaX > swipeThreshold) {
      // Swiped left -> show next
      handleNext();
    } else if (deltaX < -swipeThreshold) {
      // Swiped right -> show prev
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Lightbox touch swipe support
  const lightboxTouchStartX = useRef<number | null>(null);
  const lightboxTouchEndX = useRef<number | null>(null);

  const handleLightboxTouchStart = (e: React.TouchEvent) => {
    lightboxTouchStartX.current = e.targetTouches[0].clientX;
    lightboxTouchEndX.current = null;
  };

  const handleLightboxTouchMove = (e: React.TouchEvent) => {
    lightboxTouchEndX.current = e.targetTouches[0].clientX;
  };

  const handleLightboxTouchEnd = () => {
    if (!lightboxTouchStartX.current || !lightboxTouchEndX.current) return;
    const deltaX = lightboxTouchStartX.current - lightboxTouchEndX.current;
    const swipeThreshold = 45;

    if (deltaX > swipeThreshold) {
      handleLightboxNext();
    } else if (deltaX < -swipeThreshold) {
      handleLightboxPrev();
    }

    lightboxTouchStartX.current = null;
    lightboxTouchEndX.current = null;
  };

  return (
    <div className="w-full">
      {/* Gallery Container: Side thumbnails on desktop (lg:flex-row), column layout on tablet/mobile */}
      <div className="flex flex-col-reverse lg:flex-row gap-4 items-start">
        {/* Desktop Side Thumbnails (vertical column) */}
        {hasMultiple && (
          <div className="hidden lg:flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-1 no-scrollbar shrink-0">
            {validImages.map((imgSrc, idx) => {
              const isSelected = activeIndex === idx;
              return (
                <button
                  key={`desktop-thumb-${idx}`}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 bg-white p-1 focus:outline-none ${
                    isSelected
                      ? "border-[#506638] ring-2 ring-[#EDE8D8] shadow-sm scale-[1.02]"
                      : "border-[#E2DCCB] opacity-75 hover:opacity-100 hover:border-[#506638]/50"
                  }`}
                  aria-label={`View photo ${idx + 1} of ${totalImages}`}
                >
                  <div className="relative w-full h-full rounded-lg overflow-hidden bg-[#F6F2E6]">
                    <Image
                      src={getImageSrc(idx)}
                      alt={`${productName} thumbnail ${idx + 1}`}
                      fill
                      sizes="80px"
                      loading="lazy"
                      onError={() => handleImageError(idx)}
                      className="object-cover"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Main Image Viewport */}
        <div className="relative w-full flex-1">
          <div
            className="relative aspect-square w-full rounded-2xl bg-white border border-[#E2DCCB] shadow-sm overflow-hidden flex items-center justify-center group cursor-zoom-in select-none"
            onClick={() => openLightbox(activeIndex)}
            onTouchStart={hasMultiple ? handleTouchStart : undefined}
            onTouchMove={hasMultiple ? handleTouchMove : undefined}
            onTouchEnd={hasMultiple ? handleTouchEnd : undefined}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                openLightbox(activeIndex);
              }
            }}
            aria-label={`Click to enlarge ${productName} image ${activeIndex + 1}`}
          >
            {/* Active Main Image with Next.js optimization */}
            <Image
              src={getImageSrc(activeIndex)}
              alt={`${productName} - View ${activeIndex + 1}`}
              fill
              priority={activeIndex === 0}
              loading={activeIndex === 0 ? undefined : "lazy"}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 540px"
              onError={() => handleImageError(activeIndex)}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />

            {/* Click to zoom overlay pill */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#263618]/80 text-white text-xs font-medium backdrop-blur-sm shadow-sm">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Click to expand</span>
            </div>

            {/* Desktop Navigation Arrows (hidden on mobile, hidden if only 1 image) */}
            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#263618] border border-[#E2DCCB] shadow-md items-center justify-center opacity-80 hover:opacity-100 transition-all hover:scale-110 active:scale-95 z-10"
                  aria-label="Previous product image"
                >
                  <ChevronLeft className="w-5 h-5 text-[#263618]" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#263618] border border-[#E2DCCB] shadow-md items-center justify-center opacity-80 hover:opacity-100 transition-all hover:scale-110 active:scale-95 z-10"
                  aria-label="Next product image"
                >
                  <ChevronRight className="w-5 h-5 text-[#263618]" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Dots Indicator (underneath main image on mobile, only if multiple images) */}
          {hasMultiple && (
            <div className="flex md:hidden items-center justify-center gap-1.5 mt-3">
              {validImages.map((_, idx) => (
                <button
                  key={`dot-${idx}`}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Jump to photo ${idx + 1}`}
                  className={`h-2 transition-all duration-300 rounded-full ${
                    activeIndex === idx
                      ? "w-6 bg-[#506638]"
                      : "w-2 bg-[#D8D2BF] hover:bg-[#B5AB94]"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Mobile & Tablet Row of Thumbnails (below main image, hidden on desktop lg:hidden) */}
          {hasMultiple && (
            <div className="flex lg:hidden items-center gap-2.5 overflow-x-auto pt-3 pb-1 no-scrollbar">
              {validImages.map((imgSrc, idx) => {
                const isSelected = activeIndex === idx;
                return (
                  <button
                    key={`mobile-thumb-${idx}`}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 bg-white p-1 focus:outline-none ${
                      isSelected
                        ? "border-[#506638] ring-2 ring-[#EDE8D8] shadow-sm"
                        : "border-[#E2DCCB] opacity-75 hover:opacity-100"
                    }`}
                    aria-label={`Thumbnail ${idx + 1}`}
                  >
                    <div className="relative w-full h-full rounded-lg overflow-hidden bg-[#F6F2E6]">
                      <Image
                        src={getImageSrc(idx)}
                        alt={`${productName} thumbnail ${idx + 1}`}
                        fill
                        sizes="80px"
                        loading="lazy"
                        onError={() => handleImageError(idx)}
                        className="object-cover"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Full-Screen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Full-screen image gallery lightbox"
        >
          {/* Top Bar: Counter & Close Button */}
          <div
            className="w-full max-w-5xl flex items-center justify-between z-20 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-white/15 text-white/90 text-xs sm:text-sm font-medium tracking-wide border border-white/10 backdrop-blur-sm">
                {lightboxIndex + 1} / {totalImages}
              </span>
              <span className="hidden sm:inline-block text-xs text-white/60">
                {productName}
              </span>
            </div>

            <button
              type="button"
              onClick={closeLightbox}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none border border-white/10"
              aria-label="Close full-screen image view"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Central Image Viewport with Previous & Next navigation */}
          <div
            className="relative w-full max-w-4xl flex-1 flex items-center justify-center my-3 select-none"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={hasMultiple ? handleLightboxTouchStart : undefined}
            onTouchMove={hasMultiple ? handleLightboxTouchMove : undefined}
            onTouchEnd={hasMultiple ? handleLightboxTouchEnd : undefined}
          >
            {/* Desktop Previous Button */}
            {hasMultiple && (
              <button
                type="button"
                onClick={handleLightboxPrev}
                className="hidden sm:flex absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white border border-white/20 shadow-lg items-center justify-center transition-all hover:scale-110 active:scale-95 z-20 focus:outline-none"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Lightbox Main Image */}
            <div className="relative w-full h-[65vh] sm:h-[72vh] max-h-[800px] flex items-center justify-center">
              <Image
                src={getImageSrc(lightboxIndex)}
                alt={`${productName} full view ${lightboxIndex + 1}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1000px"
                onError={() => handleImageError(lightboxIndex)}
                className="object-contain drop-shadow-2xl"
              />
            </div>

            {/* Desktop Next Button */}
            {hasMultiple && (
              <button
                type="button"
                onClick={handleLightboxNext}
                className="hidden sm:flex absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white border border-white/20 shadow-lg items-center justify-center transition-all hover:scale-110 active:scale-95 z-20 focus:outline-none"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip for Lightbox (if multiple images) */}
          {hasMultiple && (
            <div
              className="w-full max-w-2xl flex items-center justify-center gap-2 overflow-x-auto py-2 z-20 no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {validImages.map((imgSrc, idx) => {
                const isSelected = lightboxIndex === idx;
                return (
                  <button
                    key={`lb-thumb-${idx}`}
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 bg-white/10 ${
                      isSelected
                        ? "border-[#EDE8D8] ring-2 ring-[#506638] scale-105"
                        : "border-white/20 opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`Switch to image ${idx + 1}`}
                  >
                    <Image
                      src={getImageSrc(idx)}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      sizes="60px"
                      loading="lazy"
                      onError={() => handleImageError(idx)}
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
