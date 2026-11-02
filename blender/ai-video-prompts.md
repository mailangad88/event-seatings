# AI video prompts for the Blender reference frames

The Blender renders give us exact chairs and exact framing. The AI model's job is only to add life: candle flicker, drifting light, a soft breeze in the florals, a smooth camera glide. Keeping the chair geometry locked is what keeps it looking like *our* chair.

## Which model (October 2026 prices)

| Model | Cost per 8 s clip (about) | Start + end frame | Notes |
| --- | --- | --- | --- |
| **Seedance 2.0 Fast**, 720p (recommended) | $1.07 Dreamina, $1.94 fal.ai, $2.10 Higgsfield | Yes | Top-five quality on public leaderboards, good with products |
| Seedance 2.0 standard, 1080p | $3.12 Dreamina, $4.70 Higgsfield | Yes | Use only for the hero reel of each theme |
| Kling 3.0 Standard | ~$0.67 silent (720p) | Yes | Cheapest with both frames; check that the spindles don't warp |
| Veo 3.1 Lite | ~$0.40 | Yes | Fine for drafts and testing prompts |

Sources: [OpenRouter comparison](https://openrouter.ai/blog/insights/image-to-video-models-compared/), [Teamday price per second](https://www.teamday.ai/blog/best-ai-video-models-2026), [Seedance cost by platform](https://higgsfield.ai/blog/seedance-2-0-pricing-2026). Prices change often, so check before buying credits.

**First test (about $5):** run `gilded-ivory-hero-start.jpg` → `gilded-ivory-hero-end.jpg` with the hero prompt below through Seedance 2.0 Fast, Kling 3.0 Std and Veo 3.1 Lite. Keep the one whose chair stays crisp.

## Settings for every clip

- Aspect ratio **9:16**, duration **5 to 8 s**, 720p to test, 1080p for the final version
- **Start frame** = `<theme>-<shot>-start.jpg`, **end frame** = `<theme>-<shot>-end.jpg` (both in `public/social/stills/`)
- Audio off (we add music in Instagram/CapCut so it's licensed)
- Camera motion: describe it in the prompt and keep it slow. Fast moves are where models warp thin metal frames.

## Shared prompt endings

Add to the end of every prompt:

> Photorealistic luxury event photography, shallow depth of field, warm candlelight, cinematic slow motion, steady gimbal camera. The gold Chiavari chairs stay perfectly rigid and unchanged: same bamboo-style frame, same three back rails and spindles, same cushion. No people, no text, no logos.

Negative prompt, where the model has one (Kling, Wan):

> warped chair, bent legs, melting metal, extra legs, extra spindles, flicker, morphing furniture, people, hands, text, watermark, low quality, blurry chairs

## Prompts by theme and shot

### Gilded Ivory Ballroom (`gilded-ivory`)
- **hero:** Slow cinematic arc around a gold Chiavari chair with an ivory cushion at an elegant ivory banquet table. Candle flames flicker gently, fairy lights twinkle softly behind the ivory drapes, a faint warm glow moves across the gold frame as the camera turns.
- **dolly:** Smooth glide down the aisle of a long ivory-linen banquet table lined with gold Chiavari chairs. Taper candles flicker, white and blush roses, a wall of fairy lights shimmering in soft bokeh.
- **reveal:** The camera rises slowly from the gold chair legs on a polished marble floor to reveal a full ivory tablescape with gold chargers, crystal glasses, roses and candlelight.

### Midnight Gold Gala (`midnight-gold`)
- **hero:** Slow arc around a gleaming gold Chiavari chair with a black cushion beside a black-linen gala table. Deep burgundy roses, candlelight glinting on the gold, a curtain of warm fairy lights sparkling in the dark.
- **dolly:** Moody glide along a black-tie banquet table, a row of gold Chiavari chairs catching candlelight, reflections on a black lacquer floor, burgundy roses, glowing bokeh.
- **reveal:** Rise from gold chair legs reflected in a dark glossy floor up to a dramatic black and gold tablescape with burgundy florals and taper candles.

### Blush Garden Romance (`blush-garden`)
- **hero:** Soft arc around a rose-gold Chiavari chair at a blush-linen table. Petals stir in a light breeze, candles flicker, warm sunset-toned fairy lights glow behind sheer blush drapes.
- **dolly:** Dreamy glide down a blush garden reception table with rose-gold Chiavari chairs, pink and cream garden roses, greenery and candlelight.
- **reveal:** Rise from rose-gold chair legs to a romantic blush tablescape full of garden roses, greenery, crystal and candlelight.

## Turning clips into posts

Put the AI clip (or the plain Blender clip) into the Remotion project for brand captions, or use the in-app editor. Suggested overlays:

1. Hook (0 to 1.5 s): "POV: your Chicago reception, but make it gold ✨", "This is what 120 gold Chiavari chairs look like", or "Rate this tablescape 1 to 10".
2. Value (middle): "Gold Chiavari · ivory cushion · set up and picked up for you".
3. CTA (last 2 s): "Free 15-min seating plan → link in bio" (link to the booking page once it exists).
