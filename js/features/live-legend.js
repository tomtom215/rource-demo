// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Tom F <https://github.com/tomtom215>

/**
 * Rource - Live Legend
 *
 * Keeps the File Types and Authors panels showing what is on screen right now.
 *
 * These panels used to be built once, in JavaScript, by re-parsing the whole
 * log the moment it loaded — a summary of the entire repository history that
 * then never changed. Six commits into React the canvas held a handful of
 * files while the legend reported 2,791 `.js` files and listed contributors
 * who had not appeared yet, with their lifetime commit totals.
 *
 * The panels now poll the live scene and reconcile in place: rows are matched
 * by key, counts are updated on the existing nodes, and reordering moves nodes
 * rather than rebuilding the list. That keeps scroll position stable, avoids
 * clobbering a row the pointer is hovering, and lets a growing list stay
 * readable while it grows.
 */

import { getRource } from '../state.js';
import { safeWasmCall } from '../wasm-api.js';
import { getElement } from '../dom.js';
import { devConsole } from '../telemetry.js';
import { updateBottomSheetFileTypes, updateBottomSheetAuthors } from './bottom-sheet.js';

/**
 * Poll interval. The panels are a peripheral read-out, not the visualization,
 * so a few updates a second is plenty and leaves the frame budget alone.
 */
const REFRESH_MS = 220;

let timerId = null;
/** @type {Map<string, HTMLElement>} */
const fileTypeRows = new Map();
/** @type {Map<string, HTMLElement>} */
const authorRows = new Map();

/** Escapes text for safe insertion as element text. */
function setText(el, value) {
    if (el.textContent !== value) el.textContent = value;
}

/**
 * Flags a row whose count changed so CSS can pulse it.
 * Removing the class first restarts the animation on consecutive changes.
 */
function pulse(row) {
    row.classList.remove('legend-row-changed');
    // Reading offsetWidth forces a reflow, which is what makes the
    // remove/add pair restart the animation instead of being coalesced.
    void row.offsetWidth;
    row.classList.add('legend-row-changed');
}

/**
 * Reconciles a keyed list of rows into a container, in order.
 *
 * @param {HTMLElement} container - List element
 * @param {Map<string, HTMLElement>} cache - Key to existing row
 * @param {Array<{key: string}>} items - Desired rows, already sorted
 * @param {(item: any) => HTMLElement} create - Builds a row for a new key
 * @param {(row: HTMLElement, item: any) => boolean} update - Updates a row; returns true if a count changed
 */
function reconcile(container, cache, items, create, update) {
    const seen = new Set();

    for (const item of items) {
        seen.add(item.key);
        let row = cache.get(item.key);
        if (row) {
            if (update(row, item)) pulse(row);
        } else {
            row = create(item);
            cache.set(item.key, row);
        }
    }

    // Drop rows that no longer exist (files deleted, or trimmed from the tail).
    for (const [key, row] of cache) {
        if (!seen.has(key)) {
            row.remove();
            cache.delete(key);
        }
    }

    // Reorder by walking the desired sequence and moving anything out of place.
    // Touching only misplaced nodes keeps this cheap and avoids resetting the
    // container's scroll offset, which reappending every row would do.
    let expected = container.firstElementChild;
    for (const item of items) {
        const row = cache.get(item.key);
        if (row !== expected) {
            container.insertBefore(row, expected);
        } else {
            expected = row.nextElementSibling;
        }
    }
}

function buildFileTypeRow(item) {
    const row = document.createElement('div');
    row.className = 'legend-item';
    row.setAttribute('role', 'listitem');

    const swatch = document.createElement('span');
    swatch.className = 'legend-color swatch';
    swatch.style.setProperty('--swatch', item.color);

    // `legend-ext`, not `legend-label`: the stylesheet only ever defined
    // `.legend-ext`, so the previous markup's `.legend-label` was unstyled and
    // its `flex: 1` never applied — which is why the counts sat jammed against
    // the extension instead of aligning down the right edge of the panel.
    const label = document.createElement('span');
    label.className = 'legend-ext';
    label.textContent = `.${item.ext}`;

    const count = document.createElement('span');
    count.className = 'legend-count';
    count.textContent = String(item.count);

    row.append(swatch, label, count);
    return row;
}

function updateFileTypeRow(row, item) {
    const count = row.querySelector('.legend-count');
    const changed = count && count.textContent !== String(item.count);
    if (count) setText(count, String(item.count));
    const swatch = row.querySelector('.legend-color');
    if (swatch && swatch.style.getPropertyValue('--swatch') !== item.color) {
        swatch.style.setProperty('--swatch', item.color);
    }
    return Boolean(changed);
}

function buildAuthorRow(item) {
    const row = document.createElement('div');
    row.className = 'author-item';
    row.setAttribute('role', 'listitem');
    row.dataset.author = item.name;

    const swatch = document.createElement('span');
    swatch.className = 'author-color swatch';
    swatch.style.setProperty('--swatch', item.color);

    const name = document.createElement('span');
    name.className = 'author-name';
    name.textContent = item.name;
    // The panel is narrow and names are frequently truncated, so keep the full
    // value reachable on hover and to assistive tech.
    name.title = item.name;

    const commits = document.createElement('span');
    commits.className = 'author-commits';
    commits.textContent = String(item.commits);

    row.append(swatch, name, commits);
    return row;
}

function updateAuthorRow(row, item) {
    const commits = row.querySelector('.author-commits');
    const changed = commits && commits.textContent !== String(item.commits);
    if (commits) setText(commits, String(item.commits));
    row.classList.toggle('author-item-active', Boolean(item.active));
    return Boolean(changed);
}

