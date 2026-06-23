# Architectural & Design Decisions

## UI & Design System
- **Source of Truth**: Stitch Project `9072778121241349265` - Screen "Interactive Weather Dashboard Sidebar".
- **Styling**: Tailwind CSS with custom color tokens (`surface-container-highest`, `primary`, etc.).
- **Layout**: Desktop-first flex container with a fixed, collapsible sidebar (`280px` expanded, `80px` collapsed). Main content uses a scrollable canvas with a responsive CSS Grid system (12 columns).
- **Glassmorphism**: Components use backdrop-blur panels (`backdrop-blur-[20px]`, `bg-surface-container/20`, border transparency).
- **Typography**: Uses `Hanken Grotesk` for headlines/display, `Inter` for body text, and `JetBrains Mono` for data points and labels.

## Weather States & Backgrounds
- **Decision**: Use static, high-quality cinematic image-based backgrounds for weather states.
- **Constraint**: Do NOT use videos or WebGL shaders initially. They are reserved for Phase 14 enhancements.

## State Management
- **Decision**: Centralized single-source-of-truth architecture.
- **Reasoning**: Changing a city must update all components seamlessly without desync. No local state for weather metrics.

## Component Specifics
- **Sidebar Footer**: The sidebar contains a unique, persistent Location/Summary card at the bottom (City, Time, Weather Icon, Temp, Search City button). This must remain accessible at all times when expanded.
