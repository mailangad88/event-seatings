// The lead image of each chair page, as a small map. chairs.ts is used in the browser (quote form, quiz), and
// looking these up in rental-images.ts there pulled the whole 2.5 MB image list into those pages' JavaScript.
// tests/chair-images.test.ts checks this matches rental-images.ts and prints the new map when it doesn't.
export const chairImageSrc: Record<string, string> = {
  "cross-back": "/rentals/styled/crossback--photo.webp",
  "ghost": "/rentals/styled/ghost--photo.webp",
  "rattan-garden": "/rentals/styled/rattan-garden--photo.webp",
  "bentwood": "/rentals/styled/bentwood--photo.webp",
  "wishbone": "/rentals/styled/wishbone--photo.webp",
  "velvet-dining": "/rentals/styled/velvet-dining--photo.webp",
  "infinity": "/rentals/styled/infinity--photo.webp",
  "cane-back": "/rentals/styled/cane-back--photo.webp",
  "windsor": "/rentals/styled/windsor--photo.webp",
  "louis-medallion": "/rentals/styled/louis-medallion--photo.webp",
  "shell": "/rentals/styled/shell--photo.webp",
  "garden-folding": "/rentals/styled/garden-folding--photo.webp",
  "royal-throne": "/rentals/styled/throne-chair--photo.webp",
};
