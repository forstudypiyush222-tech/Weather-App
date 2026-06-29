/**
 * Aether Weather - Search Dropdown View
 * 
 * Renders the autocomplete dropdown, manages keyboard navigation
 * and highlight state. Passive view — emits callbacks, does not
 * import the store or services.
 */

/**
 * @typedef {object} SearchDropdownState
 * @property {HTMLElement|null} dropdown - The dropdown DOM element.
 * @property {number} highlightedIndex - Currently highlighted item index.
 * @property {Array} currentResults - The current autocomplete results.
 * @property {string} originalQuery - The query before keyboard navigation.
 */

/** @type {SearchDropdownState} */
const state = {
    dropdown: null,
    highlightedIndex: -1,
    currentResults: [],
    originalQuery: ''
};

/**
 * Updates the original query value (used to restore on Escape).
 * @param {string} query
 */
export function setOriginalQuery(query) {
    state.originalQuery = query;
}

/**
 * Returns the currently highlighted result, or null.
 * @returns {{name: string, country: string}|null}
 */
export function getHighlightedResult() {
    if (state.highlightedIndex >= 0 && state.highlightedIndex < state.currentResults.length) {
        return state.currentResults[state.highlightedIndex];
    }
    return null;
}

/**
 * Returns whether the dropdown is currently open.
 * @returns {boolean}
 */
export function isOpen() {
    return state.dropdown !== null;
}

/**
 * Updates the highlighted index and syncs the DOM.
 * @param {number} index - The new index to highlight.
 * @param {HTMLInputElement|null} searchInput - The search input element.
 */
export function updateHighlight(index, searchInput) {
    if (!state.dropdown) return;

    state.highlightedIndex = index;
    const items = state.dropdown.querySelectorAll('.search-dropdown-item');

    if (index === -1) {
        items.forEach(item => {
            item.classList.remove('highlighted');
            item.setAttribute('aria-selected', 'false');
        });
        if (searchInput) {
            searchInput.removeAttribute('aria-activedescendant');
            searchInput.value = state.originalQuery;
        }
        return;
    }

    items.forEach((item, i) => {
        if (i === index) {
            item.classList.add('highlighted');
            item.setAttribute('aria-selected', 'true');
            item.scrollIntoView({ block: 'nearest' });
            if (searchInput) {
                searchInput.setAttribute('aria-activedescendant', item.id);
                searchInput.value = state.currentResults[i].name;
            }
        } else {
            item.classList.remove('highlighted');
            item.setAttribute('aria-selected', 'false');
        }
    });
}

/**
 * Moves the highlight up or down by one step, wrapping at boundaries.
 * @param {'up'|'down'} direction
 * @param {HTMLInputElement|null} searchInput
 */
export function moveHighlight(direction, searchInput) {
    const len = state.currentResults.length;
    if (len === 0) return;

    let next;
    if (direction === 'down') {
        next = state.highlightedIndex + 1;
        if (next >= len) next = 0;
    } else {
        next = state.highlightedIndex - 1;
        if (next < 0) next = len - 1;
    }
    updateHighlight(next, searchInput);
}

/**
 * Renders the autocomplete dropdown.
 * @param {Array<{name: string, country: string}>} results - Search results.
 * @param {HTMLElement} container - The parent element to append to.
 * @param {HTMLInputElement|null} searchInput - The search input element.
 * @param {function(string): void} onSelect - Callback when a city is selected.
 */
export function renderDropdown(results, container, searchInput, onSelect) {
    closeDropdown(searchInput);
    if (!results || results.length === 0) return;
    if (!container) return;

    state.currentResults = results;
    state.highlightedIndex = -1;

    state.dropdown = document.createElement('div');
    state.dropdown.className = 'glass-panel custom-scrollbar search-dropdown';
    state.dropdown.id = 'search-dropdown-list';
    state.dropdown.setAttribute('role', 'listbox');

    if (searchInput) searchInput.setAttribute('aria-expanded', 'true');

    results.forEach((city, index) => {
        const item = document.createElement('div');
        item.className = 'search-dropdown-item';
        item.id = `search-item-${index}`;
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', 'false');
        item.textContent = `${city.name}, ${city.country}`;

        item.addEventListener('mouseenter', () => {
            updateHighlight(index, searchInput);
        });

        item.addEventListener('click', () => {
            closeDropdown(searchInput);
            onSelect(city.name);
        });

        state.dropdown.appendChild(item);
    });

    container.appendChild(state.dropdown);
}

/**
 * Closes the dropdown and resets internal state.
 * @param {HTMLInputElement|null} searchInput - The search input element.
 */
export function closeDropdown(searchInput) {
    if (state.dropdown) {
        state.dropdown.remove();
        state.dropdown = null;
    }
    state.highlightedIndex = -1;
    state.currentResults = [];
    if (searchInput) {
        searchInput.setAttribute('aria-expanded', 'false');
        searchInput.removeAttribute('aria-activedescendant');
    }
}

/**
 * Restores the search input to the original query (used on Escape).
 * @param {HTMLInputElement|null} searchInput
 */
export function restoreOriginalQuery(searchInput) {
    if (searchInput) {
        searchInput.value = state.originalQuery;
    }
}
