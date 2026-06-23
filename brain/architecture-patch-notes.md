# Architecture Patch Notes

*These patches act as targeted architectural corrections to the Project Brain. They extend and override specific rules without replacing existing files.*

## Patch 1: `weather-data-architecture.md` Updates

### 1. Timezone Strategy
**Problem Resolved**: Ambiguous formatted time strings relying on user device time.

**New Rule**: The dashboard must **always** display the selected city's local time. It must never display the user's local device time (e.g., A user in India searching "Tokyo" will see Tokyo's local time).

**Data Structure Changes**:
The `weatherState.location` object must be updated to store comprehensive timezone data:
```javascript
  location: {
    city: "Tokyo",
    region: "Tokyo",
    country: "Japan",
    lat: 35.6762,
    lon: 139.6503,
    // NEW FIELDS
    timezoneId: "Asia/Tokyo",
    localtimeEpoch: 1718870400,
    utcOffset: "+09:00",
    localtime: "2024-06-20 17:00" // Raw API string for fallback parsing
  }
```

**Formatting Strategy**: All UI components rendering time or date must derive their display from `localtimeEpoch` and `timezoneId` using `Intl.DateTimeFormat` configured with the target `timeZone` property.

### 2. Geocoding Flow
**Problem Resolved**: Assuming text search magically resolves to `lat/lon`.

**Workflow Definition**:
1. **User Input**: User types city name into the search bar.
2. **Geocoding Service**: Query is sent to a dedicated Geocoding API, not the Weather API.
3. **Candidate Results**: System displays a dropdown of results to handle ambiguous or duplicate names (e.g., "Paris, Texas" vs "Paris, France").
4. **User Selection**: User clicks the correct location.
5. **Latitude/Longitude**: The specific `lat/lon` and `timezoneId` are extracted.
6. **Weather Fetch**: The global `updateWeather(lat, lon)` action is dispatched.

**Failure Handling**:
- *No Results*: Display inline "No locations found matching '[Input]'" below the search bar.
- *Failed Search (Network)*: Display "Unable to connect to search service. Please try again."

### 3. Missing Payload Data Strategy (Graceful Degradation)
**Problem Resolved**: Preventing the dashboard from crashing if WeatherAPI omits secondary data (like AQI or Astronomy) from the monolithic payload.

**JSON Key Null Checking**: Since `/forecast.json` delivers all data in a single payload, independent network failures for AQI or Astronomy are impossible. Instead, the architecture must handle missing keys in the JSON response (e.g., when a rural city lacks an AQI station).

**Graceful Degradation Rules**:
- **Weather Data**: *Critical*. If the network request fails, trigger the global Error State.
- **AQI Data**: *Non-Critical*. If `current.air_quality` is undefined, the dashboard loads normally. The AQI card displays "Data unavailable" with an empty gauge.
- **Astronomy Data**: *Non-Critical*. If `astro` keys are undefined, the Sunrise/Sunset/Moon Phase blocks display "--".

---

## Patch 2: `weather-state-system.md` Updates

### Weather Condition Normalization
**Problem Resolved**: Weather APIs returning hundreds of hyper-specific conditions that don't map directly to the 8 core Weather States.

**Mapping Layer Design**:
A strict normalization function (`normalizeWeatherCondition(apiCode)`) acts as the intermediary between raw API data and the UI state. This layer is the single source of truth for background assets, icons, animations, and theme accents.

**Mapping Examples**:
- `Patchy rain nearby`, `Heavy rain`, `Moderate rain`, `Light rain showers` → **`Rain`**
- `Mist`, `Haze`, `Freezing fog` → **`Fog`**
- `Thunderstorm with rain`, `Patchy light rain with thunder` → **`Thunderstorm`**
- `Overcast` → **`Cloudy`**

This ensures the UI only ever attempts to load the 8 approved, robust themes regardless of API verbosity.

---

## Patch 3: `roadmap.md` Updates

**Phase 4: API Integration**
- *Addition*: Implement Weather Condition Normalization layer to map raw API codes to the 8 core visual states.

**Phase 5: Search City Flow**
- *Addition*: Implement the complete Geocoding Flow (User Input → Geocoding Service → Candidate Results → Selection). Handle duplicate cities and "no results" states.

**Phase 11: Loading and Error States**
- *Addition*: Implement JSON Key Null Checking. Ensure non-critical payload omissions (missing AQI, Astronomy objects) gracefully degrade to "Data unavailable" without crashing the UI.

---

## Patch 4: `master-memory.md` Updates

**System Architecture Overview (Additions)**:
- **Timezone Enforcement**: The dashboard must strictly run on the selected city's local timezone. Never fallback to the user device time.
- **Graceful Degradation**: Secondary data (AQI, Astronomy) may be omitted from the WeatherAPI payload. The UI must handle null keys without crashing.
- **Normalization Layer**: All raw weather conditions from APIs must pass through a normalization layer to guarantee they match one of the 8 core weather states before reaching the Theme System.
