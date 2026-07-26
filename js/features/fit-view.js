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

    initLoadOwnShortcut();
}

/**
 * Wires the demo landing panel's "Visualize your repository" button.
 *
 * The upload flow already existed but lived behind a collapsed panel and a
 * non-default tab, so the one capability worth advertising — that a private
 * repository can be visualized without anything leaving the browser — was
 * effectively hidden. This jumps straight to it.
 *
 * Present only in the demo build, hence the null check.
 */
function initLoadOwnShortcut() {
    const btn = document.getElementById('btn-demo-load-own');
    if (!btn) return;

    addManagedEventListener(btn, 'click', () => {
        const panel = document.getElementById('panel-manual-load');
        if (!panel) return;

        panel.classList.remove('collapsed');

        // Switch to the Upload File tab. The tab controller keys off
        // data-tab, so clicking the button drives the same code path as the
        // user selecting it.
        const uploadTab = panel.querySelector('.tab-btn[data-tab="upload"]');
        if (uploadTab) uploadTab.click();

        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        const dropZone = document.getElementById('file-drop-zone');
        if (dropZone) {
            dropZone.classList.add('file-drop-zone-highlight');
            setTimeout(() => dropZone.classList.remove('file-drop-zone-highlight'), 1600);
        }
    });
}
