"""Draws the ShieldNest icon (teal tile + shield check) into assets/shieldnest.ico."""

from pathlib import Path

from PIL import Image, ImageDraw

TEAL = (61, 219, 184, 255)
DARK = (6, 48, 42, 255)
SIZE = 256


def draw() -> Image.Image:
    image = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(image)
    d.rounded_rectangle((8, 8, SIZE - 8, SIZE - 8), radius=56, fill=TEAL)

    # Same shield and check as the website and Android icons (24-unit grid)
    s, offset = 7.5, SIZE / 2 - 12 * 7.5
    def p(x, y):
        return (offset + x * s, offset + y * s)

    shield = [p(12, 2.5), p(20, 5), p(20, 13), p(12, 21.5), p(4, 13), p(4, 5), p(12, 2.5)]
    d.line(shield, fill=DARK, width=16, joint="curve")
    d.line([p(8.5, 12), p(11, 14.5), p(15.5, 9.5)], fill=DARK, width=16, joint="curve")
    return image


if __name__ == "__main__":
    out = Path(__file__).resolve().parent.parent / "assets" / "shieldnest.ico"
    out.parent.mkdir(exist_ok=True)
    draw().save(out, sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
    print(out)
