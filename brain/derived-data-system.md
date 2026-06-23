# Derived Data System

This document outlines all values that must be computed locally because they are not provided directly by WeatherAPI.com. These computations must occur during the normalization phase before updating the UI components.

## 1. Raw AQI Numerical Score
- **Source Fields**: `current.air_quality.pm2_5`, `current.air_quality.pm10`, etc.
- **Transformation Logic**: Apply the EPA's piecewise linear AQI formula using the raw pollutant concentrations to derive the exact 0-500 integer score (e.g., "153"). Do not use the `us-epa-index` for the raw score, as it only provides a 1-6 category.
- **Destination UI Component**: AQI Card (Main central number).

## 2. AQI Status & AQI Ring
- **Source Fields**: `current.air_quality["us-epa-index"]` (Values 1 through 6).
- **Transformation Logic**:
  - `1` -> Status: "Good", Ring Color: Green, Ring Fill: 16%
  - `2` -> Status: "Moderate", Ring Color: Yellow, Ring Fill: 33%
  - `3` -> Status: "Unhealthy for Sensitive Groups", Ring Color: Orange, Ring Fill: 50%
  - `4` -> Status: "Unhealthy", Ring Color: Red, Ring Fill: 66%
  - `5` -> Status: "Very Unhealthy", Ring Color: Purple, Ring Fill: 83%
  - `6` -> Status: "Hazardous", Ring Color: Maroon, Ring Fill: 100%
- **Destination UI Component**: AQI Card (Status text and SVG gauge ring).

## 3. AQI Health Advisory
- **Source Fields**: Derived from the computed AQI Status (`us-epa-index`).
- **Transformation Logic**: Map the 1-6 index to hardcoded health advisory strings (e.g., `3` -> "Sensitive groups should reduce prolonged outdoor activity").
- **Destination UI Component**: AQI Card (Health Advisory bullet points).

## 4. Main Pollutant
- **Source Fields**: All raw pollutants in `current.air_quality` (co, no2, o3, so2, pm2_5, pm10).
- **Transformation Logic**: Calculate which individual pollutant yields the highest sub-index AQI score based on EPA breakpoints, and return its name (e.g., "PM2.5").
- **Destination UI Component**: AQI Card (Bottom indicator).

## 5. Weather Summary Text
- **Source Fields**: `forecast.forecastday[0].hour` array, `current.condition.text`.
- **Transformation Logic**: Iterate through the next 3-6 hours in the `hour` array to check `chance_of_rain`, `chance_of_snow`, and `temp_c`. Generate a localized sentence (e.g., "Moderate rain for the next 3 hours" or "Temperatures dropping to 24° tonight").
- **Destination UI Component**: Today's Summary Card (Forecast Summary string).

## 6. Weather Insights & Extremes
- **Source Fields**: `forecast.forecastday[0].day`, `current`.
- **Transformation Logic**: Compare current temperature with historical/average (if available) or simply compute daily anomalies to generate insights.
- **Destination UI Component**: Generic insight blocks or future alert systems.

## 7. Weather State & Theme Assignment
- **Source Fields**: `current.condition.code` (WeatherAPI unique integer).
- **Transformation Logic**: Map the integer to one of the 8 approved internal states (Clear Day, Clear Night, Partly Cloudy, Cloudy, Rain, Thunderstorm, Snow, Fog) via a lookup table.
- **Destination UI Component**: Global Application State (drives Background Asset, Theme Accents, CSS Variables, and Icons).
