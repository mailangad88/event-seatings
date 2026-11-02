import Image from "next/image";

// Image with a visible caption. Alt describes the image; caption adds context for readers and AI.
// Pass children instead of src for inline visuals (e.g. an SVG diagram with its own <title>/<desc>).
export function Figure({
  children,
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
  children?: React.ReactNode;
  src?: string;
  alt?: string;
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
      {children ? (
        <div className="media p-4 sm:p-6 [&_svg]:mx-auto [&_svg]:block [&_svg]:h-auto [&_svg]:w-full">{children}</div>
      ) : !src ? null : ratio ? (
        <div className="media" style={{ aspectRatio: ratio }}>
          <Image src={src} alt={alt ?? ""} fill priority={priority} sizes={sizes} className={`object-cover ${imgClassName}`} />
        </div>
      ) : (
        <div className="media">
          <Image src={src} alt={alt ?? ""} width={width ?? 1200} height={height ?? 900} priority={priority} sizes={sizes} className={`h-auto w-full ${imgClassName}`} />
        </div>
      )}
      {caption && <figcaption className="mt-3 text-sm leading-6 text-muted">{caption}</figcaption>}
    </figure>
  );
}
