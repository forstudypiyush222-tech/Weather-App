/**
 * Aether Weather - Geolocation Service
 * 
 * Abstracts the browser Geolocation API behind a clean Promise-based API.
 * No other module should call navigator.geolocation directly.
 */

/**
 * Requests the user's current position from the browser.
 * @param {object} [options] - PositionOptions passed to getCurrentPosition.
 * @param {number} [options.timeout=10000] - Maximum time (ms) to wait.
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export function getCurrentPosition(options = { timeout: 10000 }) {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                reject(error);
            },
            options
        );
    });
}

/**
 * Queries the browser for the current geolocation permission state.
 * @returns {Promise<'granted'|'denied'|'prompt'>}
 */
export async function queryGeoPermission() {
    try {
        const status = await navigator.permissions.query({ name: 'geolocation' });
        return status.state;
    } catch (e) {
        console.warn('Permissions query failed:', e);
        return 'prompt';
    }
}
