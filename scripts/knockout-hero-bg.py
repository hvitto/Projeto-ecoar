from pathlib import Path
from collections import deque

from PIL import Image

src = Path('public/assets/branding/heroes/hero-trade.png')
backup = Path('public/assets/branding/heroes/hero-trade-solid.png')
out = Path('public/assets/branding/heroes/hero-trade.png')

if not backup.exists():
    backup.write_bytes(src.read_bytes())

img = Image.open(backup).convert('RGBA')
pixels = img.load()
w, h = img.size
tol = 28


def is_bg(x: int, y: int) -> bool:
    r, g, b, a = pixels[x, y]
    return a > 0 and (r + g + b) / 3 <= tol


visited = [[False] * h for _ in range(w)]
q: deque[tuple[int, int]] = deque()
seeds = [
    (0, 0),
    (w - 1, 0),
    (0, h - 1),
    (w - 1, h - 1),
    (w // 2, 0),
    (w // 2, h - 1),
    (0, h // 2),
    (w - 1, h // 2),
]
for x, y in seeds:
    if is_bg(x, y) and not visited[x][y]:
        visited[x][y] = True
        q.append((x, y))

count = 0
while q:
    x, y = q.popleft()
    r, g, b, _ = pixels[x, y]
    pixels[x, y] = (r, g, b, 0)
    count += 1
    for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
        if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny] and is_bg(nx, ny):
            visited[nx][ny] = True
            q.append((nx, ny))

img.save(out, optimize=True)
print(f'saved {out} transparent={count} bytes={out.stat().st_size}')
