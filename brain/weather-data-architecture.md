# Centralized Data Architecture

## Goal
The system must support immediate, synchronized updates across the entire UI when a city is searched or live data refreshes. Duplicated state is strictly prohibited.

## Data Store Schema (Concept)
A single global store (e.g., React Context + Redux/Zustand, or a reactive JS object) holds the `weatherData`.

```javascript
const weatherState = {
  location: {
    city: "Chapra",
    region: "Bihar",
    country: "India",
    lat: 25.7796,
    lon: 84.7266
  },
  current: {
    temp: 26,
    feelsLike: 29,
    conditionId: "thunderstorm", // Maps to Weather State Architecture
    conditionName: "Thunderstorm",
    rainProbability: 82,
    windSpeed: 13,
    windDir: "NE",
    humidity: 96,
    pressure: 1003,
    visibility: 10,
    cloudCover: 63,
    dewPoint: 25,
    uvIndex: 2,
    uvStatus: "Low"
  },
  todaySummary: {
    maxTemp: 30,
    minTemp: 24,
    description: "Moderate rain for the next 3 hours"
  },
  hourly: [
    { time: "Now", temp: 26, conditionId: "thunderstorm" },
    { time: "12 AM", temp: 25, conditionId: "rain" }
    // ...
  ],
  daily: [
    { day: "Mon 22", maxTemp: 30, minTemp: 24, conditionId: "thunderstorm", rainProb: 82 },
    { day: "Tue 23", maxTemp: 31, minTemp: 24, conditionId: "rain", rainProb: 20 }
    // ...
  ],
  airQuality: {
    aqi: 153,
    status: "Unhealthy",
    target: "for Sensitive Groups",
    mainPollutant: "PM2.5",
    advisory: ["Sensitive groups should reduce prolonged outdoor activity."]
  },
  astronomy: {
    sunrise: "4:50 AM",
    sunset: "6:36 PM",
    moonPhase: "Waxing Gibbous"
  },
  theme: {
    // Derived from current.conditionId
    backgroundUrl: "...",
    accentColor: "..."
  }
};
```

## Update Flow
1. **Trigger**: User selects a new city via the Search City Flow.
2. **Fetch**: Global `updateWeather(lat, lon)` action is dispatched.
3. **API Layer**: Fetch data from Weather, AQI, and Astronomy APIs simultaneously.
4. **Normalization**: Map API responses into the unified schema above.
5. **State Update**: Update the global store.
6. **Reactive Render**: All UI components (Sidebar summary, Hero, Metric Strip, Cards, Background) reactively re-render using the singular new state. 

## Architectural Rules
- Components must NEVER fetch their own data. They must read from the global store.
- Time, date, and derived values (e.g., theme accents) should be calculated at the normalization step and stored centrally, not calculated inside UI components.
