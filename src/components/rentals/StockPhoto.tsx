import {
  stockAuthorUrl,
  stockPageUrl,
  stockSrc,
  stockSrcSet,
  type StockPhoto,
} from "@/data/stock-photos";

// Real event photos from Unsplash (see src/data/stock-photos.ts). Served straight from Unsplash's
// image CDN, which resizes and converts them, so they don't use Next's image optimizer.

/** Fills its (relatively positioned) parent, like next/image with `fill`. */
export function StockImg({
  photo,
  alt,
  width,
  height = width,
  priority = false,
  className = "",
}: {
  photo: StockPhoto;
  alt: string;
  /** Display size in CSS pixels; a 2x version is offered for sharp screens. */
  width: number;
  height?: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={stockSrc(photo, width, height)}
      srcSet={stockSrcSet(photo, width, height)}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
    />
  );
}

/** "Example photo" chip so nobody mistakes a representative photo for the exact rental. */
export function ExampleChip({ className = "" }: { className?: string }) {
  return (
    <span
      className={`pointer-events-none absolute bottom-2 left-2 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium tracking-[0.12em] text-white uppercase backdrop-blur-sm ${className}`}
    >
      Example photo
    </span>
  );
}

/** Unsplash's requested credit line, with links to the photo and the photographer. */
export function PhotoCredit({ photo, className = "" }: { photo: StockPhoto; className?: string }) {
  return (
    <span className={className}>
      Photo by{" "}
      <a href={stockAuthorUrl(photo)} className="underline decoration-line underline-offset-2 hover:text-ink" rel="noopener">
        {photo.by}
      </a>{" "}
      on{" "}
      <a href={stockPageUrl(photo)} className="underline decoration-line underline-offset-2 hover:text-ink" rel="noopener">
        Unsplash
      </a>
    </span>
  );
}
