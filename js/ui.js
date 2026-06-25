/**
 * Aether Weather Dashboard - UI Interaction Layer
 * Phase 3: Visual Implementation (No Data Binding)
 */

import { initDashboardController } from '../controllers/dashboardController.js';
import { initSearchController, selectCity } from '../controllers/searchController.js';
import { initThemeController } from '../controllers/themeController.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- 0. Application Bootstrap ---
    initDashboardController();
    initThemeController();
    initSearchController();
    
    // Load Default City
    selectCity('London');

    
    // --- 1. Sidebar Toggle Logic ---
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    
    if (sidebar && toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }

    // --- 2. Search Input Focus State ---
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        const searchContainer = searchInput.closest('.search-box'); // The glass panel container
        
        if (searchContainer) {
            searchInput.addEventListener('focus', () => {
                searchContainer.style.background = 'rgba(255, 255, 255, 0.2)';
                searchContainer.style.boxShadow = '0 0 0 2px var(--color-primary)';
            });
            
            searchInput.addEventListener('blur', () => {
                searchContainer.style.background = '';
                searchContainer.style.boxShadow = '';
            });
        }
    }

    // --- 3. Profile Dropdown Placeholder ---
    const profileBtn = document.getElementById('profile-button');
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            // Visual placeholder for future dropdown
            console.log('Profile dropdown toggle triggered.');
            // Toggle a simple active state for now
            if (profileBtn.style.transform === 'scale(0.95)') {
                profileBtn.style.transform = 'none';
            } else {
                profileBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    profileBtn.style.transform = 'none';
                }, 150);
            }
        });
    }

    // --- 4. Forecast Card Scrolling (Horizontal Mouse Wheel Support) ---
    const scrollContainers = [
        document.querySelector('.hourly-timeline').parentElement,
        document.querySelector('.daily-scroll'),
        document.querySelector('.metrics-strip')
    ];

    scrollContainers.forEach(container => {
        if (container) {
            container.addEventListener('wheel', (e) => {
                // If the user scrolls vertically, scroll the container horizontally
                if (e.deltaY !== 0 && Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
                    // Prevent default vertical scroll of the page if we are scrolling the container
                    const maxScrollLeft = container.scrollWidth - container.clientWidth;
                    
                    if ((e.deltaY > 0 && container.scrollLeft < maxScrollLeft) || 
                        (e.deltaY < 0 && container.scrollLeft > 0)) {
                        e.preventDefault();
                        container.scrollLeft += e.deltaY;
                    }
                }
            }, { passive: false });
        }
    });
});
