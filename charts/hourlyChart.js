/**
 * Aether Weather - Hourly Chart Module
 * 
 * Encapsulates the Chart.js hourly chart: initialization, updates,
 * custom tooltip, and interactive crosshair plugin.
 * 
 * Imports the store directly for tooltip data access.
 * This is an intentional design decision — the tooltip callback
 * needs live state to render metric values for the hovered data point.
 */

import { store } from '../data/store.js';

// ============================================================
// CHART STATE
// ============================================================
let hourlyChartInstance = null;
let hourlyChartGradient = null;

// ============================================================
// CUSTOM TOOLTIP
// ============================================================
let tooltipNodes = null;

function initTooltip() {
    if (tooltipNodes) return;
    const tooltipEl = document.getElementById('chart-tooltip');
    if (!tooltipEl) return;
    
    tooltipNodes = {
        root: tooltipEl,
        icon: tooltipEl.querySelector('.tooltip-icon'),
        condition: tooltipEl.querySelector('.tooltip-condition'),
        time: tooltipEl.querySelector('.tooltip-time'),
        metrics: {
            temp: {
                wrapper: tooltipEl.querySelector('.tooltip-metric[data-type="temp"]'),
                value: tooltipEl.querySelector('.tooltip-metric[data-type="temp"] .metric-value')
            },
            feelsLike: {
                wrapper: tooltipEl.querySelector('.tooltip-metric[data-type="feelsLike"]'),
                value: tooltipEl.querySelector('.tooltip-metric[data-type="feelsLike"] .metric-value')
            },
            rainChance: {
                wrapper: tooltipEl.querySelector('.tooltip-metric[data-type="rainChance"]'),
                value: tooltipEl.querySelector('.tooltip-metric[data-type="rainChance"] .metric-value')
            },
            windSpeed: {
                wrapper: tooltipEl.querySelector('.tooltip-metric[data-type="windSpeed"]'),
                value: tooltipEl.querySelector('.tooltip-metric[data-type="windSpeed"] .metric-value')
            }
        }
    };
}

const getConditionFromIcon = (icon) => {
    const map = {
        'clear_day': 'Sunny',
        'clear_night': 'Clear',
        'partly_cloudy_day': 'Partly Cloudy',
        'partly_cloudy_night': 'Partly Cloudy',
        'cloudy': 'Cloudy',
        'rain': 'Rain',
        'snow': 'Snow',
        'thunderstorm': 'Thunderstorm',
        'fog': 'Fog',
        'water_drop': 'Rain'
    };
    return map[icon] || 'Cloudy';
};

