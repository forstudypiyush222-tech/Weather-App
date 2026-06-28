/**
 * Aether Weather Dashboard - Entry Point
 * 
 * Thin entry point that delegates all bootstrap responsibilities
 * to appController.js. This file exists solely as the ES module
 * target referenced by index.html.
 */

import { initApp } from '../controllers/appController.js';

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
