/**
 * Aether Weather - API Configuration
 * 
 * Centralized configuration for external API services.
 */

// Import the local, git-ignored API key
import { API_KEY as localKey } from './apiConfig.local.js';

export const API_CONFIG = {
    // All services must access the key through this variable
    API_KEY: localKey,
    
    // Default base URL for WeatherAPI
    BASE_URL: 'https://api.weatherapi.com/v1'
};
