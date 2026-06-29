# Aether Weather: Responsive Design Strategy

## Responsive Design Principles
* Preserve desktop identity.
* Preserve interaction patterns.
* Preserve component hierarchy.
* Adapt layout, not design.
* Mobile should feel like the same application.
* Avoid introducing new UX patterns unless absolutely necessary.
* Prefer CSS adaptations over JavaScript.
* HTML changes should remain minimal.
* JavaScript changes only when responsive behavior genuinely requires them.

## Desktop Preservation Rules
* Desktop UI is the source of truth.
* Desktop layout must remain visually identical.
* No spacing regressions.
* No visual redesign.
* No animation regressions.
* No color changes.
* No glassmorphism changes.
* No shadow changes.
* No border-radius changes.

## Implementation Rules
Every responsive phase must follow this sequence:
1. Audit existing implementation.
2. Explain implementation plan.
3. Identify risks.
4. Implement only the approved phase.
5. Summarize modified files.
6. Provide manual verification checklist.
7. Stop and wait for approval.

## 1. Daily Forecast
### Desktop
- **Layout:** Horizontal forecast cards residing in the secondary (right) column of the middle dashboard grid.
- **Card Sizing:** Cards maintain their designated widths and heights.
- **Interactions:** The container scrolls horizontally to display all forecast days.

### Tablet & Mobile
- **Layout:** The grid collapses to a single column. The Daily Forecast spans 100% width.
- **Card Architecture:** The horizontal forecast cards and the complete forecast dataset must be strictly preserved. The interaction model must remain horizontal scrolling.
- **Card Sizing & Spacing:** Reduce card width and internal spacing proportionally on smaller screens to maximize the number of visible cards before scrolling is necessary.
- **Interactions:** Native touch interaction (swipe to scroll) must be fully supported via the CSS overflow container.
- **Safe-Area:** Apply safe-area insets to padding to protect forecast cards from display cutouts, particularly in landscape mode.

## 2. Navigation (Sidebar)

### Desktop
* Existing sidebar remains visually identical.
* Existing animations remain unchanged.
* Sidebar continues pushing content exactly as before.

### Tablet
* Sidebar starts collapsed by default.
* Expands as a **fixed overlay**.
* Must **never push page content**.
* A blurred backdrop appears behind the sidebar.
* Desktop collapse animation remains visually consistent where applicable.

### Mobile
* Sidebar becomes a left slide-in drawer.
* Opens only from the hamburger button.
* Uses the exact same navigation hierarchy as Desktop.
* No bottom navigation.
* No redesign of navigation items.

### Drawer Close Rules
The drawer must close when:
* User clicks outside the drawer.
* User selects a navigation item.
* User presses the Escape key.
These behaviors are permanent architecture requirements.

### Accessibility Requirements
These are permanent responsive rules:
* `aria-expanded` updates dynamically.
* `aria-hidden` updates dynamically.
* `aria-controls` bindings remain intact.
* Keyboard navigation is fully supported.
* Escape key support to close overlays/drawers.
* Focus returns to the toggle button after closing.
* Focus trapping inside the drawer while open on Tablet/Mobile.
* Respect `prefers-reduced-motion`.

### State Architecture
The sidebar state model separates logical states from single CSS classes. The conceptual states are:
* **Desktop collapsed state:** Controls width and layout flow.
* **Tablet/Mobile drawer open state:** Controls sliding/visibility.
* **Overlay visible state:** Controls the backdrop independently.
Desktop collapse logic and Mobile drawer logic are independent behaviors, even if they share some internal implementation. Do not rely solely on a single `.collapsed` class for all environments.

### Overlay Rules
* Tablet/Mobile sidebar uses **position: fixed**.
* Overlay sits above application content.
* Overlay never changes Desktop layout.
* Overlay never pushes content.
* Overlay only exists on Tablet and Mobile.

### Body Scroll Policy
* Background scrolling is disabled ONLY while the drawer is open on Tablet/Mobile.
* Desktop scrolling behavior remains completely unchanged.
* Scroll lock must be removed immediately after closing the drawer.

### Responsive State Cleanup
When transitioning from Tablet/Mobile back to Desktop across a breakpoint:
* Any temporary drawer state must be cleared.
* Any overlay state must be removed.
* Any temporary scroll lock must be removed.
* Any temporary accessibility state associated with the drawer must be reset.
* Desktop sidebar behavior must always resume from a clean, valid state.
* No stale responsive classes or temporary UI states may persist after crossing breakpoints.

