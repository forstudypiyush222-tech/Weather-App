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

const ICON_MAP_BY_STATE = {
    'clear-day': 'wb_sunny',
    'clear-night': 'dark_mode',
    'partly-cloudy-day': 'partly_cloudy_day',
    'partly-cloudy-night': 'partly_cloudy_night',
    'cloudy-day': 'cloud',
    'cloudy-night': 'cloud',
    'rain': 'rainy',
    'thunderstorm': 'thunderstorm',
    'snow': 'ac_unit',
    'fog': 'foggy'
};

const ICON_MAP_BY_CODE = {
    1000: 'wb_sunny', 1003: 'partly_cloudy_day', 1006: 'cloud', 1009: 'cloud',
    1030: 'foggy', 1063: 'rainy', 1066: 'ac_unit', 1069: 'weather_mix',
    1072: 'weather_mix', 1087: 'thunderstorm', 1114: 'ac_unit', 1117: 'ac_unit',
    1135: 'foggy', 1148: 'foggy', 1150: 'rainy', 1153: 'rainy',
    1168: 'weather_mix', 1171: 'weather_mix', 1180: 'rainy', 1183: 'rainy',
    1186: 'rainy', 1189: 'rainy', 1192: 'rainy_heavy', 1195: 'rainy_heavy',
    1198: 'weather_mix', 1201: 'weather_mix', 1204: 'weather_mix', 1207: 'weather_mix',
    1210: 'ac_unit', 1213: 'ac_unit', 1216: 'ac_unit', 1219: 'ac_unit',
    1222: 'ac_unit', 1225: 'ac_unit', 1237: 'weather_mix', 1240: 'rainy',
    1243: 'rainy_heavy', 1246: 'rainy_heavy', 1249: 'weather_mix', 1252: 'weather_mix',
    1255: 'ac_unit', 1258: 'ac_unit', 1261: 'weather_mix', 1264: 'weather_mix',
    1273: 'thunderstorm', 1276: 'thunderstorm', 1279: 'thunderstorm', 1282: 'thunderstorm'
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

/**
 * Maps raw WeatherAPI conditions to a valid Material Symbols icon name.
 */
function getWeatherIcon(conditionCode, weatherState) {
    if (weatherState && ICON_MAP_BY_STATE[weatherState]) {
        return ICON_MAP_BY_STATE[weatherState];
    }
    if (conditionCode && ICON_MAP_BY_CODE[conditionCode]) {
        return ICON_MAP_BY_CODE[conditionCode];
    }
    return 'cloud';
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

function extractCurrent(currentData, weatherState) {
    if (!currentData) return {};
    
    const conditionCode = currentData.condition?.code || 0;
    
    return {
        temperature: currentData.temp_c ?? 0,
        feelsLike: currentData.feelslike_c ?? 0,
        condition: currentData.condition?.text || '',
        conditionCode: conditionCode,
        icon: getWeatherIcon(conditionCode, weatherState),
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

function extractHourly(forecastData, localtime_epoch) {
    if (!forecastData?.forecastday) return [];
    
    let combinedHours = [];
    if (forecastData.forecastday[0]?.hour) {
        combinedHours = combinedHours.concat(forecastData.forecastday[0].hour);
    }
    if (forecastData.forecastday[1]?.hour) {
        combinedHours = combinedHours.concat(forecastData.forecastday[1].hour);
    }
    
    const fallbackEpoch = localtime_epoch || 0;
    const futureHours = combinedHours.filter(h => h.time_epoch >= fallbackEpoch);
    const next24 = futureHours.slice(0, 24);

    return next24.map(h => {
        const [, time] = (h.time || '').split(' ');
        const conditionText = h.condition?.text || '';
        const conditionCode = h.condition?.code || 0;
        const isDay = h.is_day ?? 1;
        const { state: hourState } = normalizeWeatherState(conditionText, isDay);

        return {
            time: time || '',
            temperature: h.temp_c ?? 0,
            condition: conditionText,
            conditionCode: conditionCode,
            icon: getWeatherIcon(conditionCode, hourState),
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

        const conditionText = d.day?.condition?.text || '';
        const conditionCode = d.day?.condition?.code || 0;
        const { state: dayState } = normalizeWeatherState(conditionText, 1); // 1 = force day icon

        return {
            day: dayLabel || dateStr, // Weekday label (e.g., "Tue")
            date: dateStr, // Original ISO date string (e.g., "2023-10-24")
            maxTemp: d.day?.maxtemp_c ?? 0,
            minTemp: d.day?.mintemp_c ?? 0,
            condition: conditionText,
            conditionCode: conditionCode,
            icon: getWeatherIcon(conditionCode, dayState),
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
    
    // Resolve Canonical Weather State
    const conditionText = rawData.current?.condition?.text || '';
    const isDay = rawData.current?.is_day ?? 1;
    const { state: weatherState } = normalizeWeatherState(conditionText, isDay);

    const current = extractCurrent(rawData.current, weatherState);
    const hourly = extractHourly(rawData.forecast, rawData.location?.localtime_epoch);
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
