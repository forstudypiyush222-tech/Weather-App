/**
 * Aether Weather - Application Controller
 * 
 * Sole responsibility: Bootstrap the application.
 * Initializes all controllers in the correct order and
 * wires up top-level UI interactions that don't belong
 * to any specific feature controller.
 */

import { initDashboardController } from './dashboardController.js';
import { initSearchController, bootApp } from './searchController.js';
import { initThemeController } from './themeController.js';

/**
 * Sets up the sidebar collapse/expand toggle.
 */
function initSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');

    if (sidebar && toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }
}

/**
 * Adds focus/blur visual feedback to the search input container.
 */
function initSearchFocusStyle() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    const searchContainer = searchInput.closest('.search-box');
    if (!searchContainer) return;

    searchInput.addEventListener('focus', () => {
        searchContainer.style.background = 'rgba(255, 255, 255, 0.2)';
        searchContainer.style.boxShadow = '0 0 0 2px var(--color-primary)';
    });

    searchInput.addEventListener('blur', () => {
        searchContainer.style.background = '';
        searchContainer.style.boxShadow = '';
    });
}

/**
 * Placeholder interaction for the profile button.
 */
function initProfileButton() {
    const profileBtn = document.getElementById('profile-button');
    if (!profileBtn) return;

    profileBtn.addEventListener('click', () => {
        console.log('Profile dropdown toggle triggered.');
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

/**
 * Converts vertical mouse-wheel scrolling into horizontal scrolling
 * for designated scroll containers.
 */
function initHorizontalScrollBehavior() {
    const scrollContainers = [
        document.querySelector('.hourly-timeline')?.parentElement,
        document.querySelector('.daily-scroll'),
        document.querySelector('.metrics-strip')
    ];

    scrollContainers.forEach(container => {
        if (container) {
            container.addEventListener('wheel', (e) => {
                if (e.deltaY !== 0 && Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
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
}

/**
 * Bootstraps the entire Aether Weather application.
 * Initializes controllers in the correct dependency order,
 * then wires up generic UI interactions.
 */
export function initApp() {
    // --- Phase 1: Initialize Feature Controllers ---
    initDashboardController();
    initThemeController();
    initSearchController();

    // --- Phase 2: Boot application data flow ---
    bootApp();

    // --- Phase 3: Generic UI interactions ---
    initSidebarToggle();
    initSearchFocusStyle();
    initProfileButton();
    initHorizontalScrollBehavior();
}
