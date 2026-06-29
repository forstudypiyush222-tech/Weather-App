/**
 * Aether Weather - AQI Calculator
 * 
 * Pure domain logic for Air Quality Index calculation.
 * Implements EPA piecewise linear interpolation for PM2.5 and PM10.
 * Contains no side-effects, no DOM logic, and no API logic.
 */

// ============================================================
// EPA BREAKPOINT TABLES
// ============================================================

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

// ============================================================
// AQI STATUS LOOKUP
// ============================================================

export const AQI_STATUS_MAP = {
    1: { status: 'Good', advisory: 'Air quality is considered satisfactory, and air pollution poses little or no risk.' },
    2: { status: 'Moderate', advisory: 'Air quality is acceptable; however, there may be a moderate health concern for a very small number of people.' },
    3: { status: 'Unhealthy for Sensitive Groups', advisory: 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.' },
    4: { status: 'Unhealthy', advisory: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.' },
    5: { status: 'Very Unhealthy', advisory: 'Health warnings of emergency conditions. The entire population is more likely to be affected.' },
    6: { status: 'Hazardous', advisory: 'Health alert: everyone may experience more serious health effects.' }
};

// ============================================================
// CALCULATION FUNCTIONS
// ============================================================

/**
 * Calculates a piecewise linear sub-index for a given pollutant concentration.
 * @param {number|null} concentration - The pollutant concentration value.
 * @param {Array} breakpoints - The EPA breakpoint table.
 * @returns {number} The calculated sub-index (0-500).
 */
export function calculateSubIndex(concentration, breakpoints) {
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
 * @param {object|null} airQuality - Raw air quality data with pm2_5 and pm10 properties.
 * @returns {{aqiScore: number, mainPollutant: string}}
 */
export function computeExactAQI(airQuality) {
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