const externalTooltipHandler = (context) => {
    initTooltip();
    if (!tooltipNodes) return;

    const { chart, tooltip } = context;

    if (tooltip.opacity === 0) {
        tooltipNodes.root.classList.remove('visible');
        return;
    }

    const dataIndex = tooltip.dataPoints[0].dataIndex;
    const state = store.getState();
    const hourlyData = state.hourly && state.hourly[dataIndex];
    const selectedMetric = state.ui.selectedHourlyMetric;

    if (hourlyData) {
        tooltipNodes.icon.textContent = hourlyData.icon || 'cloud';
        tooltipNodes.condition.textContent = getConditionFromIcon(hourlyData.icon);

        let timeLabel = hourlyData.time || '--:--';
        if (timeLabel.includes(':')) {
            const [hr] = timeLabel.split(':');
            const dateObj = new Date();
            dateObj.setHours(parseInt(hr, 10), 0, 0);
            if (!isNaN(dateObj.getTime())) {
                timeLabel = dateObj.toLocaleTimeString('en-US', { hour: 'numeric' });
            }
        }
        tooltipNodes.time.textContent = timeLabel;

        tooltipNodes.metrics.temp.value.textContent = Number.isFinite(hourlyData.temperature) ? `${Math.round(hourlyData.temperature)}°` : '--°';
        const feelsLikeVal = Number.isFinite(hourlyData.feelsLike) ? hourlyData.feelsLike : hourlyData.temperature;
        tooltipNodes.metrics.feelsLike.value.textContent = Number.isFinite(feelsLikeVal) ? `${Math.round(feelsLikeVal)}°` : '--°';
        tooltipNodes.metrics.rainChance.value.textContent = Number.isFinite(hourlyData.rainChance) ? `${hourlyData.rainChance}%` : '--%';
        tooltipNodes.metrics.windSpeed.value.textContent = Number.isFinite(hourlyData.windSpeed) ? `${Math.round(hourlyData.windSpeed)} km/h` : '-- km/h';

        Object.values(tooltipNodes.metrics).forEach(m => m.wrapper.classList.remove('primary'));
        
        let primaryMetricType = 'temp';
        if (selectedMetric === 'precipitation') primaryMetricType = 'rainChance';
        if (selectedMetric === 'wind') primaryMetricType = 'windSpeed';

        tooltipNodes.metrics[primaryMetricType].wrapper.classList.add('primary');
        
        tooltipNodes.metrics.temp.wrapper.style.order = primaryMetricType === 'temp' ? -1 : 1;
        tooltipNodes.metrics.rainChance.wrapper.style.order = primaryMetricType === 'rainChance' ? -1 : 2;
        tooltipNodes.metrics.windSpeed.wrapper.style.order = primaryMetricType === 'windSpeed' ? -1 : 3;
        tooltipNodes.metrics.feelsLike.wrapper.style.order = 4;
    }

    const canvasRect = chart.canvas.getBoundingClientRect();
    
    let left = canvasRect.left + tooltip.caretX;
    let top = canvasRect.top + tooltip.caretY - 10;

    const tooltipHeight = tooltipNodes.root.offsetHeight || 160;
    const tooltipWidth = tooltipNodes.root.offsetWidth || 200;

    top -= tooltipHeight;

    const viewportWidth = window.innerWidth;
    
    if (left < tooltipWidth / 2 + 10) {
        left = tooltipWidth / 2 + 10;
    } else if (left + tooltipWidth / 2 > viewportWidth - 10) {
        left = viewportWidth - tooltipWidth / 2 - 10;
    }

    if (top < 10) {
        top = canvasRect.top + tooltip.caretY + 20;
    }

    tooltipNodes.root.style.left = `${left}px`;
    tooltipNodes.root.style.top = `${top}px`;
    
    tooltipNodes.root.classList.add('visible');
};

