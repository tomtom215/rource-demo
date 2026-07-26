// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Tom F <https://github.com/tomtom215>

/**
 * Rource - Theme Feature
 *
 * Handles light/dark theme toggle with system preference detection.
 * Supports both automatic (system preference) and manual (user toggle) modes.
 */

import { getElement } from '../dom.js';
import { addManagedEventListener, getRource } from '../state.js';
import { safeWasmVoid } from '../wasm-api.js';

const THEME_KEY = 'rource_theme';

/**
 * Pushes the theme's canvas background colour into the WASM renderer.
 *
 * The renderer clears the framebuffer to `settings.display.background_color`,
 * which defaults to black. Toggling the theme only swapped CSS custom
 * properties, so in light theme the surrounding chrome turned light while the
 * visualization itself stayed pure black — the largest element on the page
 * ignored the theme entirely, and low-contrast dark labels sat on it.
 *
 * `--bg-canvas` stays the single source of truth: it is declared per theme in
 * CSS and read back here, so the renderer can never drift from the stylesheet.
 */
/**
 * Bloom's bright-pass threshold, mirroring DEFAULT_BLOOM_THRESHOLD in
 * crates/rource-render/src/backend/webgl2/bloom.rs.
 */
const BLOOM_BRIGHT_PASS_THRESHOLD = 0.7;

function syncCanvasBackground() {
    const rource = getRource();
    if (!rource) return;

    const hex = getComputedStyle(document.documentElement)
        .getPropertyValue('--bg-canvas')
        .trim();

    // setBackgroundColor accepts "#rrggbb" or "rrggbb" and ignores anything
    // else, so guard here to avoid silently keeping a stale colour.
    if (!/^#?[0-9a-fA-F]{6}$/.test(hex)) return;

    safeWasmVoid('setBackgroundColor', () => rource.setBackgroundColor(hex));

    // Bloom extracts every pixel brighter than the bright-pass threshold, blurs
    // it, and adds it back. That models glow against a dark field, but a light
    // canvas is itself above the threshold: the whole frame is extracted and
    // summed with itself, so it clips to pure white and the theme colour is
    // lost. Light theme's #dce0e5 is (0.863, 0.878, 0.898) — every channel is
    // above 0.7, which is why enabling the light theme produced a white canvas
    // rather than the intended tone.
    //
    // Keyed off measured luminance rather than the theme class so a custom
    // background colour gets the same protection.
    const n = hex.replace('#', '');
    const r = parseInt(n.slice(0, 2), 16) / 255;
    const g = parseInt(n.slice(2, 4), 16) / 255;
    const b = parseInt(n.slice(4, 6), 16) / 255;
    // Rec. 709 relative luminance, matching the bright-pass weighting.
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    safeWasmVoid('setBloom', () =>
        rource.setBloom(luminance < BLOOM_BRIGHT_PASS_THRESHOLD));
}

/**
 * Gets the current theme.
 * @returns {string} 'light' or 'dark'
 */
export function getCurrentTheme() {
    return document.documentElement.classList.contains('light-theme') ? 'light' : 'dark';
}

/**
 * Sets the theme manually (overrides system preference).
 * @param {string} theme - 'light' or 'dark'
 */
export function setTheme(theme) {
    // Mark as manually set to override CSS prefers-color-scheme
    document.documentElement.classList.add('theme-manual');

    if (theme === 'light') {
        document.documentElement.classList.add('light-theme');
    } else {
        document.documentElement.classList.remove('light-theme');
    }
    localStorage.setItem(THEME_KEY, theme);
    syncCanvasBackground();
}

/**
 * Toggles the theme between light and dark.
 * Marks the theme as manually set to override system preference.
 */
export function toggleTheme() {
    // Mark as manually set to override CSS prefers-color-scheme
    document.documentElement.classList.add('theme-manual');

    const isLight = document.documentElement.classList.toggle('light-theme');
    localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
    syncCanvasBackground();
}

/**
 * Initializes theme from URL parameter, saved preference, or default.
 *
 * Priority:
 * 1. URL parameter (?theme=light or ?theme=dark) — for VFL testing and shared links
 * 2. Saved user preference (localStorage)
 * 3. Default to dark theme (canonical for a code visualization tool)
 */
export function initTheme() {
    // Check URL parameter first (useful for visual testing and shared links)
    const urlTheme = new URLSearchParams(window.location.search).get('theme');
    if (urlTheme === 'light' || urlTheme === 'dark') {
        document.documentElement.classList.add('theme-manual');
        if (urlTheme === 'light') {
            document.documentElement.classList.add('light-theme');
        }
        // Don't save URL-driven theme to localStorage (ephemeral override)
    } else {
        const savedTheme = localStorage.getItem(THEME_KEY);

        if (savedTheme) {
            // User has a saved preference - use it and mark as manual
            document.documentElement.classList.add('theme-manual');
            if (savedTheme === 'light') {
                document.documentElement.classList.add('light-theme');
            }
        } else {
            // No saved preference: default to dark theme explicitly.
            // Without this, CSS @media (prefers-color-scheme: light) would auto-apply
            // light theme for users with system light mode, overriding our intended default.
            // Dark mode is the canonical theme for a code visualization tool.
            document.documentElement.classList.add('theme-manual');
        }
    }

    // The inline <head> script applies the theme class before first paint, but
    // the renderer is created later and always starts on its black default, so
    // the canvas must be synced explicitly once WASM is available.
    syncCanvasBackground();

    // Set up theme toggle button (managed for cleanup on WASM reinit)
    const themeToggle = getElement('themeToggle');
    if (themeToggle) {
        addManagedEventListener(themeToggle, 'click', toggleTheme);
    }

    // Listen for system theme changes (only affects users who haven't manually toggled)
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
        addManagedEventListener(mediaQuery, 'change', () => {
            // Only auto-switch if user hasn't manually set a preference
            if (!document.documentElement.classList.contains('theme-manual')) {
                // CSS handles the styling via @media query, but we may need to update UI
                // The CSS custom properties will update automatically
            }
        });
    }
}
