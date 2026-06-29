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
    const mobileToggleBtn = document.getElementById('mobile-sidebar-toggle');
    const overlay = document.getElementById('sidebar-overlay');
    const navItems = document.querySelectorAll('.nav-item');

    if (!sidebar) return;

    function closeSidebar() {
        if (window.innerWidth <= 1024) {
            sidebar.classList.remove('drawer-open');
            sidebar.classList.add('collapsed');
            if (overlay) {
                overlay.classList.remove('active');
                overlay.setAttribute('aria-hidden', 'true');
            }
            toggleBtn?.setAttribute('aria-expanded', 'false');
            mobileToggleBtn?.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            
            if (window.innerWidth <= 768) {
                mobileToggleBtn?.focus();
            } else {
                toggleBtn?.focus();
            }
        }
    }

    function handleToggleClick() {
        if (window.innerWidth <= 1024) {
            // Tablet & Mobile logic
            const isOpen = sidebar.classList.contains('drawer-open');
            if (isOpen) {
                closeSidebar();
            } else {
                sidebar.classList.add('drawer-open');
                sidebar.classList.remove('collapsed');
                if (overlay) {
                    overlay.classList.add('active');
                    overlay.setAttribute('aria-hidden', 'false');
                }
                toggleBtn?.setAttribute('aria-expanded', 'true');
                mobileToggleBtn?.setAttribute('aria-expanded', 'true');
                document.body.style.overflow = 'hidden';
            }
        } else {
            // Desktop logic
            const isCollapsed = sidebar.classList.toggle('collapsed');
            toggleBtn?.setAttribute('aria-expanded', !isCollapsed);
        }
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', handleToggleClick);
    }
    
    if (mobileToggleBtn) {
        mobileToggleBtn.addEventListener('click', handleToggleClick);
    }

    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                closeSidebar();
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (window.innerWidth <= 1024 && sidebar.classList.contains('drawer-open')) {
            if (e.key === 'Escape') {
                closeSidebar();
            } else if (e.key === 'Tab') {
                // Focus Trapping
                const focusable = sidebar.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])');
                if (focusable.length > 0) {
                    const first = focusable[0];
                    const last = focusable[focusable.length - 1];
                    if (e.shiftKey && document.activeElement === first) {
                        last.focus();
                        e.preventDefault();
                    } else if (!e.shiftKey && document.activeElement === last) {
                        first.focus();
                        e.preventDefault();
                    }
                }
            }
        }
    });

    // Responsive State Cleanup
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) {
            // Clean up mobile/tablet state when returning to desktop
            sidebar.classList.remove('drawer-open');
            if (overlay) {
                overlay.classList.remove('active');
                overlay.setAttribute('aria-hidden', 'true');
            }
            document.body.style.overflow = '';
            
            // Sync aria-expanded with desktop state
            const isCollapsed = sidebar.classList.contains('collapsed');
            toggleBtn?.setAttribute('aria-expanded', !isCollapsed);
            mobileToggleBtn?.setAttribute('aria-expanded', 'false');
        } else {
            // Sync aria-expanded with drawer state on mobile/tablet
            const isOpen = sidebar.classList.contains('drawer-open');
            toggleBtn?.setAttribute('aria-expanded', !!isOpen);
            mobileToggleBtn?.setAttribute('aria-expanded', !!isOpen);
        }
    });
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
