/**
 * Aether Weather - DOM Helpers
 * 
 * Shared utility functions for safe DOM text and icon updates.
 * Used by all dashboard view modules.
 */

/**
 * Safely sets the text content of a DOM element.
 * No-op if the element is null/undefined.
 * @param {HTMLElement|null} element
 * @param {string|number} text
 */
export function setText(element, text) {
    if (element) element.textContent = text;
}

/**
 * Safely sets a Material Symbols icon name on a DOM element.
 * No-op if the element is null/undefined.
 * @param {HTMLElement|null} element
 * @param {string} iconName - Material Symbols icon name.
 */
export function setIcon(element, iconName) {
    if (element) element.textContent = iconName;
}
