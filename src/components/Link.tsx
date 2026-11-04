"use client";

import NextLink from "next/link";
import { useState, type ComponentProps } from "react";

/**
 * next/link that prefetches when the visitor shows they might click (pointer over it, finger down, or keyboard
 * focus) instead of as soon as it scrolls into view. Guide and area pages carry hundreds of links, and viewport
 * prefetching downloaded up to 5 MB of pages nobody opened (and woke a server for each). Pass `prefetch`
 * explicitly to get Next's normal behaviour for one link.
 *
 * Use this everywhere instead of importing next/link directly.
 */
export default function Link({ prefetch, onMouseEnter, onTouchStart, onFocus, ...props }: ComponentProps<typeof NextLink>) {
  const [intent, setIntent] = useState(false);
  if (prefetch !== undefined) return <NextLink prefetch={prefetch} onMouseEnter={onMouseEnter} onTouchStart={onTouchStart} onFocus={onFocus} {...props} />;
  return (
    <NextLink
      {...props}
      prefetch={intent ? null : false}
      onMouseEnter={(e) => {
        setIntent(true);
        onMouseEnter?.(e);
      }}
      onTouchStart={(e) => {
        setIntent(true);
        onTouchStart?.(e);
      }}
      onFocus={(e) => {
        setIntent(true);
        onFocus?.(e);
      }}
    />
  );
}