// ============================================================
// INTERACTIVE CROSSHAIR PLUGIN
// ============================================================
const interactiveCrosshairPlugin = {
    id: 'interactiveCrosshair',
    afterEvent(chart, args) {
        const { event } = args;
        const elements = chart.getElementsAtEventForMode(event, 'index', { intersect: false }, true);
        
        if (event.type === 'mousemove' && elements && elements.length > 0) {
            const activeIndex = elements[0].index;
            
            if (chart.pluginActiveIndex !== activeIndex) {
                const timelineItems = document.querySelectorAll('#hourly-forecast-container .hourly-item');
                
                if (chart.pluginActiveIndex !== undefined && timelineItems[chart.pluginActiveIndex]) {
                    timelineItems[chart.pluginActiveIndex].classList.remove('active');
                }
                
                if (timelineItems[activeIndex]) {
                    timelineItems[activeIndex].classList.add('active');
                }
                
                chart.pluginActiveIndex = activeIndex;
                chart.isHovering = true;
            }
        } else if (event.type === 'mouseout') {
            if (chart.pluginActiveIndex !== undefined) {
                const timelineItems = document.querySelectorAll('#hourly-forecast-container .hourly-item');
                if (timelineItems[chart.pluginActiveIndex]) {
                    timelineItems[chart.pluginActiveIndex].classList.remove('active');
                }
            }
            chart.pluginActiveIndex = undefined;
            chart.isHovering = false;
        }
    },
    beforeDatasetsDraw(chart) {
        if (!chart.isHovering || chart.pluginActiveIndex === undefined) return;

        const ctx = chart.ctx;
        const tooltip = chart.tooltip;
        
        const x = tooltip && tooltip.opacity > 0 ? tooltip.caretX : chart.getDatasetMeta(0).data[chart.pluginActiveIndex].x;
        
        const topY = chart.chartArea.top;
        const bottomY = chart.chartArea.bottom;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.lineTo(x, bottomY);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();
        ctx.restore();
        
        // Dim native dataset
        ctx.globalAlpha = 0.5;
    },
    afterDatasetsDraw(chart) {
        if (!chart.isHovering || chart.pluginActiveIndex === undefined) return;
        
        const ctx = chart.ctx;
        ctx.globalAlpha = 1.0; // Restore alpha
        
        const tooltip = chart.tooltip;
        const x = tooltip && tooltip.opacity > 0 ? tooltip.caretX : chart.getDatasetMeta(0).data[chart.pluginActiveIndex].x;
        const y = tooltip && tooltip.opacity > 0 ? tooltip.caretY : chart.getDatasetMeta(0).data[chart.pluginActiveIndex].y;
        
        const borderColor = chart.data.datasets[0].borderColor || '#00d4ff';
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = borderColor;
        ctx.shadowBlur = 12;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.lineWidth = 2;
        ctx.strokeStyle = borderColor;
        ctx.stroke();
        ctx.restore();
    },
    afterDraw(chart) {
        if (!chart.isHovering || chart.pluginActiveIndex === undefined) return;
        
        const ctx = chart.ctx;
        const tooltip = chart.tooltip;
        const x = tooltip && tooltip.opacity > 0 ? tooltip.caretX : chart.getDatasetMeta(0).data[chart.pluginActiveIndex].x;
        const bottomY = chart.chartArea.bottom;
        
        const label = chart.data.labels[chart.pluginActiveIndex];
        
        ctx.save();
        ctx.font = '12px system-ui, -apple-system, sans-serif';
        const textWidth = ctx.measureText(label).width;
        const pillWidth = textWidth + 16;
        const pillHeight = 24;
        
        let pillX = x - pillWidth / 2;
        pillX = Math.max(chart.chartArea.left, Math.min(pillX, chart.chartArea.right - pillWidth));
        
        ctx.fillStyle = 'rgba(23, 31, 51, 0.8)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
        
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(pillX, bottomY - pillHeight, pillWidth, pillHeight, 12);
        } else {
            // Fallback for older browsers
            ctx.rect(pillX, bottomY - pillHeight, pillWidth, pillHeight);
        }
        ctx.fill();
        
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, pillX + pillWidth / 2, bottomY - pillHeight / 2);
        ctx.restore();
    }
};

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Creates or updates the hourly chart with the given data and metric.
 * @param {Array} hourlyData - Array of hourly weather data objects.
 * @param {string} selectedMetric - The currently selected metric ('temp', 'precipitation', 'wind').
 */