/** Repository-wide totals, captured once per load for context. */
const repoTotals = { commits: 0, files: 0, dirs: 0, authors: 0 };

/**
 * Records the repository's overall size so the stats bar can show live counts
 * against it.
 */
export function setRepoTotals({ commits, files, dirs, authors }) {
    repoTotals.commits = commits || 0;
    repoTotals.files = files || 0;
    repoTotals.dirs = dirs || 0;
    repoTotals.authors = authors || 0;
}

function setStat(id, value, total) {
    const el = document.getElementById(id);
    if (el) setText(el, value.toLocaleString());
    const totalEl = document.getElementById(`${id}-total`);
    if (totalEl) {
        // Only worth showing once it differs from the live value; at the end of
        // playback "5,673 / 5,673" is just noise.
        setText(totalEl, total && total !== value ? ` / ${total.toLocaleString()}` : '');
    }
}

/**
 * Updates the stats bar with what is on screen now, against the repository
 * total.
 *
 * These four numbers were written once at load with whole-repository totals, so
 * the bar read "5,673 Files" over a canvas holding 162 of them. Showing the
 * live count with the total as context keeps the sense of scale without
 * claiming the scene contains more than it does.
 */
function refreshStatsBar(rource, sceneFiles, sceneDirs, authorsSoFar) {
    const applied = safeWasmCall('appliedCommit', () => rource.appliedCommit(), 0);
    setStat('stat-commits', applied + 1, repoTotals.commits);
    setStat('stat-files', sceneFiles, repoTotals.files);
    setStat('stat-dirs', sceneDirs, repoTotals.dirs);
    setStat('stat-authors', authorsSoFar, repoTotals.authors);
}

/**
 * Reads the live scene and refreshes both panels.
 */
export function refreshLegends() {
    const rource = getRource();
    if (!rource) return;

    const rawTypes = safeWasmCall('getSceneFileTypes', () => rource.getSceneFileTypes(), null);
    if (rawTypes) {
        try {
            const data = JSON.parse(rawTypes);
            const types = data.types || [];

            const legendItems = getElement('legendItems');
            if (legendItems) {
                const items = types.map((t) => ({ ...t, key: t.ext }));
                reconcile(legendItems, fileTypeRows, items, buildFileTypeRow, updateFileTypeRow);
                legendItems.setAttribute('role', 'list');
                updateLegendSummary('legend-summary', legendItems, data.distinct, data.shown, 'file type', 'file types');
            }

            // The mobile bottom sheet mirrors these panels and was fed from the
            // same one-shot whole-history parse, so it drifted identically.
            updateBottomSheetFileTypes(
                types.map((t) => ({ extension: t.ext, color: t.color, count: t.count }))
            );
        } catch (e) {
            devConsole.warn('[Rource] getSceneFileTypes parse failed:', e);
        }
    }

    const rawAuthors = safeWasmCall('getSceneAuthors', () => rource.getSceneAuthors(), null);
    if (rawAuthors) {
        try {
            const data = JSON.parse(rawAuthors);
            const authors = data.authors || [];

            const authorsItems = getElement('authorsItems');
            if (authorsItems) {
                const items = authors.map((a) => ({ ...a, key: a.name }));
                reconcile(authorsItems, authorRows, items, buildAuthorRow, updateAuthorRow);
                authorsItems.setAttribute('role', 'list');
                updateLegendSummary('authors-summary', authorsItems, data.total, data.shown, 'contributor', 'contributors');
            }

            updateBottomSheetAuthors(
                authors.map((a) => ({ name: a.name, color: a.color, commits: a.commits }))
            );

            refreshStatsBar(
                rource,
                safeWasmCall('getTotalFiles', () => rource.getTotalFiles(), 0),
                safeWasmCall('getTotalDirectories', () => rource.getTotalDirectories(), 0),
                data.total || 0
            );
        } catch (e) {
            devConsole.warn('[Rource] getSceneAuthors parse failed:', e);
        }
    }
}

/**
 * Renders a one-line footer under a panel.
 *
 * Both panels cap how many rows they show. Without this, a repository with 60
 * file types silently looked like it had 40 — the list simply stopped, with
 * nothing to say more existed.
 */
function updateLegendSummary(id, container, distinct, shown, singular, plural) {
    const parent = container.parentElement;
    if (!parent) return;

    let el = parent.querySelector(`#${id}`);
    const hiddenCount = Math.max(0, (distinct ?? 0) - (shown ?? 0));

    if (!hiddenCount) {
        if (el) el.remove();
        return;
    }
    if (!el) {
        el = document.createElement('div');
        el.id = id;
        el.className = 'legend-summary';
        parent.appendChild(el);
    }
    const noun = hiddenCount === 1 ? singular : plural;
    setText(el, `+${hiddenCount} more ${noun}`);
}

/**
 * Starts polling the scene for legend data.
 */
export function initLiveLegend() {
    stopLiveLegend();
    refreshLegends();
    timerId = setInterval(refreshLegends, REFRESH_MS);
}

/**
 * Stops polling and clears cached rows.
 *
 * Called before a WASM reinitialisation: the cached nodes belong to the old
 * document state, and reusing them across a reload would show one repository's
 * rows against another's counts.
 */
export function stopLiveLegend() {
    if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
    }
    fileTypeRows.clear();
    authorRows.clear();
}

/**
 * Clears both panels and the row caches, without stopping the poll.
 * Used when new data is loaded so stale rows never survive the transition.
 */
export function resetLegends() {
    const legendItems = getElement('legendItems');
    const authorsItems = getElement('authorsItems');
    if (legendItems) legendItems.replaceChildren();
    if (authorsItems) authorsItems.replaceChildren();
    fileTypeRows.clear();
    authorRows.clear();
}
