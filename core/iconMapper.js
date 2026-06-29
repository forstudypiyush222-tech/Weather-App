/**
 * Aether Weather - Icon Mapper
 * 
 * Maps weather condition codes and canonical weather states
 * to Material Symbols icon names. Pure mapping logic with
 * no side-effects, no DOM logic, and no API logic.
 */

// ============================================================
// ICON LOOKUP TABLES
// ============================================================

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

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Maps raw WeatherAPI conditions to a valid Material Symbols icon name.
 * Prioritizes the canonical weather state, falls back to condition code.
 * @param {number} conditionCode - WeatherAPI condition code.
 * @param {string} weatherState - Canonical Aether weather state string.
 * @returns {string} Material Symbols icon name.
 */
export function getWeatherIcon(conditionCode, weatherState) {
    if (weatherState && ICON_MAP_BY_STATE[weatherState]) {
        return ICON_MAP_BY_STATE[weatherState];
    }
    if (conditionCode && ICON_MAP_BY_CODE[conditionCode]) {
        return ICON_MAP_BY_CODE[conditionCode];
    }
    return 'cloud';
}
