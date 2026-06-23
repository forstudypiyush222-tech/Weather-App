# UI System Architecture

## Approved Source
Based entirely on Stitch Screen: **Interactive Weather Dashboard Sidebar** (ID: `a5b3730acc684351bb632a3ef9d94ff0`).

## Color Palette (Tailwind Custom)
- **Backgrounds**: `bg-background` (`#0b1326`), `surface-container-highest` (`#2d3449`)
- **Surface**: `surface-container/20`, `glass-panel` (rgba with blur)
- **Primary Accent**: `primary` (`#d2bbff`), `text-on-surface` (`#dae2fd`), `on-surface-variant` (`#ccc3d8`)
- **Semantic/Weather Variables**: `secondary` (`#ffb95f`), `tertiary` (`#89ceff`), `error` (`#ffb4ab`)

## Typography
- **Display Hero**: `Hanken Grotesk` (Light/300, up to 80px)
- **Headlines**: `Hanken Grotesk` (SemiBold/600)
- **Body**: `Inter` (Regular/400)
- **Data Points/Labels**: `JetBrains Mono` (Medium/500 to SemiBold/600)

## Layout Structure
1. **Full Screen Background Layer**: Fixed absolute positioning, background-image with `bg-background/40` overlay.
2. **App Container**: `flex h-screen w-full`
3. **Sidebar Navigation**:
   - Width: 280px (collapsible to 80px using transition on width).
   - Glassmorphism styling (`backdrop-blur-[20px]`).
   - Bottom area contains a unique Weather/Location summary card with Search button.
4. **Main Content Canvas**:
   - Top App Bar (Search, Profile).
   - Scrollable area (`custom-scrollbar`) max-width 1400px.
   - Grid System (12 columns on `lg`).

## Component Specifications

### Glass Panels
- Base class: `.glass-panel`
- CSS: `background: rgba(11, 19, 38, 0.4); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.1);`

### Hero Section (Top)
- 8-column layout.
- Huge typography (Display Hero).
- 4 floating glass-panel summary cards (Max Temp, Min Temp, Rain, Wind) arranged horizontally.

### Today's Summary Card (Top Right)
- 4-column layout.
- Vertical list of metrics (Max/Min temp, Rain Probability, Wind, UV Index).
- Action button "View full details".

### Hourly & Daily Forecast (Middle)
- **Hourly**: Contains an HTML Canvas (`#hourlyForecastChart`) for graphing, and a horizontal scroll of hourly data points. Includes toggles for Temp, Precipitation, Wind, Pressure.
- **Daily**: Horizontal scroll of 7-day cards displaying Date, Icon, High/Low, Precipitation %.

### Air Quality (Middle Right)
- Circular SVG gauge for AQI.
- Prominent status (e.g., "Unhealthy") and Health Advisory bullet points.

### Metric Strip (Bottom)
- Horizontal, scrollable glass panel taking full width.
- Contains inline data points with icons: Feels Like, Humidity, Wind, Pressure, Visibility, Clouds, Dew Point, UV, Sunrise, Sunset, Moon Phase.
