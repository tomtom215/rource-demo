// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Tom F <https://github.com/tomtom215>

/**
 * Rource - Help Feature
 *
 * Manages the help overlay for first-time users.
 */

import { getElement, getAllElements } from '../dom.js';
import { trapFocus } from '../utils.js';

const HELP_SHOWN_KEY = 'rource_help_shown';

/**
 * Checks if help has been shown before.
 * @returns {boolean} True if help was previously shown
 */
export function hasHelpBeenShown() {
    return localStorage.getItem(HELP_SHOWN_KEY) === 'true';
}

/**
 * Marks help as shown.
 */
export function markHelpShown() {
    localStorage.setItem(HELP_SHOWN_KEY, 'true');
}

/**
 * Shows the help overlay.
 */
export function showHelp() {
    const helpOverlay = getElement('helpOverlay');
    if (helpOverlay) {
        helpOverlay.classList.add('visible');
        // Focus the close button for accessibility
        const closeBtn = helpOverlay.querySelector('.help-close, #help-close');
        if (closeBtn) closeBtn.focus();
    }
}

/**
 * Hides the help overlay.
 */
export function hideHelp() {
    const helpOverlay = getElement('helpOverlay');
    if (helpOverlay) {
        helpOverlay.classList.remove('visible');
        markHelpShown();
    }
}

/**
 * Offers help on a first visit, without blocking the visualization.
 *
 * This used to open the full help modal 500 ms after load. Measured cold-load
 * behaviour showed why that was the wrong call: the canvas had content at
 * 2.3 s and the modal was still covering it at 12 s, so a visitor's entire
 * first impression was several hundred words about files, users and beams
 * while the thing being described ran dimmed and unreadable behind them. For a
 * tool whose premise is that the picture explains itself, that is backwards.
 *
 * The hint points at the help button instead. Same content, one click away,
 * and it removes itself if ignored.
 */
export function maybeShowFirstTimeHelp() {
    if (hasHelpBeenShown()) return;

    const hint = document.getElementById('first-run-hint');
    if (!hint) return;

    const open = document.getElementById('first-run-hint-open');
    const dismiss = document.getElementById('first-run-hint-dismiss');

    let hideTimer = null;
    const close = () => {
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
        hint.classList.remove('visible');
        markHelpShown();
        // Wait out the fade before removing it from the layout entirely.
        setTimeout(() => { hint.hidden = true; }, 300);
    };

    if (open) {
        open.addEventListener('click', () => { close(); showHelp(); }, { once: true });
    }
    if (dismiss) {
        dismiss.addEventListener('click', close, { once: true });
    }

    // Let the visualization establish itself before offering to explain it.
    setTimeout(() => {
        hint.hidden = false;
        // Next frame, so the transition has a start state to animate from.
        requestAnimationFrame(() => hint.classList.add('visible'));
        // Never becomes clutter: it retires on its own.
        hideTimer = setTimeout(close, 14000);
    }, 4000);
}


/**
 * Initializes help feature.
 */
export function initHelp() {
    const elements = getAllElements();
    const { helpBtn, helpOverlay, helpClose, helpGotIt } = elements;

    // Help button opens overlay
    if (helpBtn) {
        helpBtn.addEventListener('click', showHelp);
    }

    // Close button
    if (helpClose) {
        helpClose.addEventListener('click', hideHelp);
    }

    // "Got it" button
    if (helpGotIt) {
        helpGotIt.addEventListener('click', hideHelp);
    }

    // Click outside to close
    if (helpOverlay) {
        helpOverlay.addEventListener('click', (e) => {
            if (e.target === helpOverlay) hideHelp();
        });
    }

    // Keyboard handling
    document.addEventListener('keydown', (e) => {
        // Focus trap when help overlay is visible
        if (e.key === 'Tab' && helpOverlay?.classList.contains('visible')) {
            const helpContent = helpOverlay.querySelector('.help-content');
            if (helpContent) {
                trapFocus(helpContent, e);
            }
        }

        // Ignore if in input field
        if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

        // ? or Shift+/ opens help
        if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
            e.preventDefault();
            showHelp();
        }

        // Escape closes help
        if (e.key === 'Escape' && helpOverlay?.classList.contains('visible')) {
            hideHelp();
        }
    });
}
