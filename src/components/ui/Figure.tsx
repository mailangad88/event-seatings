import Image from "next/image";

// Image with a visible caption. Alt describes the image; caption adds context for readers and AI.
export function Figure({
  src,
  alt,
  caption,
  width,
  height,
  ratio,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  className = "",
  imgClassName = "",
}: {
  src: string;
  alt: string;
  caption?: React.ReactNode;
  width?: number;
  height?: number;
  /** CSS aspect-ratio, e.g. "4/5". When set the image fills and crops to it. */
  ratio?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <figure className={className}>
      {ratio ? (
        <div className="media" style={{ aspectRatio: ratio }}>
          <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className={`object-cover ${imgClassName}`} />
        </div>
      ) : (
        <div className="media">
          <Image src={src} alt={alt} width={width ?? 1200} height={height ?? 900} priority={priority} sizes={sizes} className={`h-auto w-full ${imgClassName}`} />
        </div>
      )}
      {caption && <figcaption className="mt-3 text-sm leading-6 text-muted">{caption}</figcaption>}
    </figure>
  );
}
