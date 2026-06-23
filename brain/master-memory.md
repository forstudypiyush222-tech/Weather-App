# Aether - Project Brain Master Memory

## Project Overview
- **Name**: Aether
- **Type**: Premium desktop-first weather dashboard
- **Goal**: A dynamic, highly interactive weather dashboard where every component updates consistently upon searching/changing a city.

## System Architecture Overview
Aether relies on a centralized architecture to prevent duplicated state. A single state update must cascade to:
- Weather condition, Temperature, Background, Hero section
- Time, Date, Day
- Hourly & Daily forecast, Forecast graphs
- AQI & AQI ring
- Metric strip
- Weather icons, Theme accents, Future weather animations

## Project Brain Structure
- `roadmap.md`: Step-by-step project execution plan.
- `decisions.md`: Log of architectural and design decisions.
- `mistakes.md`: Log of errors and corrected paths.
- `ui-system.md`: Approved UI architecture extracted from Stitch.
- `weather-state-system.md`: Architecture for mapping weather conditions to UI themes.
- `weather-data-architecture.md`: Centralized state management architecture.

## AI Agent Guidelines
This Project Brain is the permanent source of truth for all future Gemini, Claude, Antigravity agents, and AI workflows.
- Always consult these documents before suggesting changes.
- Do not redesign or reinterpret the approved Stitch screens.
- Keep state centralized and UI consistent.