export function updateHourlyChart(hourlyData, selectedMetric) {
    if (!hourlyData || hourlyData.length === 0) return;
    
    // Ensure Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js is not loaded yet.');
        return;
    }

    const canvas = document.getElementById('hourly-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Cache the gradient
    if (!hourlyChartGradient) {
        hourlyChartGradient = ctx.createLinearGradient(0, 0, 0, 300);
        hourlyChartGradient.addColorStop(0, 'rgba(0, 212, 255, 0.4)');
        hourlyChartGradient.addColorStop(1, 'rgba(0, 212, 255, 0.0)');
    }

    // Prepare Data
    const labels = hourlyData.map(h => {
        let timeLabel = h.time || '--:--';
        if (timeLabel.includes(':')) {
            const [hr] = timeLabel.split(':');
            const dateObj = new Date();
            dateObj.setHours(parseInt(hr, 10), 0, 0);
            if (!isNaN(dateObj.getTime())) {
                return dateObj.toLocaleTimeString('en-US', { hour: 'numeric' });
            }
        }
        return timeLabel;
    });

    let data = [];
    let chartType = 'line';
    let borderColor = '#00d4ff';
    let backgroundColor = hourlyChartGradient;
    let tooltipSuffix = '';
    let tooltipTitle = '';
    let yAxisMin = undefined;
    let yAxisMax = undefined;
    let tension = 0.4;
    let borderWidth = 3;
    let pointRadius = 4;
    let pointHoverRadius = 6;
    let fill = true;

    if (selectedMetric === 'temp') {
        data = hourlyData.map(h => Number.isFinite(h.temperature) ? h.temperature : null);
        tooltipSuffix = '°';
        tooltipTitle = 'Temperature';
    } else if (selectedMetric === 'precipitation') {
        data = hourlyData.map(h => Number.isFinite(h.rainChance) ? h.rainChance : null);
        chartType = 'bar';
        backgroundColor = 'rgba(0, 150, 255, 0.6)';
        borderColor = 'rgba(0, 150, 255, 1)';
        borderWidth = 1;
        yAxisMin = 0;
        yAxisMax = 100;
        tooltipSuffix = '%';
        tooltipTitle = 'Rain Chance';
        fill = false;
    } else if (selectedMetric === 'wind') {
        data = hourlyData.map(h => Number.isFinite(h.windSpeed) ? h.windSpeed : null);
        borderColor = '#aaaaff';
        // Subtly different gradient for wind if desired, but we can reuse a simple fill
        backgroundColor = 'rgba(170, 170, 255, 0.2)'; 
        tooltipSuffix = ' km/h';
        tooltipTitle = 'Wind Speed';
        fill = true;
    }

    if (!hourlyChartInstance) {
        // Initialize once
        hourlyChartInstance = new Chart(ctx, {
            type: chartType,
            data: {
                labels: labels,
                datasets: [{
                    label: tooltipTitle,
                    data: data,
                    borderColor: borderColor,
                    backgroundColor: backgroundColor,
                    borderWidth: borderWidth,
                    tension: tension,
                    pointRadius: chartType === 'line' ? pointRadius : 0,
                    pointHoverRadius: chartType === 'line' ? pointHoverRadius : 0,
                    fill: fill,
                    borderRadius: chartType === 'bar' ? 4 : 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: false,
                        external: externalTooltipHandler,
                        animation: {
                            duration: 150
                        }
                    }
                },
                hover: {
                    animationDuration: 150
                },
                animation: {
                    duration: 400 // initial
                },
                scales: {
                    x: {
                        grid: { display: false, drawBorder: false },
                        ticks: { display: false }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)', drawBorder: false },
                        ticks: { color: 'rgba(255, 255, 255, 0.5)' },
                        min: yAxisMin,
                        max: yAxisMax
                    }
                },
                plugins: [interactiveCrosshairPlugin]
            },
            plugins: [interactiveCrosshairPlugin]
        });
    } else {
        // Update efficiently
        hourlyChartInstance.config.type = chartType;
        hourlyChartInstance.data.labels = labels;
        const dataset = hourlyChartInstance.data.datasets[0];
        
        dataset.label = tooltipTitle;
        dataset.data = data;
        dataset.borderColor = borderColor;
        dataset.backgroundColor = backgroundColor;
        dataset.borderWidth = borderWidth;
        dataset.tension = tension;
        dataset.pointRadius = chartType === 'line' ? pointRadius : 0;
        dataset.pointHoverRadius = chartType === 'line' ? pointHoverRadius : 0;
        dataset.fill = fill;
        dataset.borderRadius = chartType === 'bar' ? 4 : 0;

        hourlyChartInstance.options.scales.y.min = yAxisMin;
        hourlyChartInstance.options.scales.y.max = yAxisMax;
        
        hourlyChartInstance.update();
    }
}

/**
 * Triggers a resize + silent update on the chart instance.
 * Called by the controller when the layout changes (e.g. sidebar toggle).
 */
export function resizeHourlyChart() {
    if (hourlyChartInstance) {
        hourlyChartInstance.resize();
        hourlyChartInstance.update('none');
    }
}
