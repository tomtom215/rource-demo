// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Tom F <https://github.com/tomtom215>

/**
 * Rource - Fit View Control
 *
 * Refits the camera to the whole scene and resumes auto-fit.
 *
 * Zooming or panning deliberately turns auto-fit off, so the viewer keeps the
 * framing they chose rather than having the camera pull away underneath them.
 * Nothing turned it back on, though, and the only route to a refit was the `R`
 * key — unreachable on a touch device. A visitor who pinched once on a phone
 * had no way to recover, and watched the tree grow past the edges of the
 * screen for the rest of the session.
 */

import { getRource } from '../state.js';
import { safeWasmVoid } from '../wasm-api.js';
import { addManagedEventListener } from '../state.js';
import { showToast } from '../toast.js';

/**
 * Refits the camera to all content and re-enables auto-fit.
 * @param {boolean} [announce=false] - Show a toast confirming the action.
 */
export function fitViewToContent(announce = false) {
    const rource = getRource();
    if (!rource) return;

    safeWasmVoid('resetCamera', () => rource.resetCamera());

    if (announce) {
        showToast('View fitted — following the visualization again', 'success');
    }
}

/**
 * Wires the desktop and mobile fit-view buttons.
 */
export function initFitView() {
    for (const id of ['btn-fit-view', 'mobile-fit-view-btn']) {
        const btn = document.getElementById(id);
        if (btn) {
            addManagedEventListener(btn, 'click', () => fitViewToContent(true));
        }
    }
}
