# Aether - Development Roadmap

## Phase 0: Project Brain
- Establish permanent project intelligence.
- Generate architecture documents, UI systems, and data flow guidelines.

## Phase 1: Weather State Architecture
- Define core weather states (Clear Day, Clear Night, Rain, etc.).
- Map background images, colors, overlays, and icons.

## Phase 2: weatherData Architecture
- Design centralized state management.
- Ensure city switching cascades correctly to all UI components.

## Phase 3: Weather API Selection
- Evaluate and select appropriate APIs for weather, AQI, and astronomy data.

## Phase 4: API Integration
- Implement API services.
- Map API responses to internal `weatherData` models.

## Phase 5: Search City Flow
- Build the search UI and integration.
- Connect search output to global state updates.

## Phase 6: Hero Live Data
- Connect the main dashboard hero section (Temperature, Condition, Location) to live data.

## Phase 7: Hourly Forecast Integration
- Populate hourly forecast cards and charts with dynamic data.

## Phase 8: Daily Forecast Integration
- Populate 7-day forecast cards.

## Phase 9: AQI Integration
- Connect AQI metric and health advisories.
- Implement dynamic AQI ring based on severity.

## Phase 10: Metric Strip Integration
- Connect bottom horizontal strip (Humidity, Wind, Pressure, Visibility, etc.) to live data.

## Phase 11: Loading and Error States
- Implement skeleton loaders and graceful error handling for failed API calls.

## Phase 12: Theme System
- Implement dynamic Tailwind color switching based on the current weather state.

## Phase 13: Background System
- Implement high-quality image-based backgrounds transitioning based on weather state.

## Phase 14: Cinematic Weather Effects
- Future enhancements: Explore videos, shaders, and advanced animations (currently out of scope).
