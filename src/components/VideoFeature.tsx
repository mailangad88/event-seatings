import { site } from "@/lib/site";

// Use this for every Remotion or Blender video on the site. It adds what Google and AI search need to
// understand a video: a poster image, captions, a visible description and VideoObject structured data.
export type Video = {
  src: string; // e.g. /videos/chair-showcase.mp4 (put files in public/videos)
  poster: string; // still image shown before play, e.g. /videos/chair-showcase.jpg
  title: string;
  description: string; // one or two sentences; doubles as the video's alt text
  captions?: string; // WebVTT file, e.g. /videos/chair-showcase.vtt
  uploadDate: string; // YYYY-MM-DD
  durationSeconds?: number;
};

export function VideoFeature({ video, className = "" }: { video: Video; className?: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description,
    thumbnailUrl: `${site.url}${video.poster}`,
    contentUrl: `${site.url}${video.src}`,
    uploadDate: video.uploadDate,
    ...(video.durationSeconds && { duration: `PT${Math.round(video.durationSeconds)}S` }),
    publisher: { "@id": `${site.url}/#business` },
  };
  return (
    <figure className={className}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <video
        src={video.src}
        poster={video.poster}
        controls
        muted
        playsInline
        preload="metadata"
        aria-label={`${video.title}: ${video.description}`}
        className="w-full"
      >
        {video.captions && <track kind="captions" src={video.captions} srcLang="en" label="English" default />}
        {video.description}
      </video>
      <figcaption className="mt-3 text-sm text-muted">
        <span className="font-heading font-semibold text-base text-ink">{video.title}.</span> {video.description}
      </figcaption>
    </figure>
  );
}