### Animation Policy
* Desktop animations must remain untouched.
* Tablet and Mobile may introduce additional animations without affecting Desktop.
* Desktop width animation and Mobile drawer animation are independent.

## 3. Top Navigation & Search
### Desktop
- **Structure:** Left (empty/logo), Center (Search), Right (Profile).
- **Search & Geolocation:** Existing centered search box. The current-location/geolocation button must remain visually inside the search bar area. Its size and alignment must scale responsively with the search bar, maintaining its functional relationship without drifting outside the input container.
- **Profile:** Displays both avatar and text label.

### Tablet
- **Structure:** Left (Hamburger), Center (Search), Right (Profile).
- **Search & Geolocation:** Centered search box with responsive width naturally scaling between left and right elements. The geolocation button remains visually embedded inside the search box, maintaining proportional sizing.
- **Profile:** Displays both avatar and text label.

### Mobile
- **Structure (Flex-Wrap):**
- **Row 1:** Left (Hamburger), Spacer, Right (Profile).
- **Row 2:** Search container (Full width).
- **Search & Geolocation:** Full-width search field positioned beneath the top navigation. The geolocation button must remain aligned with and visually inside the search field container. It must not become a separate oversized control. Avoid modal-based search.
- **Profile:** Text label is visually hidden to save space, showing only the avatar.

### Search Transition Stability
During responsive resizing, especially between approximately **740px–820px**, the search container must transition smoothly between the Tablet single-row layout and the Mobile two-row layout. The implementation must prevent premature wrapping, layout jitter, flickering, or horizontal overflow throughout this breakpoint range.

## 4. Hero Section
### Desktop
- **Layout:** Occupies the primary (left) column of the top dashboard grid.
- **Content:** Vertically stacked with temperature, conditions, location, and a bottom row of wrapping mini-cards.

### Tablet
- **Layout:** Dashboard grid collapses to a single column. The Hero section spans the full width.
- **Content:** Structure remains identical to Desktop. Mini-cards wrap naturally if constrained.

### Mobile
- **Layout:** Spans full width of the mobile viewport.
- **Spacing:** Reduces vertical padding and gaps to maximize space for content above the fold.
- **Typography:** The massive temperature text scales down proportionally to prevent overflow and wrapping issues.
- **Mini-cards:** Flex wrapping ensures cards drop to subsequent rows gracefully without overflowing horizontally.

## 5. Today's Summary
### Desktop
- **Layout:** Resides in the secondary (right) column of the top dashboard grid.
- **Card Height:** Matches the vertical height of the adjacent Hero column (via `height: 100%` and CSS grid stretch mechanics).
- **Internal Spacing:** Features generous padding and vertical margins to create a spacious list of current metrics.

### Tablet & Mobile
- **Layout:** The dashboard grid collapses to a single column, positioning the Summary card cleanly beneath the Hero section.
- **Card Height:** Must become strictly content-driven (`height: auto`). Any fixed height dependencies that forced it to match the Hero section must be overridden to prevent clipping or empty space.
- **Spacing:** Internal padding and vertical margins condense proportionally on smaller viewports to maximize above-the-fold content.
- **Icon Sizing:** Fixed icon wrappers (e.g., 4rem heights) should be evaluated; they must remain fixed on Desktop but may adapt if necessary on Mobile.

## 6. Hourly Forecast
### Desktop
- **Layout:** Resides in the primary (left) column of the middle dashboard grid.
- **Card Height:** Flexible container but establishes the baseline height for the middle grid row.
- **Chart:** The canvas and timeline scroll horizontally to accommodate 24 hours of data. The container uses `overflow-x: auto`. The chart layout adapts to the container height via `clamp()` logic.
- **Interactions:** The tooltip and crosshair track mouse movement accurately across the horizontally scrolled canvas.

### Tablet & Mobile
- **Layout:** The grid collapses to a single column. The Hourly card spans 100% width.
- **Card Height:** The container should use `height: auto` to allow the chart and timeline to govern the height without leaving unnecessary whitespace.
- **Chart & Scrolling:** Horizontal scrolling must be preserved via `overflow-x: auto`. Native touch interaction (swipe to scroll) must be fully supported by the CSS overflow container. The canvas must maintain sufficient minimum width to ensure hour labels do not overlap.
- **Spacing:** Inner padding condenses to maximize the chart's visible area, applying safe-area insets where appropriate.

