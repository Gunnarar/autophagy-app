import math
import os
import struct
import zlib
from dataclasses import dataclass
from typing import Iterable, Tuple

# Genesis4PD brand palette pulled from utils/theme.js for reuse.
BRAND_COLORS = {
    'deep_navy': (0x1B, 0x3B, 0x4B),
    'brand_red': (0xD4, 0x18, 0x3D),
    'brand_red_dark': (0x9C, 0x12, 0x30),
    'brand_highlight': (0xF9, 0x73, 0x16),
    'mist_surface': (0xEE, 0xF5, 0xF7),
    'frost_surface': (0xF9, 0xFB, 0xFD),
}


@dataclass(frozen=True)
class IconSpec:
    size: int
    circle_radius: float
    inner_radius: float
    ring_radius: float
    ring_thickness: float
    glow_radius: float
    accent_radius: float
    accent_offset: float


# Utility helpers -----------------------------------------------------------

def _lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def _lerp_color(c1: Tuple[int, int, int], c2: Tuple[int, int, int], t: float) -> Tuple[float, float, float]:
    return tuple(_lerp(c1[i], c2[i], t) for i in range(3))


def _blend(color: Iterable[float], target: Tuple[int, int, int], alpha: float) -> Tuple[float, float, float]:
    return tuple(color[i] * (1.0 - alpha) + target[i] * alpha for i in range(3))


def _write_png(path: str, pixels: bytes, width: int, height: int) -> None:
    header = bytearray(b"\x89PNG\r\n\x1a\n")
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)

    def chunk(chunk_type: bytes, data: bytes) -> bytes:
        chunk = struct.pack('>I', len(data)) + chunk_type + data
        crc = zlib.crc32(chunk_type + data) & 0xFFFFFFFF
        chunk += struct.pack('>I', crc)
        return chunk

    compressed = zlib.compress(pixels, level=9)
    png_bytes = header + chunk(b'IHDR', ihdr) + chunk(b'IDAT', compressed) + chunk(b'IEND', b'')

    with open(path, 'wb') as f:
        f.write(png_bytes)


# Icon renderer -------------------------------------------------------------

def _generate_icon(spec: IconSpec) -> bytes:
    width = height = spec.size
    centre = spec.size / 2.0
    top_color = BRAND_COLORS['deep_navy']
    bottom_color = BRAND_COLORS['brand_red']
    glow_target = BRAND_COLORS['frost_surface']
    ring_color = BRAND_COLORS['brand_highlight']
    accent_color = BRAND_COLORS['brand_red']

    rows = bytearray()
    for y in range(height):
        rows.append(0)  # PNG filter type 0 (None)
        vertical_mix = y / (height - 1)
        base_color = _lerp_color(top_color, bottom_color, vertical_mix)
        for x in range(width):
            color = list(base_color)
            dx = x - centre
            dy = y - centre
            dist = math.hypot(dx, dy)

            # Subtle radial glow that brightens toward the centre.
            radial = max(0.0, 1.0 - dist / (spec.size * 0.65))
            if radial > 0:
                color = list(_blend(color, glow_target, 0.35 * radial))

            # Soft vignette towards the corners to keep focus on the emblem.
            vignette = (abs(dx) / centre) * (abs(dy) / centre)
            if vignette > 0:
                color = list(_blend(color, top_color, 0.15 * vignette))

            # Layer the soft outer circle.
            if dist <= spec.circle_radius:
                color = list(_blend(color, BRAND_COLORS['mist_surface'], 0.92))

            # Inner core.
            if dist <= spec.inner_radius:
                color = list(_blend(color, BRAND_COLORS['frost_surface'], 1.0))

            # Highlight ring describing the orbit path (limited angular sweep).
            if spec.inner_radius * 0.7 <= dist <= spec.inner_radius + spec.ring_thickness:
                angle = math.degrees(math.atan2(dy, dx))
                if -135.0 <= angle <= 50.0:
                    # Feather the ring edges for smoother anti-aliasing.
                    edge_distance = abs(dist - spec.ring_radius)
                    softness = max(0.0, 1.0 - edge_distance / (spec.ring_thickness / 2.0))
                    if softness > 0:
                        color = list(_blend(color, ring_color, 0.75 * softness))

            # Accent orb riding the trajectory (small circular overlay).
            accent_angle = math.radians(-120.0)
            accent_cx = centre + math.cos(accent_angle) * spec.accent_offset
            accent_cy = centre + math.sin(accent_angle) * spec.accent_offset
            dist_accent = math.hypot(x - accent_cx, y - accent_cy)
            if dist_accent <= spec.accent_radius:
                transition = max(0.0, 1.0 - dist_accent / spec.accent_radius)
                color = list(_blend(color, accent_color, 0.6 + 0.4 * transition))

            # Inner energy core.
            if dist <= spec.glow_radius:
                core_color = _blend(BRAND_COLORS['brand_red'], BRAND_COLORS['frost_surface'], 0.55)
                color = list(_blend(color, core_color, 0.8))

            rows.extend(int(max(0, min(255, round(channel)))) for channel in (*color, 255))
    return bytes(rows)


def render_icon_set(output_dir: str) -> None:
    os.makedirs(output_dir, exist_ok=True)

    icon_spec = IconSpec(
        size=1024,
        circle_radius=360.0,
        inner_radius=300.0,
        ring_radius=240.0,
        ring_thickness=96.0,
        glow_radius=140.0,
        accent_radius=72.0,
        accent_offset=260.0,
    )
    icon_pixels = _generate_icon(icon_spec)
    _write_png(os.path.join(output_dir, 'icon.png'), icon_pixels, icon_spec.size, icon_spec.size)

    adaptive_spec = IconSpec(
        size=1024,
        circle_radius=340.0,
        inner_radius=280.0,
        ring_radius=220.0,
        ring_thickness=90.0,
        glow_radius=120.0,
        accent_radius=64.0,
        accent_offset=240.0,
    )
    adaptive_pixels = _generate_icon(adaptive_spec)
    _write_png(os.path.join(output_dir, 'adaptive-icon.png'), adaptive_pixels, adaptive_spec.size, adaptive_spec.size)


if __name__ == '__main__':
    OUTPUT = os.path.join(os.path.dirname(__file__), '..', 'assets')
    render_icon_set(os.path.abspath(OUTPUT))
    print('Generated icon assets in', OUTPUT)