"""Render Merchant Center swipe videos using the storefront's before/after art.

Requires Pillow and FFmpeg. Run from the project root:
    python scripts/generate-merchant-videos.py
"""
from concurrent.futures import ThreadPoolExecutor
from math import cos, pi
from pathlib import Path
from subprocess import Popen

from PIL import Image, ImageDraw, ImageOps

SIZE = 1080
FPS = 24
SECONDS = 8
SWIPES = 3
ART = Path("public/art")
DESTINATION = Path("public/merchant-videos")


def square_image(path: Path) -> Image.Image:
    with Image.open(path) as source:
        return ImageOps.fit(
            ImageOps.exif_transpose(source).convert("RGB"),
            (SIZE, SIZE),
            method=Image.Resampling.LANCZOS,
        )


def render(before_path: Path) -> None:
    slug = before_path.name.removesuffix("-before.jpg")
    before = square_image(before_path)
    after = square_image(ART / f"{slug}-after.jpg")
    target = DESTINATION / f"{slug}.mp4"
    temporary = target.with_suffix(".tmp.mp4")
    command = [
        "ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{SIZE}x{SIZE}",
        "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p",
        "-preset", "fast", "-crf", "22", "-threads", "2", "-movflags", "+faststart",
        str(temporary),
    ]
    try:
        with Popen(command, stdin=-1) as encoder:
            assert encoder.stdin is not None
            with encoder.stdin as stream:
                for frame_number in range(FPS * SECONDS):
                    phase = frame_number / (FPS * SECONDS) * SWIPES
                    split = round(SIZE * (1 - cos(2 * pi * phase)) / 2)
                    frame = after.copy()
                    if split > 0:
                        frame.paste(before.crop((0, 0, split, SIZE)))
                    if 0 < split < SIZE:
                        draw = ImageDraw.Draw(frame)
                        draw.line((split, 0, split, SIZE), fill="white", width=4)
                        draw.ellipse(
                            (split - 19, SIZE // 2 - 19, split + 19, SIZE // 2 + 19),
                            fill="#ff3860", outline="white", width=3,
                        )
                    stream.write(frame.tobytes())
            if encoder.wait():
                raise RuntimeError(f"FFmpeg failed for {slug}")
        temporary.replace(target)
    finally:
        temporary.unlink(missing_ok=True)
    print(target, flush=True)


if __name__ == "__main__":
    DESTINATION.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=2) as pool:
        list(pool.map(render, sorted(ART.glob("*-before.jpg"))))