## 7. Metrics Strip
### Desktop
- **Layout:** Existing horizontal strip of four metric cards (Feels Like, Humidity, Wind, Pressure).
- **Data Integrity:** Fully displays all metric labels, icons, values, and units.
- **Interaction:** Hover effects apply to the strip.

### Tablet & Mobile
- **Layout:** Retains horizontal orientation. Metric items become more compact by slightly reducing gaps and padding, preserving the original desktop visual identity without converting to a multi-row grid or list.
- **Scrolling & Interaction:** Horizontal swipe-to-scroll must be natively supported via `-webkit-overflow-scrolling: touch;`. Keyboard focusability must be preserved or introduced to ensure the scrolling container remains accessible. Overflow containment must prevent the page from shifting horizontally.
- **Data Preservation:** Responsive adaptations must preserve every metric, icon, label, value, and unit.
- **Safe-Area Compatibility:** Safe-area insets should be applied to the scrolling container to protect the leading and trailing metrics from display cutouts, without shrinking the visible viewport area unnaturally.

## 8. Air Quality (AQI)
### Desktop
- **Layout:** Resides in the secondary (right) column of the middle dashboard grid. Features a circular SVG gauge alongside AQI status text and a health advisory section below.
- **Gauge:** Fixed 7rem container preserving perfect SVG circle proportions.
- **Data Integrity:** Fully displays primary pollutant and health advisory text.

### Tablet & Mobile
- **Layout:** The grid collapses to a single column, allowing the AQI card to span 100% width.
- **Gauge Integrity:** The AQI gauge must preserve its proportions across all breakpoints. Responsive scaling may reduce its container size proportionally if necessary, but it must never become distorted, stretched, or visually misaligned.
- **Data Preservation:** Responsive adaptations must preserve every AQI value, pollutant metric, and health information text. Layout may adapt spacing or flex wrapping, but information must never be removed or abbreviated solely because of viewport size.
- **Spacing:** Inner padding condenses on Mobile viewports to maximize usable space, applying safe-area insets where necessary.

## 9. Responsive Background Architecture
The application uses the following asset structure:
```text
assets/
└── Background/
    clear-day.webp
    ...
    mobile/
        clear-day.webp
        ...
```
- **Desktop:** Loads `assets/Background/<weather>.webp`
- **Mobile:** Loads `assets/Background/mobile/<weather>.webp`
- **Behavior:** The responsive implementation should only choose which folder to load based on the device category. The existing weather mapping logic must remain untouched.

### Background Switching Policy
* Detect the current device category (Desktop vs. Mobile).
* The background should only change when the viewport crosses the responsive breakpoint (e.g., Desktop → Mobile or Mobile → Desktop).
* Resizing within the same category must not reload the background.

## 10. Card Heights
- **Desktop:** Card heights remain unchanged.
- **Tablet:** Prefer auto-height. Preserve proportional spacing.
- **Mobile:** Cards expand naturally based on content. Avoid fixed heights that introduce overflow. Prevent unnecessary whitespace.

## 11. Overflow Policy
- Responsive implementation must identify and fix the real overflowing element.
- Global overflow clipping must never be used to hide layout problems.
- Overflow clipping may only be applied to intentional decorative elements after verification.

## 12. Breakpoint Consistency
- Breakpoint values must remain centralized.
- Do not duplicate breakpoint values throughout multiple files.
- Responsive implementation should reference a single breakpoint strategy whenever possible.

## Phase R1 Scope
Phase R1 ONLY establishes the responsive foundation. It includes ONLY:
* Breakpoints
* Responsive variables
* Container sizing
* Global layout foundation
* Responsive background switching
* Overflow prevention
* Safe-area support

Explicitly, Phase R1 does NOT modify:
* Sidebar, Navigation, Search, Hero, Summary, Hourly Forecast, Daily Forecast, AQI, Metrics, Typography scaling

## Final Responsive Roadmap
- R1 — Responsive Foundation
- R2 — Sidebar
- R3 — Top Navigation
- R4 — Hero
- R5 — Today's Summary
- R6 — Hourly Forecast
- R7 — Daily Forecast
- R8 — Air Quality
- R9 — Metrics Strip
- R10 — Final Polish
