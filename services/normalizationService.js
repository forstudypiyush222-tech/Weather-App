/**
 * Aether Weather - Normalization Service
 * Phase 4.3
 * 
 * Pure translation layer. 
 * Converts raw WeatherAPI payloads into clean, canonical Aether store state objects.
 * Contains no side-effects, no DOM logic, and no API fetch logic.
 */

import { normalizeWeatherState } from '../core/weatherStateEngine.js';
import { computeExactAQI, AQI_STATUS_MAP } from '../core/aqiCalculator.js';
import { getWeatherIcon } from '../core/iconMapper.js';

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
