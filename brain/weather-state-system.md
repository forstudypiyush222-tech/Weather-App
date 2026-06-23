# Weather State Architecture

## Core Philosophy
Every weather state must define a cohesive visual experience. This involves mapping the state identifier to a specific high-quality background image, an icon style, UI accent colors, and overlays. 

*Constraint: Use image-based backgrounds first. No videos or shaders.*

## Defined States

### 1. Clear Day
- **Identifier**: `clear_day`
- **Background Asset**: Cinematic bright blue sky with minimal clouds, sun rays.
- **Icon Style**: `wb_sunny` (Material Symbols), bright yellow/orange.
- **Accent Color**: Golden/Yellow (`secondary` `#ffb95f`).
- **Overlay**: `bg-background/20` (lighter overlay for day).
- **Animation Strategy**: Subtle CSS pan/zoom on background image.

### 2. Clear Night
- **Identifier**: `clear_night`
- **Background Asset**: Starry night sky, moonlight over landscape.
- **Icon Style**: `clear_night` or `brightness_2`.
- **Accent Color**: Pale blue/Silver (`tertiary` `#89ceff`).
- **Overlay**: `bg-background/50` (darker overlay).
- **Animation Strategy**: Slow static pulse or slight image pan.

### 3. Partly Cloudy
- **Identifier**: `partly_cloudy`
- **Background Asset**: Sky with scattered puffy clouds, mixed lighting.
- **Icon Style**: `partly_cloudy_day` / `partly_cloudy_night`.
- **Accent Color**: Soft blue/white.
- **Overlay**: `bg-background/30`.
- **Animation Strategy**: Horizontal slow pan simulating cloud movement.

### 4. Cloudy
- **Identifier**: `cloudy`
- **Background Asset**: Overcast sky, soft diffused light.
- **Icon Style**: `cloudy`, grey tones.
- **Accent Color**: Cool grey / Muted blue.
- **Overlay**: `bg-background/40`.
- **Animation Strategy**: Minimal movement.

### 5. Rain
- **Identifier**: `rain`
- **Background Asset**: Rainy scene, wet surfaces reflecting light.
- **Icon Style**: `rainy` or `water_drop`.
- **Accent Color**: Deep blue / Cyan.
- **Overlay**: `bg-background/60` (moody, darker).
- **Animation Strategy**: Downward diagonal pan.

### 6. Thunderstorm (Reference from Stitch)
- **Identifier**: `thunderstorm`
- **Background Asset**: Dark mountain road during severe storm, lightning strikes.
- **Icon Style**: `thunderstorm`.
- **Accent Color**: Purple (`primary` `#d2bbff`) or intense electric blue.
- **Overlay**: `bg-background/40`.
- **Animation Strategy**: Occasional brightness flash (CSS brightness filter).

### 7. Snow
- **Identifier**: `snow`
- **Background Asset**: Winter landscape, falling snow, frosted environment.
- **Icon Style**: `ac_unit` or `weather_snowy`.
- **Accent Color**: Crisp white / Ice blue (`on-tertiary-container` `#cfe9ff`).
- **Overlay**: `bg-background/30`.
- **Animation Strategy**: Slow vertical pan.

### 8. Fog
- **Identifier**: `fog`
- **Background Asset**: Misty forest or city streets, low visibility.
- **Icon Style**: `foggy`.
- **Accent Color**: Muted silver/grey.
- **Overlay**: `bg-background/50` (dense blur effect).
- **Animation Strategy**: Very slow scale-up (zoom in).
