// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Tom F <https://github.com/tomtom215>

/**
 * Rource - Data Loading & Legend Handlers
 *
 * Handles the post-data-loaded workflow: legend updates, author lists,
 * timeline markers, and view-state branching (analytics vs viz).
 */

import { getRource } from './state.js';
import { getElement, getAllElements } from './dom.js';
import { safeWasmCall } from './wasm-api.js';
import {
    updatePlaybackUI, resetTimelineDateLabels
} from './animation.js';
import { parseCommits } from './data-loader.js';
import { generateTimelineTicks } from './timeline-markers.js';
import { enableFontSizeControls, updateFontSizeUI } from './features/font-size.js';
import { maybeShowFirstTimeHelp } from './features/help.js';
import { initLiveLegend, resetLegends } from './features/live-legend.js';
import { updateImmersiveStats } from './features/immersive-mode.js';
import { getCurrentView } from './features/view-manager.js';
import { devConsole } from './telemetry.js';

// Parsed commits for tooltip display
let parsedCommits = [];

/**
 * Returns the parsed commits array (for hover tooltip usage).
 * @returns {Array} Parsed commit entries
 */
export function getParsedCommits() {
    return parsedCommits;
}

/**
 * Handles data loaded event.
 * @param {string} content - Loaded log content
 * @param {Object} stats - Data statistics
 * @param {string} [format='custom'] - Log format: 'custom' or 'git'
 */
export function handleDataLoaded(content, stats, format = 'custom') {
    const elements = getAllElements();

    resetTimelineDateLabels();

    parsedCommits = parseCommits(content);

    if (elements.showcaseCommits) elements.showcaseCommits.textContent = stats.commits.toLocaleString();
    if (elements.showcaseFiles) elements.showcaseFiles.textContent = stats.files.toLocaleString();
    if (elements.showcaseAuthors) elements.showcaseAuthors.textContent = stats.authors.size.toLocaleString();

    // Frame-accurate panels. The former updateLegend(content) /
    // updateAuthorsLegend() pair summarised the entire log once, so the
    // panels showed the repository's end state from the first frame onward.
    // live-legend polls the scene instead; clear first so no row survives
    // from the previously loaded repository.
    resetLegends();
    initLiveLegend();

    enableFontSizeControls();
    updateFontSizeUI();
    updateImmersiveStats();
    updateTimelineMarkers(content);

    if (elements.authorsPanel) {
        elements.authorsPanel.classList.remove('hidden');
        elements.authorsPanel.classList.remove('collapsed');
        if (elements.authorsToggle) {
            elements.authorsToggle.setAttribute('aria-expanded', 'true');
        }
    }

    if (elements.legendPanel) {
        elements.legendPanel.classList.remove('collapsed');
        if (elements.legendToggle) {
            elements.legendToggle.setAttribute('aria-expanded', 'true');
        }
    }

    if (getCurrentView() === 'analytics') {
    } else {
        const rource = getRource();
        if (rource) {
            safeWasmCall('play', () => rource.play(), undefined);
            updatePlaybackUI();
        }
        maybeShowFirstTimeHelp();
    }
}

/**
 * Updates timeline markers for significant commits.
 * @param {string} content - Log content (unused, timestamps come from WASM)
 */
function updateTimelineMarkers(content) {
    generateTimelineTicks();
}
