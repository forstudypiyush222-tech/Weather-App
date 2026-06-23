# Project Brain Audit Report

An audit of the generated Project Brain documentation (`master-memory.md`, `roadmap.md`, `decisions.md`, `mistakes.md`, `ui-system.md`, `weather-state-system.md`, and `weather-data-architecture.md`) has revealed several contradictions, missing assumptions, and architectural risks that need to be addressed before implementation.

## 1. Contradictions

### Static UI Palette vs. Dynamic Weather Theming
- **`ui-system.md`** defines a fixed Tailwind configuration with hardcoded HEX values for `primary`, `secondary`, and `tertiary`.
- **`weather-state-system.md`** defines dynamic accent colors for each weather state (e.g., golden for Clear Day, purple for Thunderstorm).
- **The Contradiction**: If the Tailwind configuration is hardcoded in `tailwind.config`, the UI cannot dynamically swap accent colors based on the weather state. The system must either use CSS variables for Tailwind color tokens (e.g., `primary: 'var(--color-primary)'`) or use dynamic class mapping, which is not defined in the architecture.

### Static Backgrounds vs. Animation Strategies
- **`decisions.md`** explicitly states: "Use static, high-quality cinematic image-based backgrounds."
- **`weather-state-system.md`** specifies "Animation Strategies" for every state (e.g., "Subtle CSS pan/zoom", "Downward diagonal pan").
- **The Contradiction**: The backgrounds are simultaneously defined as static and animated. While CSS animations avoid WebGL/Videos, "static" implies no movement.

## 2. Missing Assumptions

### Timezone Handling (Critical)
- **`weather-data-architecture.md`** stores times as strings (`"4:50 AM"`, `"12 AM"`).
- **Missing**: When a user in New York searches for Tokyo, whose timezone is displayed? The architecture assumes times are absolute strings but lacks a strategy for local vs. target timezone calculation and formatting.

### Geocoding & Search Resolution
- **`weather-data-architecture.md`** triggers updates via `updateWeather(lat, lon)`.
- **Missing**: Phase 5 (Search City Flow) does not account for a Geocoding API step. The architecture assumes user text input magically converts to `lat/lon` without defining the intermediary resolution step or handling ambiguous cities (e.g., "Paris, Texas" vs "Paris, France").

### Unit Systems & Localization
- **Stitch UI** hardcodes Metric units (`°`, `km/h`, `hPa`).
- **Missing**: The architecture assumes a purely Metric application. There is no provision in the state store for `units: "metric" | "imperial"`, nor conversion logic for users in regions that use Fahrenheit or miles per hour.

### Polling & Live Data Refresh Strategy
- **`weather-data-architecture.md`** mentions "live data refreshes".
- **Missing**: The mechanism for live refresh is undefined. Will the app use HTTP polling every 15 minutes, WebSockets, or rely strictly on manual user re-fetches?

## 3. Architecture Risks

### API Aggregation & Partial Failures
- **Risk**: Step 3 of the Data Update Flow mandates fetching "Weather, AQI, and Astronomy APIs simultaneously".
- **Impact**: If the AQI API goes down, does the entire weather update fail? The architecture currently lacks a fallback or partial state update mechanism for disparate API shards.

### Canvas Hydration & Reactive State
- **Risk**: The UI features an `<canvas id="hourlyForecastChart">`.
- **Impact**: The architecture dictates that "All UI components reactively re-render using the singular new state." However, HTML Canvas cannot natively map to declarative reactive state (like React JSX). It requires imperative lifecycle hooks to destroy and redraw charts. This edge case is not accounted for in the global state flow.

### Cascading Re-renders (Performance)
- **Risk**: A monolithic global `weatherState` object.
- **Impact**: If a simple standard React Context is used for a monolithic state of this size, updating the clock or a single metric will trigger a massive re-render of the entire dashboard, grid, sidebar, and canvas chart. The architecture mentions Zustand/Redux but does not mandate atomic selector usage to prevent performance bottlenecks.

### Image Preloading & FOUC (Flash of Unstyled Content)
- **Risk**: Changing the weather state dynamically swaps the background image url.
- **Impact**: High-quality cinematic images are heavy (1MB+). When switching from "Chapra" to "London", the `weatherState.theme.backgroundUrl` will update instantly, but the image will take seconds to download, leaving a blank or flashing background. A preloading or crossfade caching strategy is missing.
