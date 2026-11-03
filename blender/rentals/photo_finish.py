"""Camera finish for rendered images: the small optical and sensor flaws every real photo has.

A path-traced render is too clean: no sensor noise, no lens falloff, perfect colour registration. This adds:

* Film/sensor grain, using the algorithm from filmgrainer by Lars Ole Pontoppidan
  (https://github.com/larspontoppidan/filmgrainer, MIT License), vectorised with numpy. Grain is
  strongest in the mid-tones and fades in shadows and highlights, as on real film and sensors.
* Lens vignetting (corners about a third of a stop darker).
* Lateral chromatic aberration (red and blue channels a fraction of a pixel out of register at the edges).
* A faint highlight bloom, like light scattering in lens glass.

    from photo_finish import finish
    img = finish(Image.open("in.png"))

The parameters are deliberately gentle: at web size you shouldn't notice any one of them, only that the
picture looks photographed.
"""

import numpy as np
from PIL import Image, ImageFilter

# --- filmgrainer (MIT) ------------------------------------------------------------------------------
# Copyright (c) 2022 Lars Ole Pontoppidan. Permission is hereby granted, free of charge, to any person
# obtaining a copy of this software... (full MIT text: https://github.com/larspontoppidan/filmgrainer/blob/main/LICENSE)

_SHADOW_END = 160
_HIGHLIGHT_START = 200


def _grain_map(src_gamma, noise_power, shadow_level, high_level):
    """256x256 lookup: (picture value, noise value) -> output value. Port of graingamma.Map.calculate."""
    crop_top = noise_power * high_level / 12
    crop_low = noise_power * shadow_level / 20
    pic_scale = 1 - (crop_top + crop_low)
    pic_offs = 255 * crop_low
    src = np.arange(256, dtype=np.float64)
    pic = np.power(src / 255.0, 1.0 / src_gamma) * 255.0
    gamma = pic * (1.5 / 256) + 0.5
    gamma_offset = np.power(128 / 255.0, 1.0 / gamma)
    power = np.where(
        pic < _SHADOW_END,
        0.5 - (_SHADOW_END - pic) * (0.5 - shadow_level) / _SHADOW_END,
        np.where(pic < _HIGHLIGHT_START, 0.5,
                 0.5 - (pic - _HIGHLIGHT_START) * (0.5 - high_level) / (255 - _HIGHLIGHT_START)),
    )
    noise = np.arange(256, dtype=np.float64)
    gc = np.power(noise[None, :] / 255.0, 1.0 / gamma[:, None]) - gamma_offset[:, None]
    value = pic[:, None] * pic_scale + pic_offs + 255.0 * power[:, None] * noise_power * gc
    return np.clip(value, 0, 255).astype(np.uint8)


def _grain_mask(w, h, grain_size, power, saturation, seed):
    """RGB noise centred on 128. Port of graingen.grainGen."""
    rng = np.random.default_rng(seed)
    nw, nh = int(w / grain_size), int(h / grain_size)
    intens = rng.normal(128, power * (1.0 - saturation), (nh, nw, 1))
    buf = rng.normal(0, power, (nh, nw, 3)) * saturation + intens
    img = Image.fromarray(np.clip(buf, 0, 255).astype(np.uint8))
    if grain_size != 1.0:
        img = img.resize((w, h), resample=Image.LANCZOS)
    return np.asarray(img)


def film_grain(img, power=0.22, highs=0.08, shadows=0.12, grain_type=2, saturation=0.3, seed=7):
    sizes = {1: (0.8, 63), 2: (1.0, 45), 3: (1.5, 50), 4: (1.6666, 50)}
    grain_size, grain_gauss = sizes[grain_type]
    a = np.asarray(img.convert("RGB"))
    lut = _grain_map(1.0, power, shadows, highs)
    mask = _grain_mask(a.shape[1], a.shape[0], grain_size, grain_gauss, saturation, seed)
    return Image.fromarray(lut[a, mask])


# --- lens ---------------------------------------------------------------------------------------------


def _radius(w, h):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    cx, cy = (w - 1) / 2, (h - 1) / 2
    return np.sqrt(((x - cx) / cx) ** 2 + ((y - cy) / cy) ** 2) / np.sqrt(2)


def vignette(img, strength=0.22):
    a = np.asarray(img).astype(np.float32) / 255.0
    lin = a ** 2.2
    r = _radius(*img.size)
    lin *= (1.0 - strength * r ** 2.4)[..., None]
    return Image.fromarray((np.clip(lin, 0, 1) ** (1 / 2.2) * 255 + 0.5).astype(np.uint8))


def chromatic_aberration(img, pixels_at_corner=0.8):
    w, h = img.size
    k = pixels_at_corner / (0.5 * (w * w + h * h) ** 0.5)
    r, g, b = img.split()

    def scale(ch, s):
        # affine about the centre: out(x) = in(c + (x - c) / s)
        cx, cy = w / 2, h / 2
        return ch.transform((w, h), Image.AFFINE, (1 / s, 0, cx - cx / s, 0, 1 / s, cy - cy / s), resample=Image.BICUBIC)

    return Image.merge("RGB", (scale(r, 1 + k), g, scale(b, 1 - k)))


def bloom(img, threshold=0.82, radius=None, amount=0.10):
    w, h = img.size
    a = np.asarray(img).astype(np.float32) / 255.0
    lum = a.mean(axis=2, keepdims=True)
    bright = np.clip((lum - threshold) / (1 - threshold), 0, 1) * a
    blur = Image.fromarray((bright * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius or max(w, h) / 90))
    out = 1 - (1 - a) * (1 - amount * np.asarray(blur).astype(np.float32) / 255.0)  # screen blend
    return Image.fromarray((np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8))


def finish(img, seed=7):
    img = img.convert("RGB")
    img = bloom(img)
    img = chromatic_aberration(img)
    img = vignette(img)
    img = film_grain(img, seed=seed)
    return img


if __name__ == "__main__":
    import sys

    src, dst = sys.argv[1], sys.argv[2]
    finish(Image.open(src)).save(dst)
