/**
 * Aether Weather - Normalization Service
 * Phase 4.3
 * 
 * Pure translation layer. 
 * Converts raw WeatherAPI payloads into clean, canonical Aether store state objects.
 * Contains no side-effects, no DOM logic, and no API fetch logic.
 */

import { normalizeWeatherState } from '../core/weatherStateEngine.js';

// ==========================================
// LOOKUP TABLES & CONSTANTS
// ==========================================

const EPA_PM25_BREAKPOINTS = [
    { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
    { cLow: 250.5, cHigh: 500.4, iLow: 301, iHigh: 500 }
];

const EPA_PM10_BREAKPOINTS = [
    { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
    { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
    { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
    { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
    { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
    { cLow: 425, cHigh: 604, iLow: 301, iHigh: 500 }
];

const AQI_STATUS_MAP = {
    1: { status: 'Good', advisory: 'Air quality is considered satisfactory, and air pollution poses little or no risk.' },
    2: { status: 'Moderate', advisory: 'Air quality is acceptable; however, there may be a moderate health concern for a very small number of people.' },
    3: { status: 'Unhealthy for Sensitive Groups', advisory: 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.' },
    4: { status: 'Unhealthy', advisory: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.' },
    5: { status: 'Very Unhealthy', advisory: 'Health warnings of emergency conditions. The entire population is more likely to be affected.' },
    6: { status: 'Hazardous', advisory: 'Health alert: everyone may experience more serious health effects.' }
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Calculates a piecewise linear sub-index for a given pollutant concentration.
 */
function calculateSubIndex(concentration, breakpoints) {
    if (concentration == null || isNaN(concentration)) return 0;
    
    // EPA Methodology: Truncate concentrations to 1 decimal place to prevent floating point gaps
    const c = Math.floor(concentration * 10) / 10;
    
    // Breakpoint selection
    let bp = breakpoints.find(b => c >= b.cLow && c <= b.cHigh);
    
    // Edge case: Handle concentrations outside exact breakpoint definitions
    if (!bp) {
        bp = c < breakpoints[0].cLow ? breakpoints[0] : breakpoints[breakpoints.length - 1];
    }
    
    // Interpolation Logic: Round(((I_high - I_low) / (C_high - C_low)) * (C - C_low) + I_low)
    // Final AQI rounding: EPA requires rounding to nearest integer
    return Math.round(((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (c - bp.cLow) + bp.iLow);
}

/**
 * Computes exact numerical AQI and determines the main pollutant.
 */
function computeExactAQI(airQuality) {
    if (!airQuality) return { aqiScore: 0, mainPollutant: 'N/A' };
    
    const pm25AQI = calculateSubIndex(airQuality.pm2_5, EPA_PM25_BREAKPOINTS);
    const pm10AQI = calculateSubIndex(airQuality.pm10, EPA_PM10_BREAKPOINTS);
    
    // PM2.5 and PM10 dominate the vast majority of global AQI scores.
    if (pm25AQI >= pm10AQI && pm25AQI > 0) {
        return { aqiScore: pm25AQI, mainPollutant: 'PM2.5' };
    } else if (pm10AQI > 0) {
        return { aqiScore: pm10AQI, mainPollutant: 'PM10' };
    }
    
    return { aqiScore: 0, mainPollutant: 'N/A' };
}

// ==========================================
// EXTRACTION MODULES
// ==========================================

function extractLocation(locationData) {
    if (!locationData) return {};
    
    // Parse local time string "YYYY-MM-DD HH:MM" into separate date/time
    const [localDate = '', localTime = ''] = (locationData.localtime || '').split(' ');
    
    return {
        city: locationData.name || '',
        region: locationData.region || '',
        country: locationData.country || '',
        timezone: locationData.tz_id || '',
        localTime,
        localDate
    };
}

function extractCurrent(currentData) {
    if (!currentData) return {};
    return {
        temperature: currentData.temp_c ?? 0,
        feelsLike: currentData.feelslike_c ?? 0,
        condition: currentData.condition?.text || '',
        conditionCode: currentData.condition?.code || 0,
        humidity: currentData.humidity ?? 0,
        pressure: currentData.pressure_mb ?? 0,
        visibility: currentData.vis_km ?? 0,
        windSpeed: currentData.wind_kph ?? 0,
        windDirection: currentData.wind_dir || '',
        cloudCover: currentData.cloud ?? 0,
        uv: currentData.uv ?? 0,
        dewPoint: currentData.dewpoint_c ?? 0
    };
}

function extractHourly(forecastData) {
    if (!forecastData?.forecastday?.[0]?.hour) return [];
    
    return forecastData.forecastday[0].hour.map(h => {
        const [, time] = (h.time || '').split(' ');
        return {
            time: time || '',
            temperature: h.temp_c ?? 0,
            condition: h.condition?.text || '',
            conditionCode: h.condition?.code || 0,
            rainChance: h.chance_of_rain ?? 0,
            windSpeed: h.wind_kph ?? 0,
            pressure: h.pressure_mb ?? 0
        };
    });
}

function extractDaily(forecastData) {
    if (!forecastData?.forecastday) return [];
    
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return forecastData.forecastday.map(d => {
        const dateStr = d.date || '';
        let dayLabel = '';
        
        // Deterministic date conversion to avoid timezone shifting
        if (dateStr) {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                // new Date(year, monthIndex, day) creates date in local time exactly at midnight
                const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
                dayLabel = daysOfWeek[dateObj.getDay()];
            }
        }

        return {
            day: dayLabel || dateStr, // Weekday label (e.g., "Tue")
            date: dateStr, // Original ISO date string (e.g., "2023-10-24")
            maxTemp: d.day?.maxtemp_c ?? 0,
            minTemp: d.day?.mintemp_c ?? 0,
            condition: d.day?.condition?.text || '',
            conditionCode: d.day?.condition?.code || 0,
            rainChance: d.day?.daily_chance_of_rain ?? 0
        };
    });
}

function extractAirQuality(currentData) {
    const airQualityData = currentData?.air_quality;
    const { aqiScore, mainPollutant } = computeExactAQI(airQualityData);
    
    const epaIndex = airQualityData?.['us-epa-index'] || 1;
    const { status: aqiStatus, advisory: healthAdvisory } = AQI_STATUS_MAP[epaIndex] || AQI_STATUS_MAP[1];
    
    return {
        aqiScore,
        aqiStatus,
        mainPollutant,
        healthAdvisory
    };
}

function extractAstronomy(forecastData) {
    const astro = forecastData?.forecastday?.[0]?.astro;
    if (!astro) {
        return { sunrise: '', sunset: '', moonPhase: '', moonIllumination: '' };
    }
    
    return {
        sunrise: astro.sunrise || '',
        sunset: astro.sunset || '',
        moonPhase: astro.moon_phase || '',
        moonIllumination: astro.moon_illumination || ''
    };
}

// ==========================================
// MAIN EXPORT
// ==========================================

/**
 * Consumes a raw WeatherAPI JSON response and returns a fully normalized
 * Aether state object ready to be dispatched to store.setState().
 * 
 * @param {Object} rawData - The raw JSON response from WeatherAPI
 * @returns {Object} Normalized Aether state object
 */
export function normalizeWeatherPayload(rawData) {
    if (!rawData || typeof rawData !== 'object') {
        return {}; // Return safe empty object on malformed input
    }

    const location = extractLocation(rawData.location);
    const current = extractCurrent(rawData.current);
    
    // Resolve Canonical Weather State
    const conditionText = rawData.current?.condition?.text || '';
    const isDay = rawData.current?.is_day ?? 1;
    const { state: weatherState } = normalizeWeatherState(conditionText, isDay);

    const hourly = extractHourly(rawData.forecast);
    const daily = extractDaily(rawData.forecast);
    const airQuality = extractAirQuality(rawData.current);
    const astronomy = extractAstronomy(rawData.forecast);

    return {
        location,
        current,
        hourly,
        daily,
        airQuality,
        astronomy,
        weatherState
    };
}
