/* @ts-self-types="./rource_wasm.d.ts" */

/**
 * The main Rource visualization controller for browser usage.
 *
 * This struct manages the entire visualization lifecycle including:
 * - Rendering (wgpu, WebGL2, or Software backend)
 * - Scene management (files, users, directories)
 * - Camera controls (pan, zoom)
 * - Playback timeline (play, pause, seek)
 * - User interaction (mouse, keyboard)
 *
 * ## API Organization
 *
 * The public API is organized into focused modules:
 * - **Constructor/Renderer**: `create()`, `getRendererType()`, `isGPUAccelerated()`
 * - **Data Loading**: `loadCustomLog()`, `loadGitLog()`, `commitCount()`
 * - **Playback**: `play()`, `pause()`, `seek()`, `setSpeed()` (see `wasm_api::playback`)
 * - **Camera**: `zoom()`, `pan()`, `resize()` (see `wasm_api::camera`)
 * - **Input**: `onMouseDown()`, `onKeyDown()` (see `wasm_api::input`)
 * - **Layout**: `setLayoutPreset()`, `configureLayoutForRepo()` (see `wasm_api::layout`)
 * - **Settings**: `setBloom()`, `setShowLabels()` (see `wasm_api::settings`)
 * - **Export**: `captureScreenshot()`, `getFullMapDimensions()` (see `wasm_api::export`)
 * - **Stats**: `getTotalFiles()`, `getVisibleEntities()` (see `wasm_api::stats`)
 * - **Authors**: `getAuthors()`, `getAuthorColor()` (see `wasm_api::authors`)
 */
export class Rource {
    static __wrap(ptr) {
        const obj = Object.create(Rource.prototype);
        obj.__wbg_ptr = ptr;
        RourceFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RourceFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rource_free(ptr, 0);
    }
    /**
     * Returns the index of the last commit actually applied to the scene.
     *
     * The playback loop applies `commits[current]` and then advances the
     * cursor, so `currentCommit()` is one ahead of what is rendered for the
     * whole of playback. Driving the timeline from it meant the date label and
     * the "commit N of M" counter always described the *next* commit: at slow
     * speeds the clock read minutes or days ahead of the tree on screen.
     *
     * This is the index the visualization is showing, so it is the one the
     * timeline, date and commit counter are derived from.
     * @returns {number}
     */
    appliedCommit() {
        const ret = wasm.rource_appliedCommit(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Captures a screenshot and returns it as PNG data.
     *
     * Only works with software renderer. WebGL2/wgpu renderers don't support
     * direct pixel readback from JavaScript.
     *
     * # Returns
     * PNG file data as a byte vector, or error message.
     * @returns {Uint8Array}
     */
    captureScreenshot() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rource_captureScreenshot(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the number of loaded commits.
     * @returns {number}
     */
    commitCount() {
        const ret = wasm.rource_commitCount(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Configures the layout algorithm for a given repository size.
     *
     * This automatically computes optimal layout parameters based on
     * repository statistics. Should be called after loading data or
     * when repository characteristics are known.
     *
     * # Arguments
     * * `file_count` - Total number of files
     * * `max_depth` - Maximum directory depth (0 if unknown)
     * * `dir_count` - Total number of directories (0 if unknown)
     *
     * # Example (JavaScript)
     * ```javascript
     * rource.configureLayoutForRepo(50000, 12, 3000);
     * ```
     * @param {number} file_count
     * @param {number} max_depth
     * @param {number} dir_count
     */
    configureLayoutForRepo(file_count, max_depth, dir_count) {
        wasm.rource_configureLayoutForRepo(this.__wbg_ptr, file_count, max_depth, dir_count);
    }
    /**
     * Creates a new Rource instance attached to a canvas element (async factory method).
     *
     * Automatically tries wgpu (WebGPU) first, then WebGL2, falling back to
     * software rendering if neither is available.
     *
     * # Arguments
     *
     * * `canvas` - The HTML canvas element to render to
     *
     * # Backend Selection Priority
     *
     * 1. **wgpu (WebGPU)**: Best performance, modern GPU API (Chrome 113+, Edge 113+)
     * 2. **WebGL2**: Good performance, widely supported
     * 3. **Software**: Maximum compatibility, CPU-based
     *
     * # JavaScript Usage
     *
     * ```javascript
     * const rource = await Rource.create(canvas);
     * ```
     *
     * # Note on Send
     *
     * This future is not `Send` because JavaScript/browser APIs are single-threaded.
     * This is expected and safe for WASM usage.
     * @param {HTMLCanvasElement} canvas
     * @returns {Promise<Rource>}
     */
    static create(canvas) {
        const ret = wasm.rource_create(addHeapObject(canvas));
        return takeObject(ret);
    }
    /**
     * Returns the playback cursor: the next commit to apply.
     *
     * This runs one ahead of the scene while playing. Use
     * [`Self::applied_commit`] for anything the viewer reads, or the timeline
     * will describe a commit that has not happened on screen yet.
     * @returns {number}
     */
    currentCommit() {
        const ret = wasm.rource_currentCommit(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Returns debug information about hit testing at the given coordinates.
     *
     * Use this to diagnose why drag might not be working:
     * - Check if `screen_to_world` conversion is correct
     * - Check if entities are in the spatial index
     * - Check if entities are within hit radius
     * @param {number} x
     * @param {number} y
     * @returns {string}
     */
    debugHitTest(x, y) {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rource_debugHitTest(retptr, this.__wbg_ptr, x, y);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Disables the watermark.
     *
     * # Example (JavaScript)
     * ```javascript
     * rource.disableWatermark();
     * ```
     */
    disableWatermark() {
        wasm.rource_disableWatermark(this.__wbg_ptr);
    }
    /**
     * Releases GPU resources immediately.
     *
     * Call this method before the page unloads to prevent GPU resource
     * contention when the page is refreshed quickly. This is especially
     * important for WebGPU which may hold onto adapter resources.
     *
     * After calling `dispose()`, the Rource instance should not be used again.
     *
     * # Example
     *
     * ```javascript
     * window.addEventListener('beforeunload', () => {
     *     if (rource) {
     *         rource.dispose();
     *     }
     * });
     * ```
     */
    dispose() {
        wasm.rource_dispose(this.__wbg_ptr);
    }
    /**
     * Enables the Rource brand watermark preset.
     *
     * This shows "Rource" with "© Tom F" in the bottom-right corner
     * with subtle opacity for non-intrusive branding.
     *
     * # Example (JavaScript)
     * ```javascript
     * rource.enableRourceWatermark();
     * ```
     */
    enableRourceWatermark() {
        wasm.rource_enableRourceWatermark(this.__wbg_ptr);
    }
    /**
     * Checks if the total error rate exceeds the given threshold.
     *
     * # Arguments
     *
     * * `threshold_percent` - Maximum acceptable error rate (0.0-100.0)
     *
     * # Example
     *
     * ```javascript
     * // Check if error rate exceeds 0.1%
     * if (rource.errorRateExceedsThreshold(0.1)) {
     *     showErrorAlert('Error rate too high');
     * }
     * ```
     * @param {number} threshold_percent
     * @returns {boolean}
     */
    errorRateExceedsThreshold(threshold_percent) {
        const ret = wasm.rource_errorRateExceedsThreshold(this.__wbg_ptr, threshold_percent);
        return ret !== 0;
    }
    /**
     * Exports the current commits as a binary cache.
     *
     * Returns `null` if no commits are loaded.
     *
     * The returned bytes can be stored in `IndexedDB` for fast subsequent loads.
     *
     * # Example
     *
     * ```javascript
     * const bytes = rource.exportCacheBytes();
     * if (bytes) {
     *     await idb.put('cache', repoHash, bytes);
     * }
     * ```
     * @returns {Uint8Array | undefined}
     */
    exportCacheBytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rource_exportCacheBytes(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getArrayU8FromWasm0(r0, r1).slice();
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Exports the current commits as a binary cache with a repository identifier.
     *
     * The repository hash is used to validate the cache when loading.
     *
     * # Arguments
     *
     * * `repo_id` - A unique identifier for the repository (URL, path, etc.).
     *
     * # Returns
     *
     * The serialized cache bytes, or `null` if no commits are loaded.
     *
     * # Example
     *
     * ```javascript
     * const bytes = rource.exportCacheBytesWithRepoId('https://github.com/owner/repo.git');
     * ```
     * @param {string} repo_id
     * @returns {Uint8Array | undefined}
     */
    exportCacheBytesWithRepoId(repo_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(repo_id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.rource_exportCacheBytesWithRepoId(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v2;
            if (r0 !== 0) {
                v2 = getArrayU8FromWasm0(r0, r1).slice();
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Forces a render without updating simulation.
     *
     * Guards against zero-dimension canvas (e.g., when `#viz-panel` is hidden
     * and `resizeCanvas()` hasn't run yet). WebGPU cannot create swapchain
     * textures with 0×0 dimensions, so we skip the render entirely.
     */
    forceRender() {
        wasm.rource_forceRender(this.__wbg_ptr);
    }
    /**
     * Updates and renders a single frame.
     *
     * Returns true if there are more frames to render.
     * @param {number} timestamp
     * @returns {boolean}
     */
    frame(timestamp) {
        const ret = wasm.rource_frame(this.__wbg_ptr, timestamp);
        return ret !== 0;
    }
    /**
     * Returns the number of active action beams.
     * @returns {number}
     */
    getActiveActions() {
        const ret = wasm.rource_getActiveActions(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Returns the error count for asset loading operations.
     *
     * Asset errors occur when loading images, fonts, or other resources.
     * @returns {bigint}
     */
    getAssetErrorCount() {
        const ret = wasm.rource_getAssetErrorCount(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Returns the color for a given author name as a hex string.
     *
     * Colors are deterministically generated from the author name,
     * so the same name always produces the same color.
     *
     * # Returns
     * Hex color string like "#e94560"
     * @param {string} name
     * @returns {string}
     */
    getAuthorColor(name) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.rource_getAuthorColor(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Returns author data as a JSON string array.
     *
     * Iterates over all commits to get complete author statistics,
     * not just users currently visible in the scene.
     *
     * # Returns
     * JSON array of author objects:
     * ```json
     * [
     *   {"name": "Alice", "color": "#e94560", "commits": 42},
     *   {"name": "Bob", "color": "#58a6ff", "commits": 17}
     * ]
     * ```
     *
     * Authors are sorted by commit count (descending).
     * @returns {string}
     */
    getAuthors() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rource_getAuthors(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Returns statistics about the current cache state.
     *
     * Returns a JSON object with cache information, or `null` if
     * no commits are loaded.
     *
     * # Example
     *
     * ```javascript
     * const stats = rource.getCacheStats();
     * if (stats) {
     *     const info = JSON.parse(stats);
     *     console.log(`${info.commits} commits, ${info.sizeBytes} bytes`);
     * }
     * ```
     * @returns {string | undefined}
     */
    getCacheStats() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rource_getCacheStats(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the current cache format version.
     *
     * Use this to check compatibility before loading a cache.
     *
     * # Example
     *
     * ```javascript
     * const version = Rource.getCacheVersion();
     * console.log('Cache version:', version);
     * ```
     * @returns {number}
     */
    static getCacheVersion() {
        const ret = wasm.rource_getCacheVersion();
        return ret;
    }
    /**
     * Returns the current camera state as JSON.
     *
     * Returns `{"x": <f32>, "y": <f32>, "zoom": <f32>}`
     * @returns {string}
     */
    getCameraState() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rource_getCameraState(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Returns the canvas height in pixels.
     * @returns {number}
     */
    getCanvasHeight() {
        const ret = wasm.rource_getCanvasHeight(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Returns the canvas width in pixels.
     * @returns {number}
     */
    getCanvasWidth() {
        const ret = wasm.rource_getCanvasWidth(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Returns the author name for a commit at the given index.
     * @param {number} index
     * @returns {string}
     */
    getCommitAuthor(index) {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rource_getCommitAuthor(retptr, this.__wbg_ptr, index);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Returns the total number of unique directories across all loaded commits.
     *
     * This calculates directory count from file paths, independent of
     * playback state. Useful for displaying total stats before playback
     * reaches the end.
     *
     * # Optimization Notes
     *
     * - Uses `match_indices('/')` for O(n) path parsing instead of O(n²) split+nth
     * - Stores owned Strings to handle `Cow<str>` from `to_string_lossy()`
     * - Pre-allocates `HashSet` capacity based on estimated directory count
     * @returns {number}
     */
    getCommitDirectoryCount() {
        const ret = wasm.rource_getCommitDirectoryCount(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Returns the number of files changed in a commit at the given index.
     * @param {number} index
     * @returns {number}
     */
    getCommitFileCount(index) {
        const ret = wasm.rource_getCommitFileCount(this.__wbg_ptr, index);
        return ret >>> 0;
    }
    /**
     * Returns the timestamp for a commit at the given index.
     * @param {number} index
     * @returns {number}
     */
    getCommitTimestamp(index) {
        const ret = wasm.rource_getCommitTimestamp(this.__wbg_ptr, index);
        return ret;
    }
    /**
     * Returns the error count for configuration operations.
     *
     * Config errors occur when invalid settings are provided.
     * @returns {bigint}
     */
    getConfigErrorCount() {
        const ret = wasm.rource_getConfigErrorCount(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Returns the date range of all commits as a JSON object.
     *
     * Returns `{"startTimestamp": <unix_ts>, "endTimestamp": <unix_ts>}` or null
     * if no commits are loaded.
     * @returns {string | undefined}
     */
    getDateRange() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rource_getDateRange(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns detailed error metrics with operation counts as JSON.
     *
     * This includes both error counts and operation counts for each category,
     * enabling more detailed analysis.
     *
     * # Returns
     *
     * JSON string with the following structure:
     * ```json
     * {
     *   "errors": {
     *     "parse": 0,
     *     "render": 0,
     *     "webgl": 0,
     *     "config": 0,
     *     "asset": 0,
     *     "io": 0
     *   },
     *   "operations": {
     *     "parse": 100,
     *     "render": 10000,
     *     "webgl": 1,
     *     "config": 5,
     *     "asset": 10,
     *     "io": 0
     *   },
     *   "totals": {
     *     "errors": 0,
     *     "operations": 10116,
     *     "rate": 0.0
     *   }
     * }
     * ```
     * @returns {string}
     */
    getDetailedErrorMetrics() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rource_getDetailedErrorMetrics(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Returns detailed frame profiling statistics as JSON.
     *
     * This provides phase-level timing breakdown for identifying bottlenecks:
     * - `sceneUpdateMs`: Time spent applying commits and updating physics
     * - `renderMs`: Time spent in render passes
     * - `gpuWaitMs`: Time waiting for GPU (WebGPU only)
     * - `effectsMs`: Time in post-processing (bloom, shadows)
     * - `totalMs`: Total frame time
     *
     * Rolling averages (`avg*`) are calculated over the last 60 frames.
     *
     * ## Usage
     *
     * ```javascript
     * const stats = JSON.parse(rource.getDetailedFrameStats());
     * console.log(`Scene: ${stats.sceneUpdateMs.toFixed(2)}ms`);
     * console.log(`Render: ${stats.renderMs.toFixed(2)}ms`);
     * console.log(`WASM heap: ${(stats.wasmHeapBytes / 1024 / 1024).toFixed(1)}MB`);
     * ```
     *
     * ## Chrome `DevTools` Integration
     *
     * When the `profiling` feature is enabled, Performance marks are added
     * that show up in Chrome `DevTools` Performance tab:
     * - `rource:frame_start` / `rource:frame_end`
     * - `rource:scene_update_start` / `rource:scene_update_end`
     * - `rource:render_start` / `rource:render_end`
     * @returns {string}
     */
    getDetailedFrameStats() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rource_getDetailedFrameStats(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Returns the estimated draw call count for the current frame.
     * @returns {number}
     */
    getDrawCalls() {
        const ret = wasm.rource_getDrawCalls(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Gets information about the entity at the given screen coordinates.
     *
     * Returns a JSON string with entity information if an entity is found,
     * or null if no entity is under the cursor.
     *
     * # Arguments
     *
     * * `x` - Screen X coordinate (canvas-relative)
     * * `y` - Screen Y coordinate (canvas-relative)
     *
     * # Returns
     *
     * JSON string with format:
     * ```json
     * {
     *   "entityType": "file" | "user" | "directory",
     *   "name": "filename.rs",
     *   "path": "src/lib.rs",
     *   "extension": "rs",
     *   "color": "#FF5500",
     *   "radius": 5.0
     * }
     * ```
     * Or `null` if no entity is under the cursor.
     * @param {number} x
     * @param {number} y
     * @returns {string | undefined}
     */
    getEntityAtCursor(x, y) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rource_getEntityAtCursor(retptr, this.__wbg_ptr, x, y);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the bounding box of all entities as JSON.
     *
     * Returns `{"minX", "minY", "maxX", "maxY", "width", "height"}` or null
     * if no entities exist.
     * @returns {string | undefined}
     */
    getEntityBounds() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rource_getEntityBounds(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns all error metrics as a JSON string.
     *
     * This batches all error metrics into a single call to reduce WASM↔JS overhead.
     *
     * # Returns
     *
     * JSON string with the following structure:
     * ```json
     * {
     *   "parse": 0,
     *   "render": 0,
     *   "webgl": 0,
     *   "config": 0,
     *   "asset": 0,
     *   "io": 0,
     *   "total": 0,
     *   "rate": 0.0
     * }
     * ```
     *
     * Note: The `rate` field is in decimal form (0.001 = 0.1%).
     *
     * # Example
     *
     * ```javascript
     * const metrics = JSON.parse(rource.getErrorMetrics());
     * if (metrics.rate > 0.001) {
     *     console.warn('Error rate exceeds 0.1%');
     * }
     * ```
     * @returns {string}
     */
    getErrorMetrics() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rource_getErrorMetrics(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Returns the total error rate as a percentage (0.0-100.0).
     *
     * Formula: `(total_errors / total_operations) * 100`
     *
     * Returns 0.0 if no operations have been recorded.
     *
     * # Example
     *
     * ```javascript
     * const errorRate = rource.getErrorRate();
     * if (errorRate > 0.1) {
     *     console.warn(`Error rate ${errorRate.toFixed(3)}% exceeds 0.1% threshold`);
     * }
     * ```
     * @returns {number}
     */
    getErrorRate() {
        const ret = wasm.rource_getErrorRate(this.__wbg_ptr);
        return ret;
    }
    /**
     * Returns the number of registered file icon types.
     *
     * # Example (JavaScript)
     * ```javascript
     * const count = rource.getFileIconCount();
     * console.log(`${count} file types registered`);
     * ```
     * @returns {number}
     */
    getFileIconCount() {
        const ret = wasm.rource_getFileIconCount(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Gets the current font size for labels.
     * @returns {number}
     */
    getFontSize() {
        const ret = wasm.rource_getFontSize(this.__wbg_ptr);
        return ret;
    }
    /**
     * Returns the current frames per second.
     * @returns {number}
     */
    getFps() {
        const ret = wasm.rource_getFps(this.__wbg_ptr);
        return ret;
    }
    /**
     * Returns all frame statistics in a single call to reduce WASM↔JS overhead.
     *
     * This batches 12+ individual getter calls into one, reducing per-frame
     * overhead by approximately 90% when updating the performance metrics UI.
     *
     * # Timing Precision
     *
     * Frame time is returned with 4 decimal places (0.1µs display resolution).
     * Actual measurement precision is limited by browser security mitigations
     * against timing attacks (Spectre/Meltdown):
     *
     * | Browser | Resolution | Source |
     * |---------|------------|--------|
     * | Chrome  | ~5µs       | [Chrome Security Blog](https://security.googleblog.com) |
     * | Firefox | ~20µs      | [MDN Spectre mitigations](https://developer.mozilla.org) |
     * | Safari  | ~100µs     | `WebKit` security notes |
     *
     * Nanosecond precision is not achievable from JavaScript's `performance.now()`.
     * The 4 decimal places display the full resolution available from the browser.
     *
     * Returns a JSON string with the following structure:
     * ```json
     * {
     *   "fps": 60.0,
     *   "frameTimeMs": 16.6700,
     *   "totalEntities": 1500,
     *   "visibleFiles": 200,
     *   "visibleUsers": 5,
     *   "visibleDirectories": 50,
     *   "activeActions": 10,
     *   "drawCalls": 6,
     *   "canvasWidth": 1920,
     *   "canvasHeight": 1080,
     *   "isPlaying": true,
     *   "commitCount": 1000,
     *   "currentCommit": 500,
     *   "totalFiles": 500,
     *   "totalUsers": 20,
     *   "totalDirectories": 100
     * }
     * ```
     * @returns {string}
     */
    getFrameStats() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rource_getFrameStats(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Returns the last frame time in milliseconds.
     * @returns {number}
     */
    getFrameTimeMs() {
        const ret = wasm.rource_getFrameTimeMs(this.__wbg_ptr);
        return ret;
    }
    /**
     * Calculates the required canvas dimensions for full map export.
     *
     * Returns dimensions that ensure labels are readable at the specified
     * minimum font size, capped at 16384 pixels per dimension.
     *
     * # Arguments
     * * `min_label_font_size` - Minimum font size for readable labels (e.g., 8.0)
     *
     * # Returns
     * JSON object: `{"width", "height", "zoom", "centerX", "centerY"}` or null
     * @param {number} min_label_font_size
     * @returns {string | undefined}
     */
    getFullMapDimensions(min_label_font_size) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rource_getFullMapDimensions(retptr, this.__wbg_ptr, min_label_font_size);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns GPU culling statistics as a JSON string.
     *
     * Returns statistics from the last frame's culling operation, or null
     * if GPU culling is not active or no culling has occurred yet.
     *
     * # Returns
     * JSON string with fields:
     * - `totalInstances`: Total instances submitted for culling
     * - `visibleInstances`: Instances that passed culling
     * - `dispatchCount`: Number of culling dispatches
     * - `cullRatio`: Ratio of visible/total (0.0-1.0)
     * - `culledPercentage`: Percentage culled (0.0-100.0)
     *
     * # Example (JavaScript)
     * ```javascript
     * const stats = rource.getGPUCullingStats();
     * if (stats) {
     *     const data = JSON.parse(stats);
     *     console.log(`Culled ${data.culledPercentage.toFixed(1)}% of instances`);
     * }
     * ```
     * @returns {string | undefined}
     */
    getGPUCullingStats() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rource_getGPUCullingStats(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the current GPU culling threshold.
     *
     * # Example (JavaScript)
     * ```javascript
     * console.log('GPU culling threshold:', rource.getGPUCullingThreshold());
     * ```
     * @returns {number}
     */
    getGPUCullingThreshold() {
        const ret = wasm.rource_getGPUCullingThreshold(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Returns GPU adapter information for diagnostics (WebGPU only).
     *
     * Returns a JSON string with hardware details:
     * - `name`: GPU adapter name
     * - `vendor`: Vendor ID
     * - `device`: Device ID
     * - `deviceType`: Type (`DiscreteGpu`, `IntegratedGpu`)
     * - `backend`: Graphics backend (`BrowserWebGpu`)
     * - `maxTextureDimension2d`: Maximum 2D texture size
     * - `maxBufferSize`: Maximum buffer size in bytes
     * - `maxStorageBufferBindingSize`: Maximum storage buffer binding size
     * - `maxComputeWorkgroupSizeX`: Maximum compute workgroup X size
     * - `maxComputeInvocationsPerWorkgroup`: Maximum compute invocations per workgroup
     *
     * Returns `null` for non-WebGPU renderers.
     * @returns {string | undefined}
     */
    getGPUInfo() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rource_getGPUInfo(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the current GPU physics threshold.
     *
     * # Example (JavaScript)
     * ```javascript
     * console.log('GPU physics threshold:', rource.getGPUPhysicsThreshold());
     * ```
     * @returns {number}
     */
    getGPUPhysicsThreshold() {
        const ret = wasm.rource_getGPUPhysicsThreshold(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Returns the error count for I/O operations.
     *
     * I/O errors occur during file reads or network operations.
     * @returns {bigint}
     */
    getIoErrorCount() {
        const ret = wasm.rource_getIoErrorCount(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Gets the current layout configuration as a JSON string.
     *
     * Returns a JSON object with all layout parameters.
     *
     * # Example (JavaScript)
     * ```javascript
     * const config = JSON.parse(rource.getLayoutConfig());
     * console.log(config.radial_distance_scale);
     * ```
     * @returns {string}
     */
    getLayoutConfig() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rource_getLayoutConfig(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Returns the current maximum commits limit.
     * @returns {number}
     */
    getMaxCommits() {
        const ret = wasm.rource_getMaxCommits(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Gets the current mouse position in screen coordinates.
     *
     * Returns an array `[x, y]` of the last known mouse position.
     * @returns {Float32Array}
     */
    getMousePosition() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rource_getMousePosition(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayF32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Gets the current mouse position in world coordinates.
     *
     * Returns an array `[x, y]` of the mouse position in world space.
     * @returns {Float32Array}
     */
    getMouseWorldPosition() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rource_getMouseWorldPosition(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayF32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Returns the original commit count before any truncation.
     *
     * This is useful for displaying "Showing X of Y commits" in the UI.
     * @returns {number}
     */
    getOriginalCommitCount() {
        const ret = wasm.rource_getOriginalCommitCount(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Returns the error count for parse operations.
     *
     * Parse errors occur when loading git logs or custom log formats
     * with invalid or malformed content.
     * @returns {bigint}
     */
    getParseErrorCount() {
        const ret = wasm.rource_getParseErrorCount(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Returns the parse error rate as a percentage (0.0-100.0).
     *
     * Parse errors should be below 0.5% for healthy operation.
     * @returns {number}
     */
    getParseErrorRate() {
        const ret = wasm.rource_getParseErrorRate(this.__wbg_ptr);
        return ret;
    }
    /**
     * Returns the error count for render operations.
     *
     * Render errors occur during frame rendering, such as buffer allocation
     * failures or texture upload issues.
     * @returns {bigint}
     */
    getRenderErrorCount() {
        const ret = wasm.rource_getRenderErrorCount(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Returns the type of renderer being used ("wgpu", "webgl2", or "software").
     * @returns {string}
     */
    getRendererType() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rource_getRendererType(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Authors who have committed up to the current playback position.
     *
     * Counts commits applied so far rather than the lifetime total, so the
     * list grows and re-sorts as playback advances instead of showing the end
     * state from the first frame.
     *
     * ```json
     * {"total":12,"shown":12,"commits":140,
     *  "authors":[{"name":"Ada","color":"#e94560","commits":31,"active":true}]}
     * ```
     *
     * `active` marks authors with a user currently present in the scene, so the
     * UI can distinguish who is committing now from who has gone quiet.
     * @returns {string}
     */
    getSceneAuthors() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rource_getSceneAuthors(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * File-type counts for the files currently in the scene.
     *
     * Returns a JSON object so the caller can distinguish "no files yet" from
     * "more types than we sent":
     *
     * ```json
     * {"total":128,"shown":9,"distinct":12,"directories":31,
     *  "types":[{"ext":"js","color":"#f1e05a","count":94}]}
     * ```
     *
     * Sorted by count descending, then by extension for a stable order when
     * counts tie — without the tiebreak, equal-count entries would swap places
     * between frames and the list would visibly shuffle.
     * @returns {string}
     */
    getSceneFileTypes() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rource_getSceneFileTypes(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Gets whether labels are being shown.
     * @returns {boolean}
     */
    getShowLabels() {
        const ret = wasm.rource_getShowLabels(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Gets the current playback speed.
     * @returns {number}
     */
    getSpeed() {
        const ret = wasm.rource_getSpeed(this.__wbg_ptr);
        return ret;
    }
    /**
     * Returns the length of the stats buffer (number of `f32` elements).
     * @returns {number}
     */
    getStatsBufferLen() {
        const ret = wasm.rource_getStatsBufferLen(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Returns a pointer to the stats buffer in WASM linear memory.
     *
     * JS uses this pointer offset to create a `Float32Array` view directly
     * into WASM memory, enabling zero-copy reads of all frame statistics.
     *
     * # Safety
     *
     * The returned pointer is valid for the lifetime of the `Rource` instance.
     * The buffer is 32 × `f32` = 128 bytes. JS must not write to this buffer.
     * @returns {number}
     */
    getStatsBufferPtr() {
        const ret = wasm.rource_getStatsBufferPtr(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Returns the total number of directories currently in the scene.
     *
     * Note: This only includes directories that have been created so far
     * during playback. For total directories across all commits, use
     * `getCommitDirectoryCount()`.
     * @returns {number}
     */
    getTotalDirectories() {
        const ret = wasm.rource_getTotalDirectories(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Returns the total number of entities (files + users + dirs + actions).
     * @returns {number}
     */
    getTotalEntities() {
        const ret = wasm.rource_getTotalEntities(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Returns the total number of errors recorded across all categories.
     *
     * # Example
     *
     * ```javascript
     * const totalErrors = rource.getTotalErrors();
     * console.log(`Total errors: ${totalErrors}`);
     * ```
     * @returns {bigint}
     */
    getTotalErrors() {
        const ret = wasm.rource_getTotalErrors(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Returns the total number of files in the scene.
     * @returns {number}
     */
    getTotalFiles() {
        const ret = wasm.rource_getTotalFiles(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Returns the total number of frames rendered.
     * @returns {number}
     */
    getTotalFrames() {
        const ret = wasm.rource_getTotalFrames(this.__wbg_ptr);
        return ret;
    }
    /**
     * Returns the total number of operations recorded across all categories.
     *
     * This is the denominator for error rate calculations.
     * @returns {bigint}
     */
    getTotalOperations() {
        const ret = wasm.rource_getTotalOperations(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Returns the total number of users in the scene.
     * @returns {number}
     */
    getTotalUsers() {
        const ret = wasm.rource_getTotalUsers(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Returns the uptime in seconds.
     * @returns {number}
     */
    getUptime() {
        const ret = wasm.rource_getUptime(this.__wbg_ptr);
        return ret;
    }
    /**
     * Returns the number of visible directories (in current viewport).
     * @returns {number}
     */
    getVisibleDirectories() {
        const ret = wasm.rource_getVisibleDirectories(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Returns the number of visible files (in current viewport).
     * @returns {number}
     */
    getVisibleFiles() {
        const ret = wasm.rource_getVisibleFiles(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Returns the number of visible users (in current viewport).
     * @returns {number}
     */
    getVisibleUsers() {
        const ret = wasm.rource_getVisibleUsers(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Returns a reference to the WASM linear memory.
     *
     * JS needs this to construct a `Float32Array` view over the stats buffer.
     * The `ArrayBuffer` backing this memory may be detached if WASM memory
     * grows; JS code must handle this by recreating the view.
     * @returns {any}
     */
    getWasmMemory() {
        const ret = wasm.rource_getWasmMemory(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Gets the current watermark opacity.
     * @returns {number}
     */
    getWatermarkOpacity() {
        const ret = wasm.rource_getWatermarkOpacity(this.__wbg_ptr);
        return ret;
    }
    /**
     * Returns the error count for WebGL/wgpu operations.
     *
     * WebGL errors include shader compilation failures, context lost events,
     * and program linking issues.
     * @returns {bigint}
     */
    getWebGlErrorCount() {
        const ret = wasm.rource_getWebGlErrorCount(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Returns the current zoom level.
     * @returns {number}
     */
    getZoom() {
        const ret = wasm.rource_getZoom(this.__wbg_ptr);
        return ret;
    }
    /**
     * Returns debug information about zoom and entity visibility.
     *
     * Returns JSON with zoom level, entity radii, and screen radii to help
     * diagnose visibility issues.
     * @returns {string}
     */
    getZoomDebugInfo() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rource_getZoomDebugInfo(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Returns whether file icons are initialized.
     *
     * # Example (JavaScript)
     * ```javascript
     * if (rource.hasFileIcons()) {
     *     console.log('File icons ready');
     * }
     * ```
     * @returns {boolean}
     */
    hasFileIcons() {
        const ret = wasm.rource_hasFileIcons(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Checks if cache data has a valid magic header.
     *
     * This is a quick check that doesn't fully validate the cache.
     * Use before attempting to import to provide fast feedback.
     *
     * # Arguments
     *
     * * `bytes` - The cache bytes to check.
     *
     * # Returns
     *
     * `true` if the data starts with the "RSVC" magic bytes.
     * @param {Uint8Array} bytes
     * @returns {boolean}
     */
    static hasValidCacheMagic(bytes) {
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rource_hasValidCacheMagic(ptr0, len0);
        return ret !== 0;
    }
    /**
     * Computes a stable hash for a repository identifier.
     *
     * Use this to create cache keys for `IndexedDB` storage.
     *
     * # Arguments
     *
     * * `repo_id` - A unique identifier for the repository (URL, path, etc.).
     *
     * # Returns
     *
     * A 64-bit hash as a hex string (16 characters).
     *
     * # Example
     *
     * ```javascript
     * const hash = Rource.hashRepoId('https://github.com/owner/repo.git');
     * // Use hash as `IndexedDB` key
     * await idb.put('cache', hash, cacheBytes);
     * ```
     * @param {string} repo_id
     * @returns {string}
     */
    static hashRepoId(repo_id) {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(repo_id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.rource_hashRepoId(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred2_0 = r0;
            deferred2_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Imports commits from a binary cache.
     *
     * Returns the number of commits loaded, or 0 if the cache is invalid.
     *
     * # Arguments
     *
     * * `bytes` - The cache bytes previously exported with `exportCacheBytes()`.
     *
     * # Example
     *
     * ```javascript
     * const bytes = await idb.get('cache', repoHash);
     * if (bytes) {
     *     const count = rource.importCacheBytes(bytes);
     *     if (count > 0) {
     *         console.log(`Loaded ${count} commits from cache`);
     *     }
     * }
     * ```
     * @param {Uint8Array} bytes
     * @returns {number}
     */
    importCacheBytes(bytes) {
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rource_importCacheBytes(this.__wbg_ptr, ptr0, len0);
        return ret >>> 0;
    }
    /**
     * Imports commits from a binary cache, validating the repository identifier.
     *
     * Returns the number of commits loaded, or 0 if:
     * - The cache is invalid
     * - The repository hash doesn't match
     *
     * # Arguments
     *
     * * `bytes` - The cache bytes.
     * * `repo_id` - The expected repository identifier.
     *
     * # Example
     *
     * ```javascript
     * const bytes = await idb.get('cache', repoHash);
     * const count = rource.importCacheBytesWithRepoId(bytes, repoUrl);
     * if (count === 0) {
     *     // Cache miss or mismatch - fallback to parsing
     * }
     * ```
     * @param {Uint8Array} bytes
     * @param {string} repo_id
     * @returns {number}
     */
    importCacheBytesWithRepoId(bytes, repo_id) {
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(repo_id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.rource_importCacheBytesWithRepoId(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return ret >>> 0;
    }
    /**
     * Initializes the file icon system.
     *
     * This pre-generates icons for common file extensions (rs, js, py, etc.)
     * and stores them for efficient rendering:
     * - **wgpu**: Uses GPU texture arrays for batched rendering
     * - **WebGL2**: Uses GPU texture arrays (WebGL2 supports `TEXTURE_2D_ARRAY`)
     * - **Software**: Uses CPU textures
     *
     * # Returns
     *
     * `true` if initialization succeeded, `false` otherwise.
     *
     * # Example (JavaScript)
     * ```javascript
     * const success = rource.initFileIcons();
     * console.log('File icons initialized:', success);
     * ```
     * @returns {boolean}
     */
    initFileIcons() {
        const ret = wasm.rource_initFileIcons(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Returns whether auto-fit mode is currently enabled.
     * @returns {boolean}
     */
    isAutoFit() {
        const ret = wasm.rource_isAutoFit(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Returns true if the GPU context is lost.
     * @returns {boolean}
     */
    isContextLost() {
        const ret = wasm.rource_isContextLost(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Returns true if using a GPU-accelerated renderer (wgpu or WebGL2).
     * @returns {boolean}
     */
    isGPUAccelerated() {
        const ret = wasm.rource_isGPUAccelerated(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Returns whether GPU visibility culling is currently active.
     *
     * This checks all conditions required for GPU culling:
     * 1. GPU culling is enabled via `setUseGPUCulling(true)`
     * 2. wgpu backend is being used
     * 3. Total entity count exceeds threshold (if threshold > 0)
     *
     * # Example (JavaScript)
     * ```javascript
     * if (rource.isGPUCullingActive()) {
     *     console.log('GPU culling is running');
     * }
     * ```
     * @returns {boolean}
     */
    isGPUCullingActive() {
        const ret = wasm.rource_isGPUCullingActive(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Returns whether GPU visibility culling is currently enabled.
     *
     * # Example (JavaScript)
     * ```javascript
     * console.log('GPU culling:', rource.isGPUCullingEnabled());
     * ```
     * @returns {boolean}
     */
    isGPUCullingEnabled() {
        const ret = wasm.rource_isGPUCullingEnabled(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Returns whether GPU physics is currently active.
     *
     * This checks all conditions required for GPU physics:
     * 1. GPU physics is enabled via `setUseGPUPhysics(true)`
     * 2. wgpu backend is being used
     * 3. Directory count exceeds threshold (if threshold > 0)
     *
     * # Example (JavaScript)
     * ```javascript
     * if (rource.isGPUPhysicsActive()) {
     *     console.log('GPU physics is running');
     * }
     * ```
     * @returns {boolean}
     */
    isGPUPhysicsActive() {
        const ret = wasm.rource_isGPUPhysicsActive(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Returns whether GPU physics is currently enabled.
     *
     * # Example (JavaScript)
     * ```javascript
     * console.log('GPU physics:', rource.isGPUPhysicsEnabled());
     * ```
     * @returns {boolean}
     */
    isGPUPhysicsEnabled() {
        const ret = wasm.rource_isGPUPhysicsEnabled(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Returns whether playback is active.
     * @returns {boolean}
     */
    isPlaying() {
        const ret = wasm.rource_isPlaying(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Returns true if the `profiling` feature is enabled.
     *
     * When true, Performance API marks are added to frames for Chrome `DevTools`.
     * @returns {boolean}
     */
    isProfilingEnabled() {
        const ret = wasm.rource_isProfilingEnabled(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Returns true if the `tracing` feature is enabled.
     *
     * When true, Rust tracing spans are routed to browser console.
     * @returns {boolean}
     */
    isTracingEnabled() {
        const ret = wasm.rource_isTracingEnabled(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Returns whether vsync is currently enabled.
     *
     * Returns `true` if:
     * - Using wgpu backend with vsync enabled
     * - Using WebGL2 or software backend (always vsync-aligned)
     *
     * # Example (JavaScript)
     * ```javascript
     * const vsyncEnabled = rource.isVsyncEnabled();
     * console.log('Vsync:', vsyncEnabled ? 'ON' : 'OFF');
     * ```
     * @returns {boolean}
     */
    isVsyncEnabled() {
        const ret = wasm.rource_isVsyncEnabled(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Returns whether the watermark is enabled.
     *
     * # Example (JavaScript)
     * ```javascript
     * if (rource.isWatermarkEnabled()) {
     *     console.log('Watermark is visible');
     * }
     * ```
     * @returns {boolean}
     */
    isWatermarkEnabled() {
        const ret = wasm.rource_isWatermarkEnabled(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Returns true if using WebGL2 renderer.
     * @returns {boolean}
     */
    isWebGL2() {
        const ret = wasm.rource_isWebGL2(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Returns true if using wgpu (WebGPU) renderer.
     * @returns {boolean}
     */
    isWgpu() {
        const ret = wasm.rource_isWgpu(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Loads commits from custom pipe-delimited format.
     *
     * Format: `timestamp|author|action|path` per line
     *
     * Uses lenient parsing by default to skip invalid lines (e.g., lines with
     * pipe characters in author names or unsupported git statuses).
     *
     * # Commit Limit
     *
     * If the log contains more commits than `maxCommits` (default 100,000),
     * only the first `maxCommits` commits are loaded. Check `wasCommitsTruncated()`
     * to detect if truncation occurred.
     * @param {string} log
     * @returns {number}
     */
    loadCustomLog(log) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(log, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.rource_loadCustomLog(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return r0 >>> 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Loads commits from git log format.
     *
     * Uses lenient parsing to handle malformed lines gracefully.
     *
     * # Commit Limit
     *
     * If the log contains more commits than `maxCommits` (default 100,000),
     * only the first `maxCommits` commits are loaded. Check `wasCommitsTruncated()`
     * to detect if truncation occurred.
     * @param {string} log
     * @returns {number}
     */
    loadGitLog(log) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(log, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len0 = WASM_VECTOR_LEN;
            wasm.rource_loadGitLog(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return r0 >>> 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Handles keyboard events.
     *
     * Supports the following shortcuts:
     * - Space: Toggle play/pause
     * - +/-: Zoom in/out
     * - Arrows: Pan camera
     * - R: Reset camera
     * - L: Toggle labels
     * - [/]: Decrease/increase speed
     * - </> or ,/.: Step backward/forward
     * - Home/End: Jump to start/end
     * @param {string} key
     */
    onKeyDown(key) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.rource_onKeyDown(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Handles mouse down events.
     *
     * Initiates entity dragging if an entity is clicked, otherwise starts
     * camera panning mode.
     * @param {number} x
     * @param {number} y
     */
    onMouseDown(x, y) {
        wasm.rource_onMouseDown(this.__wbg_ptr, x, y);
    }
    /**
     * Handles mouse move events.
     *
     * Updates entity position if dragging, or pans camera if no entity is selected.
     * @param {number} x
     * @param {number} y
     */
    onMouseMove(x, y) {
        wasm.rource_onMouseMove(this.__wbg_ptr, x, y);
    }
    /**
     * Handles mouse up events.
     *
     * Releases any dragged entity and resets drag state.
     */
    onMouseUp() {
        wasm.rource_onMouseUp(this.__wbg_ptr);
    }
    /**
     * Handles mouse wheel events for zooming.
     *
     * Zooms toward the mouse cursor position for intuitive navigation.
     * @param {number} delta_y
     * @param {number} mouse_x
     * @param {number} mouse_y
     */
    onWheel(delta_y, mouse_x, mouse_y) {
        wasm.rource_onWheel(this.__wbg_ptr, delta_y, mouse_x, mouse_y);
    }
    /**
     * Pans the camera by the given delta in screen pixels.
     * Disables auto-fit when user manually pans.
     * @param {number} dx
     * @param {number} dy
     */
    pan(dx, dy) {
        wasm.rource_pan(this.__wbg_ptr, dx, dy);
    }
    /**
     * Pauses playback.
     */
    pause() {
        wasm.rource_pause(this.__wbg_ptr);
    }
    /**
     * Starts playback.
     */
    play() {
        wasm.rource_play(this.__wbg_ptr);
    }
    /**
     * Prepares the renderer for full map export.
     *
     * Resizes canvas and positions camera for high-resolution capture.
     * Call `forceRender()` after this, then `captureScreenshot()`.
     *
     * # Arguments
     * * `width` - Target canvas width
     * * `height` - Target canvas height
     * * `zoom` - Zoom level for the export
     * * `center_x` - World X coordinate for camera center
     * * `center_y` - World Y coordinate for camera center
     * @param {number} width
     * @param {number} height
     * @param {number} zoom
     * @param {number} center_x
     * @param {number} center_y
     */
    prepareFullMapExport(width, height, zoom, center_x, center_y) {
        wasm.rource_prepareFullMapExport(this.__wbg_ptr, width, height, zoom, center_x, center_y);
    }
    /**
     * Attempts to recover from a lost GPU context.
     * @returns {boolean}
     */
    recoverContext() {
        const ret = wasm.rource_recoverContext(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Registers a custom icon color for a file extension.
     *
     * If the extension is already registered, this does nothing.
     * If file icons are not initialized, returns `false`.
     *
     * # Arguments
     *
     * * `extension` - File extension without dot (e.g., "custom", "myext")
     * * `hex_color` - Color as hex string (e.g., "#FF5500" or "FF5500")
     *
     * # Returns
     *
     * `true` if the icon was registered, `false` otherwise.
     *
     * # Example (JavaScript)
     * ```javascript
     * // Register a custom file extension with orange color
     * rource.registerFileIcon("myext", "#FF5500");
     * ```
     * @param {string} extension
     * @param {string} hex_color
     * @returns {boolean}
     */
    registerFileIcon(extension, hex_color) {
        const ptr0 = passStringToWasm0(extension, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(hex_color, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.rource_registerFileIcon(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return ret !== 0;
    }
    /**
     * Resets the camera to fit all content and resumes auto-fit.
     *
     * Re-enabling auto-fit is the point of this call. Zooming or panning turns
     * auto-fit off so the viewer keeps the framing they chose, but nothing
     * turned it back on: a single scroll or drag left the camera fixed for the
     * rest of the session while the scene kept growing past the edges of the
     * viewport. A one-shot fit only papered over that until the next commit.
     */
    resetCamera() {
        wasm.rource_resetCamera(this.__wbg_ptr);
    }
    /**
     * Resets all error metrics to zero.
     *
     * Call this when starting a new session or after recovering from errors.
     *
     * # Example
     *
     * ```javascript
     * // Reset metrics for a clean start
     * rource.resetErrorMetrics();
     * ```
     */
    resetErrorMetrics() {
        wasm.rource_resetErrorMetrics(this.__wbg_ptr);
    }
    /**
     * Resizes the canvas and renderer.
     *
     * Should be called when the canvas element size changes.
     * @param {number} width
     * @param {number} height
     */
    resize(width, height) {
        wasm.rource_resize(this.__wbg_ptr, width, height);
    }
    /**
     * Restores the renderer after full map export.
     *
     * Resizes canvas back to normal dimensions and fits camera to content.
     *
     * # Arguments
     * * `width` - Original canvas width
     * * `height` - Original canvas height
     * @param {number} width
     * @param {number} height
     */
    restoreAfterExport(width, height) {
        wasm.rource_restoreAfterExport(this.__wbg_ptr, width, height);
    }
    /**
     * Restores camera state from previously saved values.
     *
     * Use with `getCameraState()` to save/restore view positions.
     * @param {number} x
     * @param {number} y
     * @param {number} zoom
     */
    restoreCameraState(x, y, zoom) {
        wasm.rource_restoreCameraState(this.__wbg_ptr, x, y, zoom);
    }
    /**
     * Seeks to a specific commit index.
     *
     * This rebuilds the scene state by replaying all commits up to the
     * specified index, then pre-warms the physics simulation.
     *
     * # Performance Warning
     *
     * For large repositories, seeking to a distant commit (e.g., commit 50,000
     * in a 100K commit repo) will apply all previous commits synchronously,
     * which may cause brief UI freezing. Consider using incremental playback
     * for very large repositories.
     * @param {number} commit_index
     */
    seek(commit_index) {
        wasm.rource_seek(this.__wbg_ptr, commit_index);
    }
    /**
     * Enables or disables auto-fit mode.
     *
     * When enabled, the camera automatically zooms out to keep all content visible
     * as the visualization grows. Manual zoom/pan operations disable auto-fit;
     * `resetCamera()` re-enables it.
     *
     * Auto-fit is enabled by default. (This previously documented the opposite,
     * contradicting the constructor, which has always set it on.)
     * @param {boolean} enabled
     */
    setAutoFit(enabled) {
        wasm.rource_setAutoFit(this.__wbg_ptr, enabled);
    }
    /**
     * Sets the background color (hex string like "#000000" or "000000").
     *
     * # Example (JavaScript)
     * ```javascript
     * rource.setBackgroundColor("#1a1a2e");
     * ```
     * @param {string} hex
     */
    setBackgroundColor(hex) {
        const ptr0 = passStringToWasm0(hex, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.rource_setBackgroundColor(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Sets whether to show bloom effect.
     *
     * Bloom creates a glow around bright elements.
     * Syncs the setting to the active renderer backend.
     * @param {boolean} enabled
     */
    setBloom(enabled) {
        wasm.rource_setBloom(this.__wbg_ptr, enabled);
    }
    /**
     * Sets the branch depth fade rate.
     *
     * Higher values make deep branches fade faster.
     * Range: [0.0, 1.0], Default: 0.3
     *
     * # Example (JavaScript)
     * ```javascript
     * rource.setBranchDepthFade(0.7);
     * ```
     * @param {number} fade
     */
    setBranchDepthFade(fade) {
        wasm.rource_setBranchDepthFade(this.__wbg_ptr, fade);
    }
    /**
     * Sets the maximum branch opacity.
     *
     * Controls visibility of directory-to-parent connections.
     * Range: [0.0, 1.0], Default: 0.35
     *
     * # Example (JavaScript)
     * ```javascript
     * rource.setBranchOpacityMax(0.15);
     * ```
     * @param {number} opacity
     */
    setBranchOpacityMax(opacity) {
        wasm.rource_setBranchOpacityMax(this.__wbg_ptr, opacity);
    }
    /**
     * Sets a custom watermark with both primary and secondary text.
     *
     * This is a convenience method that enables the watermark and sets both text values.
     *
     * # Example (JavaScript)
     * ```javascript
     * rource.setCustomWatermark("My Project", "© 2026 My Company");
     * ```
     * @param {string} text
     * @param {string} subtext
     */
    setCustomWatermark(text, subtext) {
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(subtext, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        wasm.rource_setCustomWatermark(this.__wbg_ptr, ptr0, len0, ptr1, len1);
    }
    /**
     * Sets the depth distance exponent for non-linear depth scaling.
     *
     * Values > 1.0 add extra spacing at deeper levels.
     * Range: [0.5, 2.0], Default: 1.0 (linear)
     *
     * # Example (JavaScript)
     * ```javascript
     * rource.setDepthDistanceExponent(1.3);
     * ```
     * @param {number} exponent
     */
    setDepthDistanceExponent(exponent) {
        wasm.rource_setDepthDistanceExponent(this.__wbg_ptr, exponent);
    }
    /**
     * Sets the font size for labels.
     *
     * Range: [4.0, 200.0]
     * @param {number} size
     */
    setFontSize(size) {
        wasm.rource_setFontSize(this.__wbg_ptr, size);
    }
    /**
     * Sets the entity count threshold for enabling GPU culling.
     *
     * When the total visible entity count exceeds this threshold, GPU culling
     * will be used (if enabled and wgpu backend is active).
     *
     * Set to 0 to always use GPU culling when enabled (ignores entity count).
     *
     * Default: 10000 entities
     *
     * # Arguments
     * * `threshold` - Minimum entity count to trigger GPU culling
     *
     * # Example (JavaScript)
     * ```javascript
     * // Use GPU culling for scenes with 5000+ entities
     * rource.setGPUCullingThreshold(5000);
     *
     * // Always use GPU culling when enabled (no threshold)
     * rource.setGPUCullingThreshold(0);
     * ```
     * @param {number} threshold
     */
    setGPUCullingThreshold(threshold) {
        wasm.rource_setGPUCullingThreshold(this.__wbg_ptr, threshold);
    }
    /**
     * Sets the directory count threshold for enabling GPU physics.
     *
     * When the scene has more directories than this threshold, GPU physics
     * will be used (if enabled and wgpu backend is active).
     *
     * Set to 0 to always use GPU physics when enabled (ignores directory count).
     *
     * Default: 500 directories
     *
     * # Arguments
     * * `threshold` - Minimum directory count to trigger GPU physics
     *
     * # Example (JavaScript)
     * ```javascript
     * // Use GPU physics for repos with 1000+ directories
     * rource.setGPUPhysicsThreshold(1000);
     *
     * // Always use GPU physics when enabled (no threshold)
     * rource.setGPUPhysicsThreshold(0);
     * ```
     * @param {number} threshold
     */
    setGPUPhysicsThreshold(threshold) {
        wasm.rource_setGPUPhysicsThreshold(this.__wbg_ptr, threshold);
    }
    /**
     * Sets the layout preset for different repository sizes.
     *
     * # Presets
     * * "small" - Repos < 1000 files (compact layout)
     * * "medium" - Repos 1000-10000 files (default)
     * * "large" - Repos 10000-50000 files (spread out)
     * * "massive" - Repos 50000+ files (maximum spread)
     *
     * # Example (JavaScript)
     * ```javascript
     * rource.setLayoutPreset("massive");
     * ```
     * @param {string} preset
     */
    setLayoutPreset(preset) {
        const ptr0 = passStringToWasm0(preset, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.rource_setLayoutPreset(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Sets the maximum number of commits to load.
     *
     * Call this before `loadGitLog()` or `loadCustomLog()` to change the limit.
     * Default is 100,000 commits.
     *
     * # Arguments
     *
     * * `max` - Maximum commits to load (0 = unlimited, use with caution)
     * @param {number} max
     */
    setMaxCommits(max) {
        wasm.rource_setMaxCommits(this.__wbg_ptr, max);
    }
    /**
     * Sets the radial distance scale for directory positioning.
     *
     * Higher values spread the tree outward more.
     * Range: [40.0, 500.0], Default: 80.0
     *
     * # Example (JavaScript)
     * ```javascript
     * rource.setRadialDistanceScale(160.0);
     * ```
     * @param {number} scale
     */
    setRadialDistanceScale(scale) {
        wasm.rource_setRadialDistanceScale(this.__wbg_ptr, scale);
    }
    /**
     * Sets whether to show labels (user names, file names, directory names).
     * @param {boolean} show
     */
    setShowLabels(show) {
        wasm.rource_setShowLabels(this.__wbg_ptr, show);
    }
    /**
     * Sets playback speed (seconds per day of repository history).
     *
     * Lower values = faster playback. Default is 10.0.
     * Range: [0.01, 1000.0]
     * @param {number} seconds_per_day
     */
    setSpeed(seconds_per_day) {
        wasm.rource_setSpeed(this.__wbg_ptr, seconds_per_day);
    }
    /**
     * Enables or disables GPU visibility culling.
     *
     * When enabled and using the wgpu backend, visibility culling runs on
     * the GPU using compute shaders. This is beneficial for extreme-scale
     * scenarios (10,000+ visible entities) where CPU culling becomes a
     * bottleneck.
     *
     * **Note**: GPU culling only works with the wgpu backend. When using
     * WebGL2 or Software renderers, this setting is ignored and CPU culling
     * is always used.
     *
     * For most use cases, the default CPU-side quadtree culling is sufficient.
     *
     * # Arguments
     * * `enabled` - Whether to enable GPU culling
     *
     * # Example (JavaScript)
     * ```javascript
     * if (rource.isWgpu()) {
     *     rource.setUseGPUCulling(true);
     *     console.log('GPU culling enabled');
     * }
     * ```
     * @param {boolean} enabled
     */
    setUseGPUCulling(enabled) {
        wasm.rource_setUseGPUCulling(this.__wbg_ptr, enabled);
    }
    /**
     * Enables or disables GPU physics simulation.
     *
     * When enabled and using the wgpu backend, the force-directed physics
     * simulation runs on the GPU using compute shaders. This provides
     * significant performance improvements for large repositories (500+
     * directories) where CPU physics becomes the bottleneck.
     *
     * **Note**: GPU physics only works with the wgpu backend. When using
     * WebGL2 or Software renderers, this setting is ignored and CPU physics
     * is always used.
     *
     * # Arguments
     * * `enabled` - Whether to enable GPU physics
     *
     * # Example (JavaScript)
     * ```javascript
     * if (rource.isWgpu()) {
     *     rource.setUseGPUPhysics(true);
     *     console.log('GPU physics enabled');
     * }
     * ```
     * @param {boolean} enabled
     */
    setUseGPUPhysics(enabled) {
        wasm.rource_setUseGPUPhysics(this.__wbg_ptr, enabled);
    }
    /**
     * Sets vsync mode for the renderer.
     *
     * This controls whether frames are synchronized to the display refresh rate:
     * - `true` (default): Vsync enabled, frames sync to display refresh (~60 FPS)
     * - `false`: Vsync disabled, uncapped frame rate (300+ FPS possible)
     *
     * **Note:** This only affects the wgpu backend (WebGPU). WebGL2 and software
     * renderers always use requestAnimationFrame timing which is vsync-aligned.
     *
     * **Performance Impact:** Disabling vsync increases GPU utilization and power
     * consumption. Use with caution on battery-powered devices.
     *
     * # Example (JavaScript)
     * ```javascript
     * // Disable vsync for uncapped FPS
     * rource.setVsync(false);
     *
     * // Re-enable vsync for power efficiency
     * rource.setVsync(true);
     * ```
     * @param {boolean} enabled
     */
    setVsync(enabled) {
        wasm.rource_setVsync(this.__wbg_ptr, enabled);
    }
    /**
     * Sets the watermark text color (hex string like "#FFFFFF" or "FFFFFF").
     *
     * # Example (JavaScript)
     * ```javascript
     * rource.setWatermarkColor("#FFFFFF");
     * ```
     * @param {string} hex
     */
    setWatermarkColor(hex) {
        const ptr0 = passStringToWasm0(hex, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.rource_setWatermarkColor(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Sets whether the watermark is enabled.
     *
     * # Example (JavaScript)
     * ```javascript
     * rource.setWatermarkEnabled(true);
     * ```
     * @param {boolean} enabled
     */
    setWatermarkEnabled(enabled) {
        wasm.rource_setWatermarkEnabled(this.__wbg_ptr, enabled);
    }
    /**
     * Sets the watermark font size.
     *
     * # Example (JavaScript)
     * ```javascript
     * rource.setWatermarkFontSize(16);
     * ```
     * @param {number} size
     */
    setWatermarkFontSize(size) {
        wasm.rource_setWatermarkFontSize(this.__wbg_ptr, size);
    }
    /**
     * Sets the watermark margin from the screen edge in pixels.
     *
     * # Example (JavaScript)
     * ```javascript
     * rource.setWatermarkMargin(20);
     * ```
     * @param {number} margin
     */
    setWatermarkMargin(margin) {
        wasm.rource_setWatermarkMargin(this.__wbg_ptr, margin);
    }
    /**
     * Sets the watermark opacity (0.0 = invisible, 1.0 = fully opaque).
     *
     * # Example (JavaScript)
     * ```javascript
     * rource.setWatermarkOpacity(0.5);
     * ```
     * @param {number} opacity
     */
    setWatermarkOpacity(opacity) {
        wasm.rource_setWatermarkOpacity(this.__wbg_ptr, opacity);
    }
    /**
     * Sets the watermark position.
     *
     * Valid positions:
     * - "top-left" or "tl"
     * - "top-right" or "tr"
     * - "bottom-left" or "bl"
     * - "bottom-right" or "br" (default)
     *
     * # Example (JavaScript)
     * ```javascript
     * rource.setWatermarkPosition("bottom-left");
     * ```
     * @param {string} position
     */
    setWatermarkPosition(position) {
        const ptr0 = passStringToWasm0(position, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.rource_setWatermarkPosition(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Sets the secondary watermark text (displayed below the primary text).
     *
     * Pass an empty string to clear the subtext.
     *
     * # Example (JavaScript)
     * ```javascript
     * rource.setWatermarkSubtext("© 2026 My Company");
     * ```
     * @param {string} text
     */
    setWatermarkSubtext(text) {
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.rource_setWatermarkSubtext(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Sets the primary watermark text.
     *
     * # Example (JavaScript)
     * ```javascript
     * rource.setWatermarkText("My Project");
     * ```
     * @param {string} text
     */
    setWatermarkText(text) {
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.rource_setWatermarkText(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Steps backward to the previous commit.
     */
    stepBackward() {
        wasm.rource_stepBackward(this.__wbg_ptr);
    }
    /**
     * Steps forward to the next commit.
     */
    stepForward() {
        wasm.rource_stepForward(this.__wbg_ptr);
    }
    /**
     * Toggles play/pause state.
     */
    togglePlay() {
        wasm.rource_togglePlay(this.__wbg_ptr);
    }
    /**
     * Resets the render cooldown to ensure the next `frame()` calls `render()`.
     *
     * Called by WASM API methods that change visual state (camera, settings,
     * input, playback) so the GPU render phase is not skipped while the user
     * is interacting with the visualization.
     *
     * Part of Level 3 power management: dirty-flag rendering.
     */
    wakeRenderer() {
        wasm.rource_wakeRenderer(this.__wbg_ptr);
    }
    /**
     * Warms up the GPU visibility culling compute pipeline.
     *
     * Call this during initialization to pre-compile compute shaders
     * and avoid first-frame stuttering when GPU culling is first used.
     *
     * **Note**: Only has an effect when using the wgpu backend.
     *
     * # Example (JavaScript)
     * ```javascript
     * if (rource.isWgpu()) {
     *     rource.warmupGPUCulling();
     *     rource.setUseGPUCulling(true);
     * }
     * ```
     */
    warmupGPUCulling() {
        wasm.rource_warmupGPUCulling(this.__wbg_ptr);
    }
    /**
     * Warms up the GPU physics compute pipeline.
     *
     * Call this during initialization to pre-compile compute shaders
     * and avoid first-frame stuttering when GPU physics is first used.
     *
     * **Note**: Only has an effect when using the wgpu backend.
     *
     * # Example (JavaScript)
     * ```javascript
     * if (rource.isWgpu()) {
     *     rource.warmupGPUPhysics();
     *     rource.setUseGPUPhysics(true);
     * }
     * ```
     */
    warmupGPUPhysics() {
        wasm.rource_warmupGPUPhysics(this.__wbg_ptr);
    }
    /**
     * Returns true if commits were truncated during the last load.
     *
     * When true, only the first `maxCommits` commits were loaded.
     * Use `getOriginalCommitCount()` to see the full count.
     * @returns {boolean}
     */
    wasCommitsTruncated() {
        const ret = wasm.rource_wasCommitsTruncated(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Zooms the camera by a factor (> 1 zooms in, < 1 zooms out).
     *
     * Max zoom is 1000.0 to support deep zoom into massive repositories.
     * Min zoom is `AUTO_FIT_MIN_ZOOM` (0.05) to prevent LOD culling all entities.
     * Disables auto-fit when user manually zooms.
     * @param {number} factor
     */
    zoom(factor) {
        wasm.rource_zoom(this.__wbg_ptr, factor);
    }
    /**
     * Zooms the camera toward a specific screen point.
     *
     * This provides intuitive zoom behavior where the point under the cursor
     * stays fixed during zoom operations.
     * Min zoom is `AUTO_FIT_MIN_ZOOM` (0.05) to prevent LOD culling all entities.
     * Disables auto-fit when user manually zooms.
     * @param {number} screen_x
     * @param {number} screen_y
     * @param {number} factor
     */
    zoomToward(screen_x, screen_y, factor) {
        wasm.rource_zoomToward(this.__wbg_ptr, screen_x, screen_y, factor);
    }
}
if (Symbol.dispose) Rource.prototype[Symbol.dispose] = Rource.prototype.free;

/**
 * Set up better panic messages for debugging in browser console.
 */
export function init_panic_hook() {
    wasm.init_panic_hook();
}
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg_Window_afcc911b2f9c92e2: function(arg0) {
            const ret = getObject(arg0).Window;
            return addHeapObject(ret);
        },
        __wbg_WorkerGlobalScope_5d19ebc889ff397e: function(arg0) {
            const ret = getObject(arg0).WorkerGlobalScope;
            return addHeapObject(ret);
        },
        __wbg___wbindgen_boolean_get_fa956cfa2d1bd751: function(arg0) {
            const v = getObject(arg0);
            const ret = typeof(v) === 'boolean' ? v : undefined;
            return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
        },
        __wbg___wbindgen_debug_string_c25d447a39f5578f: function(arg0, arg1) {
            const ret = debugString(getObject(arg1));
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_is_function_1ff95bcc5517c252: function(arg0) {
            const ret = typeof(getObject(arg0)) === 'function';
            return ret;
        },
        __wbg___wbindgen_is_null_ea9085d691f535d3: function(arg0) {
            const ret = getObject(arg0) === null;
            return ret;
        },
        __wbg___wbindgen_is_string_ea5e6cc2e4141dfe: function(arg0) {
            const ret = typeof(getObject(arg0)) === 'string';
            return ret;
        },
        __wbg___wbindgen_is_undefined_c05833b95a3cf397: function(arg0) {
            const ret = getObject(arg0) === undefined;
            return ret;
        },
        __wbg___wbindgen_memory_de265df8aadd6273: function() {
            const ret = wasm.memory;
            return addHeapObject(ret);
        },
        __wbg___wbindgen_number_get_394265ed1e1b84ee: function(arg0, arg1) {
            const obj = getObject(arg1);
            const ret = typeof(obj) === 'number' ? obj : undefined;
            getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_string_get_b0ca35b86a603356: function(arg0, arg1) {
            const obj = getObject(arg1);
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_throw_344f42d3211c4765: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg__wbg_cb_unref_fffb441def202758: function(arg0) {
            getObject(arg0)._wbg_cb_unref();
        },
        __wbg_activeTexture_92b04d918019d603: function(arg0, arg1) {
            getObject(arg0).activeTexture(arg1 >>> 0);
        },
        __wbg_activeTexture_d12958674e97a118: function(arg0, arg1) {
            getObject(arg0).activeTexture(arg1 >>> 0);
        },
        __wbg_apply_23dd4d2439189415: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = Reflect.apply(getObject(arg0), getObject(arg1), getObject(arg2));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_attachShader_5f7f4077e124e23b: function(arg0, arg1, arg2) {
            getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
        },
        __wbg_attachShader_8971266b4c9bc514: function(arg0, arg1, arg2) {
            getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
        },
        __wbg_beginComputePass_431a159006c13c7c: function(arg0, arg1) {
            const ret = getObject(arg0).beginComputePass(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_beginQuery_042a1f99e870066c: function(arg0, arg1, arg2) {
            getObject(arg0).beginQuery(arg1 >>> 0, getObject(arg2));
        },
        __wbg_beginRenderPass_aa22c432e793359a: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).beginRenderPass(getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_bindAttribLocation_0fe5da7e01ac0d15: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).bindAttribLocation(getObject(arg1), arg2 >>> 0, getStringFromWasm0(arg3, arg4));
        },
        __wbg_bindAttribLocation_94202d7a59ab7863: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).bindAttribLocation(getObject(arg1), arg2 >>> 0, getStringFromWasm0(arg3, arg4));
        },
        __wbg_bindBufferBase_4d761d76138d5494: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).bindBufferBase(arg1 >>> 0, arg2 >>> 0, getObject(arg3));
        },
        __wbg_bindBufferRange_f5c29912db0476e9: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).bindBufferRange(arg1 >>> 0, arg2 >>> 0, getObject(arg3), arg4, arg5);
        },
        __wbg_bindBuffer_1e00cfb4321ef9a4: function(arg0, arg1, arg2) {
            getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
        },
        __wbg_bindBuffer_a01497b1abdcdd9a: function(arg0, arg1, arg2) {
            getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
        },
        __wbg_bindFramebuffer_390311eff3896937: function(arg0, arg1, arg2) {
            getObject(arg0).bindFramebuffer(arg1 >>> 0, getObject(arg2));
        },
        __wbg_bindFramebuffer_658e4b06f7ee8bb4: function(arg0, arg1, arg2) {
            getObject(arg0).bindFramebuffer(arg1 >>> 0, getObject(arg2));
        },
        __wbg_bindRenderbuffer_75e8469e930840fa: function(arg0, arg1, arg2) {
            getObject(arg0).bindRenderbuffer(arg1 >>> 0, getObject(arg2));
        },
        __wbg_bindRenderbuffer_c3d0c4b8cd1c3891: function(arg0, arg1, arg2) {
            getObject(arg0).bindRenderbuffer(arg1 >>> 0, getObject(arg2));
        },
        __wbg_bindSampler_ce608f0de9d31acf: function(arg0, arg1, arg2) {
            getObject(arg0).bindSampler(arg1 >>> 0, getObject(arg2));
        },
        __wbg_bindTexture_28eff4bbd8aaab54: function(arg0, arg1, arg2) {
            getObject(arg0).bindTexture(arg1 >>> 0, getObject(arg2));
        },
        __wbg_bindTexture_9b04b1b7c00d4dd6: function(arg0, arg1, arg2) {
            getObject(arg0).bindTexture(arg1 >>> 0, getObject(arg2));
        },
        __wbg_bindVertexArrayOES_5cad2205a17e8990: function(arg0, arg1) {
            getObject(arg0).bindVertexArrayOES(getObject(arg1));
        },
        __wbg_bindVertexArray_427eeac0c1764d8a: function(arg0, arg1) {
            getObject(arg0).bindVertexArray(getObject(arg1));
        },
        __wbg_blendColor_793b560dc69ddd0b: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).blendColor(arg1, arg2, arg3, arg4);
        },
        __wbg_blendColor_eae0cd578a2c7d15: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).blendColor(arg1, arg2, arg3, arg4);
        },
        __wbg_blendEquationSeparate_043e2f50f6ecb2d3: function(arg0, arg1, arg2) {
            getObject(arg0).blendEquationSeparate(arg1 >>> 0, arg2 >>> 0);
        },
        __wbg_blendEquationSeparate_c7e2b2261c94e1c5: function(arg0, arg1, arg2) {
            getObject(arg0).blendEquationSeparate(arg1 >>> 0, arg2 >>> 0);
        },
        __wbg_blendEquation_455b8986ededabc0: function(arg0, arg1) {
            getObject(arg0).blendEquation(arg1 >>> 0);
        },
        __wbg_blendEquation_f5c5272993f6cb01: function(arg0, arg1) {
            getObject(arg0).blendEquation(arg1 >>> 0);
        },
        __wbg_blendFuncSeparate_37156309688f8f88: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).blendFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
        },
        __wbg_blendFuncSeparate_3ee6d939a9f3938b: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).blendFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
        },
        __wbg_blendFunc_114dc7056ccfeb8d: function(arg0, arg1, arg2) {
            getObject(arg0).blendFunc(arg1 >>> 0, arg2 >>> 0);
        },
        __wbg_blendFunc_a854d7e4459150ba: function(arg0, arg1, arg2) {
            getObject(arg0).blendFunc(arg1 >>> 0, arg2 >>> 0);
        },
        __wbg_blitFramebuffer_a1215976f663b058: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
            getObject(arg0).blitFramebuffer(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0);
        },
        __wbg_bufferData_073a7c6abef7a55f: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
        },
        __wbg_bufferData_3361cdcbebd1d072: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).bufferData(arg1 >>> 0, getArrayU8FromWasm0(arg2, arg3), arg4 >>> 0);
        },
        __wbg_bufferData_3d4f29bdfb1fa46c: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).bufferData(arg1 >>> 0, arg2, arg3 >>> 0);
        },
        __wbg_bufferData_90ef588bac2be2f5: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
        },
        __wbg_bufferData_ce4f44d56e9ddab5: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).bufferData(arg1 >>> 0, arg2, arg3 >>> 0);
        },
        __wbg_bufferSubData_469273b69c860d6d: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).bufferSubData(arg1 >>> 0, arg2, getArrayU8FromWasm0(arg3, arg4));
        },
        __wbg_bufferSubData_bae930b21e9c1c48: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).bufferSubData(arg1 >>> 0, arg2, getObject(arg3));
        },
        __wbg_bufferSubData_ce9854d3d337e2cf: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).bufferSubData(arg1 >>> 0, arg2, getObject(arg3));
        },
        __wbg_buffer_0f212447ac64c53b: function(arg0) {
            const ret = getObject(arg0).buffer;
            return addHeapObject(ret);
        },
        __wbg_byteLength_47eafd0bff4dce39: function(arg0) {
            const ret = getObject(arg0).byteLength;
            return ret;
        },
        __wbg_call_a6e5c5dce5018821: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_checkFramebufferStatus_12fa8186abd75390: function(arg0, arg1) {
            const ret = getObject(arg0).checkFramebufferStatus(arg1 >>> 0);
            return ret;
        },
        __wbg_clearBufferfv_2e0f1a0ea56de859: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).clearBufferfv(arg1 >>> 0, arg2, getArrayF32FromWasm0(arg3, arg4));
        },
        __wbg_clearBufferiv_0360269bf6e34c54: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).clearBufferiv(arg1 >>> 0, arg2, getArrayI32FromWasm0(arg3, arg4));
        },
        __wbg_clearBufferuiv_df94a395d4915377: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).clearBufferuiv(arg1 >>> 0, arg2, getArrayU32FromWasm0(arg3, arg4));
        },
        __wbg_clearColor_9152d82998e32a1e: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).clearColor(arg1, arg2, arg3, arg4);
        },
        __wbg_clearDepth_8b5d226aae155082: function(arg0, arg1) {
            getObject(arg0).clearDepth(arg1);
        },
        __wbg_clearDepth_ca9b22d41551b513: function(arg0, arg1) {
            getObject(arg0).clearDepth(arg1);
        },
        __wbg_clearStencil_58f2af46612bccae: function(arg0, arg1) {
            getObject(arg0).clearStencil(arg1);
        },
        __wbg_clearStencil_a66fe23df6313fc7: function(arg0, arg1) {
            getObject(arg0).clearStencil(arg1);
        },
        __wbg_clear_53d71d234e14e4c1: function(arg0, arg1) {
            getObject(arg0).clear(arg1 >>> 0);
        },
        __wbg_clear_dd06a0da4ce8e13f: function(arg0, arg1) {
            getObject(arg0).clear(arg1 >>> 0);
        },
        __wbg_clientWaitSync_cf8e49f8ba228377: function(arg0, arg1, arg2, arg3) {
            const ret = getObject(arg0).clientWaitSync(getObject(arg1), arg2 >>> 0, arg3 >>> 0);
            return ret;
        },
        __wbg_colorMask_44ebb91cad2502f2: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).colorMask(arg1 !== 0, arg2 !== 0, arg3 !== 0, arg4 !== 0);
        },
        __wbg_colorMask_a4d164c2039b5731: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).colorMask(arg1 !== 0, arg2 !== 0, arg3 !== 0, arg4 !== 0);
        },
        __wbg_compileShader_9bdfd792722cf704: function(arg0, arg1) {
            getObject(arg0).compileShader(getObject(arg1));
        },
        __wbg_compileShader_fc2e4b73240d4fd7: function(arg0, arg1) {
            getObject(arg0).compileShader(getObject(arg1));
        },
        __wbg_compressedTexSubImage2D_c1362291573c7268: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).compressedTexSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8, arg9);
        },
        __wbg_compressedTexSubImage2D_da01674d2975d1ae: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
            getObject(arg0).compressedTexSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, getObject(arg8));
        },
        __wbg_compressedTexSubImage2D_dd6dc580749eb5cf: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
            getObject(arg0).compressedTexSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, getObject(arg8));
        },
        __wbg_compressedTexSubImage3D_04cb8b046c4321fe: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
            getObject(arg0).compressedTexSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10, arg11);
        },
        __wbg_compressedTexSubImage3D_af0228a80ffd5993: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
            getObject(arg0).compressedTexSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, getObject(arg10));
        },
        __wbg_configure_0e4789c0f6b35c8e: function() { return handleError(function (arg0, arg1) {
            getObject(arg0).configure(getObject(arg1));
        }, arguments); },
        __wbg_copyBufferSubData_cdf61f74aa6e0902: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).copyBufferSubData(arg1 >>> 0, arg2 >>> 0, arg3, arg4, arg5);
        },
        __wbg_copyBufferToBuffer_5e2cd8f10ae78183: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).copyBufferToBuffer(getObject(arg1), arg2, getObject(arg3), arg4);
        }, arguments); },
        __wbg_copyBufferToBuffer_ca30deb8de65f5d5: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).copyBufferToBuffer(getObject(arg1), arg2, getObject(arg3), arg4, arg5);
        }, arguments); },
        __wbg_copyTexSubImage2D_8daea651fc408645: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
            getObject(arg0).copyTexSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8);
        },
        __wbg_copyTexSubImage2D_c73f91f1d7022402: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
            getObject(arg0).copyTexSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8);
        },
        __wbg_copyTexSubImage3D_bfe7a14dac9ad777: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).copyTexSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);
        },
        __wbg_createBindGroupLayout_49a7e2b3d076afcf: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).createBindGroupLayout(getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_createBindGroup_655c6e6c0258530e: function(arg0, arg1) {
            const ret = getObject(arg0).createBindGroup(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_createBuffer_01568a9d930d90dd: function(arg0) {
            const ret = getObject(arg0).createBuffer();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createBuffer_0726dd2ab09ea1d2: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).createBuffer(getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_createBuffer_2075765bde5035d5: function(arg0) {
            const ret = getObject(arg0).createBuffer();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createCommandEncoder_ec1f40f0cb4d09df: function(arg0, arg1) {
            const ret = getObject(arg0).createCommandEncoder(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_createComputePipeline_2545c47f08715810: function(arg0, arg1) {
            const ret = getObject(arg0).createComputePipeline(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_createFramebuffer_b24d2c80a8b9e7cc: function(arg0) {
            const ret = getObject(arg0).createFramebuffer();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createFramebuffer_de0d521f546e7534: function(arg0) {
            const ret = getObject(arg0).createFramebuffer();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createPipelineLayout_2c8cd4528b06c108: function(arg0, arg1) {
            const ret = getObject(arg0).createPipelineLayout(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_createProgram_118becaac3a20318: function(arg0) {
            const ret = getObject(arg0).createProgram();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createProgram_538c9777a4ac084f: function(arg0) {
            const ret = getObject(arg0).createProgram();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createQuery_047c7c524e4ac4f8: function(arg0) {
            const ret = getObject(arg0).createQuery();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createRenderPipeline_cf98d4d699bfb03c: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).createRenderPipeline(getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_createRenderbuffer_71af5c0d615e9271: function(arg0) {
            const ret = getObject(arg0).createRenderbuffer();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createRenderbuffer_9d801bf44c314f44: function(arg0) {
            const ret = getObject(arg0).createRenderbuffer();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createSampler_70c8392d98896235: function(arg0) {
            const ret = getObject(arg0).createSampler();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createSampler_c8ffb3c8d565f704: function(arg0, arg1) {
            const ret = getObject(arg0).createSampler(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_createShaderModule_2e44fc7677c6288b: function(arg0, arg1) {
            const ret = getObject(arg0).createShaderModule(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_createShader_78bc8b7e9a88e1a8: function(arg0, arg1) {
            const ret = getObject(arg0).createShader(arg1 >>> 0);
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createShader_7d139f2d50f77365: function(arg0, arg1) {
            const ret = getObject(arg0).createShader(arg1 >>> 0);
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createTexture_0ee0fa5f924f3d14: function(arg0) {
            const ret = getObject(arg0).createTexture();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createTexture_1bac74c999b8a48e: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).createTexture(getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_createTexture_d13f98e0d3d912f4: function(arg0) {
            const ret = getObject(arg0).createTexture();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createVertexArrayOES_2fa3e59eebd5f674: function(arg0) {
            const ret = getObject(arg0).createVertexArrayOES();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createVertexArray_baf9eef7ea5a2c7a: function(arg0) {
            const ret = getObject(arg0).createVertexArray();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createView_ceaf2f5881adbd34: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).createView(getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_cullFace_62bbea3bef0e6b99: function(arg0, arg1) {
            getObject(arg0).cullFace(arg1 >>> 0);
        },
        __wbg_cullFace_f1c75ae19b07eaf3: function(arg0, arg1) {
            getObject(arg0).cullFace(arg1 >>> 0);
        },
        __wbg_deleteBuffer_08eb938e35c27967: function(arg0, arg1) {
            getObject(arg0).deleteBuffer(getObject(arg1));
        },
        __wbg_deleteBuffer_1ca3ffe668a488e7: function(arg0, arg1) {
            getObject(arg0).deleteBuffer(getObject(arg1));
        },
        __wbg_deleteFramebuffer_963cd69957209d37: function(arg0, arg1) {
            getObject(arg0).deleteFramebuffer(getObject(arg1));
        },
        __wbg_deleteFramebuffer_d1a36e889b009344: function(arg0, arg1) {
            getObject(arg0).deleteFramebuffer(getObject(arg1));
        },
        __wbg_deleteProgram_09bd45a51105b2f6: function(arg0, arg1) {
            getObject(arg0).deleteProgram(getObject(arg1));
        },
        __wbg_deleteProgram_132e191baa9fa84f: function(arg0, arg1) {
            getObject(arg0).deleteProgram(getObject(arg1));
        },
        __wbg_deleteQuery_0d1dcc4402a86ee1: function(arg0, arg1) {
            getObject(arg0).deleteQuery(getObject(arg1));
        },
        __wbg_deleteRenderbuffer_52bdbf5ab2cbe62a: function(arg0, arg1) {
            getObject(arg0).deleteRenderbuffer(getObject(arg1));
        },
        __wbg_deleteRenderbuffer_ca999f7883b777af: function(arg0, arg1) {
            getObject(arg0).deleteRenderbuffer(getObject(arg1));
        },
        __wbg_deleteSampler_0abb528566c4ab3b: function(arg0, arg1) {
            getObject(arg0).deleteSampler(getObject(arg1));
        },
        __wbg_deleteShader_3120790d36063afe: function(arg0, arg1) {
            getObject(arg0).deleteShader(getObject(arg1));
        },
        __wbg_deleteShader_993edb4beb3c4d53: function(arg0, arg1) {
            getObject(arg0).deleteShader(getObject(arg1));
        },
        __wbg_deleteSync_9b0e43580942a0f6: function(arg0, arg1) {
            getObject(arg0).deleteSync(getObject(arg1));
        },
        __wbg_deleteTexture_2b163b157ea1be24: function(arg0, arg1) {
            getObject(arg0).deleteTexture(getObject(arg1));
        },
        __wbg_deleteTexture_bdc2202d7a50dcea: function(arg0, arg1) {
            getObject(arg0).deleteTexture(getObject(arg1));
        },
        __wbg_deleteVertexArrayOES_7fa59c32cfdfa6fa: function(arg0, arg1) {
            getObject(arg0).deleteVertexArrayOES(getObject(arg1));
        },
        __wbg_deleteVertexArray_475d4e969aac1dd0: function(arg0, arg1) {
            getObject(arg0).deleteVertexArray(getObject(arg1));
        },
        __wbg_depthFunc_455cfeb8a9d2fb4c: function(arg0, arg1) {
            getObject(arg0).depthFunc(arg1 >>> 0);
        },
        __wbg_depthFunc_74a8f8acf8973c86: function(arg0, arg1) {
            getObject(arg0).depthFunc(arg1 >>> 0);
        },
        __wbg_depthMask_4bd6c73b1339d257: function(arg0, arg1) {
            getObject(arg0).depthMask(arg1 !== 0);
        },
        __wbg_depthMask_a644a67deced3257: function(arg0, arg1) {
            getObject(arg0).depthMask(arg1 !== 0);
        },
        __wbg_depthRange_38b2287ffbea14fd: function(arg0, arg1, arg2) {
            getObject(arg0).depthRange(arg1, arg2);
        },
        __wbg_depthRange_5e90d4d236280ff5: function(arg0, arg1, arg2) {
            getObject(arg0).depthRange(arg1, arg2);
        },
        __wbg_description_02485704e69b1e7f: function(arg0, arg1) {
            const ret = getObject(arg1).description;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_destroy_fe937f756bf8df37: function(arg0) {
            getObject(arg0).destroy();
        },
        __wbg_disableVertexAttribArray_160060fbd7e97de0: function(arg0, arg1) {
            getObject(arg0).disableVertexAttribArray(arg1 >>> 0);
        },
        __wbg_disableVertexAttribArray_c7915eb0de6dd8f1: function(arg0, arg1) {
            getObject(arg0).disableVertexAttribArray(arg1 >>> 0);
        },
        __wbg_disable_1659d1b7d50c31e7: function(arg0, arg1) {
            getObject(arg0).disable(arg1 >>> 0);
        },
        __wbg_disable_40c3975167c1ee07: function(arg0, arg1) {
            getObject(arg0).disable(arg1 >>> 0);
        },
        __wbg_dispatchWorkgroups_afb2344298c62227: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).dispatchWorkgroups(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0);
        },
        __wbg_document_179650d6cb13c263: function(arg0) {
            const ret = getObject(arg0).document;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_drawArraysInstancedANGLE_d58dbd2d38fdebaa: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).drawArraysInstancedANGLE(arg1 >>> 0, arg2, arg3, arg4);
        },
        __wbg_drawArraysInstanced_51b161548a3f10c4: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).drawArraysInstanced(arg1 >>> 0, arg2, arg3, arg4);
        },
        __wbg_drawArrays_676becae0149ed65: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).drawArrays(arg1 >>> 0, arg2, arg3);
        },
        __wbg_drawArrays_b0c59a6e158122f2: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).drawArrays(arg1 >>> 0, arg2, arg3);
        },
        __wbg_drawBuffersWEBGL_c9b47f7f207125cf: function(arg0, arg1) {
            getObject(arg0).drawBuffersWEBGL(getObject(arg1));
        },
        __wbg_drawBuffers_1c1ec9b292442a2a: function(arg0, arg1) {
            getObject(arg0).drawBuffers(getObject(arg1));
        },
        __wbg_drawElementsInstancedANGLE_9b58c4013373b180: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).drawElementsInstancedANGLE(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
        },
        __wbg_drawElementsInstanced_c7f96ea02e6d5326: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).drawElementsInstanced(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
        },
        __wbg_drawIndirect_b0fda25219a273bb: function(arg0, arg1, arg2) {
            getObject(arg0).drawIndirect(getObject(arg1), arg2);
        },
        __wbg_draw_6877f98847e1e36c: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).draw(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
        },
        __wbg_enableVertexAttribArray_4c08219124740f14: function(arg0, arg1) {
            getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
        },
        __wbg_enableVertexAttribArray_7470ba2dcf2606e3: function(arg0, arg1) {
            getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
        },
        __wbg_enable_28bbeed576131d1f: function(arg0, arg1) {
            getObject(arg0).enable(arg1 >>> 0);
        },
        __wbg_enable_611804c0ac1504ce: function(arg0, arg1) {
            getObject(arg0).enable(arg1 >>> 0);
        },
        __wbg_endQuery_a50f7fc49cfe56e9: function(arg0, arg1) {
            getObject(arg0).endQuery(arg1 >>> 0);
        },
        __wbg_end_c36889de8ddef882: function(arg0) {
            getObject(arg0).end();
        },
        __wbg_end_f99ebed53d4e198a: function(arg0) {
            getObject(arg0).end();
        },
        __wbg_error_744744ff0c9861e6: function(arg0) {
            console.error(getObject(arg0));
        },
        __wbg_error_a6fa202b58aa1cd3: function(arg0, arg1) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                console.error(getStringFromWasm0(arg0, arg1));
            } finally {
                wasm.__wbindgen_export4(deferred0_0, deferred0_1, 1);
            }
        },
        __wbg_fenceSync_fe2cdba4a0d73679: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).fenceSync(arg1 >>> 0, arg2 >>> 0);
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_finish_126e6f2ac71e3096: function(arg0) {
            getObject(arg0).finish();
        },
        __wbg_finish_4d91de5e927dd13f: function(arg0, arg1) {
            const ret = getObject(arg0).finish(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_finish_6e06b68ab68cd9f6: function(arg0) {
            const ret = getObject(arg0).finish();
            return addHeapObject(ret);
        },
        __wbg_finish_cbe7ec8675dd7705: function(arg0) {
            getObject(arg0).finish();
        },
        __wbg_flush_db77b4a63d6b337d: function(arg0) {
            getObject(arg0).flush();
        },
        __wbg_flush_e03c08da6863b5ab: function(arg0) {
            getObject(arg0).flush();
        },
        __wbg_framebufferRenderbuffer_4404cf9f9cb76937: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).framebufferRenderbuffer(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4));
        },
        __wbg_framebufferRenderbuffer_ba8bd5e008ee87eb: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).framebufferRenderbuffer(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4));
        },
        __wbg_framebufferTexture2D_3c2abd606fc53f31: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).framebufferTexture2D(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4), arg5);
        },
        __wbg_framebufferTexture2D_e1fb64212fcda219: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).framebufferTexture2D(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4), arg5);
        },
        __wbg_framebufferTextureLayer_f2d9db097bfbb863: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).framebufferTextureLayer(arg1 >>> 0, arg2 >>> 0, getObject(arg3), arg4, arg5);
        },
        __wbg_framebufferTextureMultiviewOVR_28d492b9dc484220: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            getObject(arg0).framebufferTextureMultiviewOVR(arg1 >>> 0, arg2 >>> 0, getObject(arg3), arg4, arg5, arg6);
        },
        __wbg_frontFace_29ef7151de8b5ed9: function(arg0, arg1) {
            getObject(arg0).frontFace(arg1 >>> 0);
        },
        __wbg_frontFace_fc6d98dafa42de87: function(arg0, arg1) {
            getObject(arg0).frontFace(arg1 >>> 0);
        },
        __wbg_getBufferSubData_11018928c908ac2c: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).getBufferSubData(arg1 >>> 0, arg2, getObject(arg3));
        },
        __wbg_getContext_7476e39fa008047e: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2), getObject(arg3));
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        }, arguments); },
        __wbg_getContext_ca12bb65aab778a4: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2), getObject(arg3));
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        }, arguments); },
        __wbg_getContext_e79ddf6a9cb3cc76: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2));
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        }, arguments); },
        __wbg_getContext_fd298c901058eb31: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2));
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        }, arguments); },
        __wbg_getCurrentTexture_20714d1bd9051cab: function() { return handleError(function (arg0) {
            const ret = getObject(arg0).getCurrentTexture();
            return addHeapObject(ret);
        }, arguments); },
        __wbg_getError_791330db4fe43dc2: function(arg0) {
            const ret = getObject(arg0).getError();
            return ret;
        },
        __wbg_getExtension_101c7e41de3e4d90: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg0).getExtension(getStringFromWasm0(arg1, arg2));
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        }, arguments); },
        __wbg_getIndexedParameter_6d7a5bcccaa0f3e2: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg0).getIndexedParameter(arg1 >>> 0, arg2 >>> 0);
            return addHeapObject(ret);
        }, arguments); },
        __wbg_getMappedRange_d0bf3141224111b6: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg0).getMappedRange(arg1, arg2);
            return addHeapObject(ret);
        }, arguments); },
        __wbg_getParameter_039a5899307fab55: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).getParameter(arg1 >>> 0);
            return addHeapObject(ret);
        }, arguments); },
        __wbg_getParameter_d39f59581389af1b: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).getParameter(arg1 >>> 0);
            return addHeapObject(ret);
        }, arguments); },
        __wbg_getPreferredCanvasFormat_8b57039d1801a506: function(arg0) {
            const ret = getObject(arg0).getPreferredCanvasFormat();
            return (__wbindgen_enum_GpuTextureFormat.indexOf(ret) + 1 || 102) - 1;
        },
        __wbg_getProgramInfoLog_c4762e0513468a26: function(arg0, arg1, arg2) {
            const ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_getProgramInfoLog_d1ce570463a68779: function(arg0, arg1, arg2) {
            const ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_getProgramParameter_b9995b56c258ac86: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
            return addHeapObject(ret);
        },
        __wbg_getProgramParameter_c8d1154fbb3c0890: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
            return addHeapObject(ret);
        },
        __wbg_getQueryParameter_919125495ccb17ca: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).getQueryParameter(getObject(arg1), arg2 >>> 0);
            return addHeapObject(ret);
        },
        __wbg_getShaderInfoLog_5cee2add982c7165: function(arg0, arg1, arg2) {
            const ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_getShaderInfoLog_bc236afe696c1283: function(arg0, arg1, arg2) {
            const ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_getShaderParameter_3394e75dcb97f380: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0);
            return addHeapObject(ret);
        },
        __wbg_getShaderParameter_cbcc0995e8e16214: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0);
            return addHeapObject(ret);
        },
        __wbg_getSupportedExtensions_2a7458ec45e82560: function(arg0) {
            const ret = getObject(arg0).getSupportedExtensions();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_getSupportedProfiles_90a4f330938d0241: function(arg0) {
            const ret = getObject(arg0).getSupportedProfiles();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_getSyncParameter_d8f6c145657a3550: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).getSyncParameter(getObject(arg1), arg2 >>> 0);
            return addHeapObject(ret);
        },
        __wbg_getUniformBlockIndex_cfee6ff6d323c784: function(arg0, arg1, arg2, arg3) {
            const ret = getObject(arg0).getUniformBlockIndex(getObject(arg1), getStringFromWasm0(arg2, arg3));
            return ret;
        },
        __wbg_getUniformLocation_24ef46cdda2148ab: function(arg0, arg1, arg2, arg3) {
            const ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_getUniformLocation_788a34295dd6fabe: function(arg0, arg1, arg2, arg3) {
            const ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_get_78f252d074a84d0b: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.get(getObject(arg0), getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_get_b2053e9bfdf3ca8e: function(arg0, arg1) {
            const ret = getObject(arg0)[arg1 >>> 0];
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_get_unchecked_6e0ad6d2a41b06f6: function(arg0, arg1) {
            const ret = getObject(arg0)[arg1 >>> 0];
            return addHeapObject(ret);
        },
        __wbg_gpu_2ccc250735d24a2a: function(arg0) {
            const ret = getObject(arg0).gpu;
            return addHeapObject(ret);
        },
        __wbg_has_8374cf06984d8bfc: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.has(getObject(arg0), getObject(arg1));
            return ret;
        }, arguments); },
        __wbg_height_6eec812c213259a1: function(arg0) {
            const ret = getObject(arg0).height;
            return ret;
        },
        __wbg_includes_78c9a3115b08eddc: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).includes(getObject(arg1), arg2);
            return ret;
        },
        __wbg_info_cf0d9a286850cd24: function(arg0) {
            const ret = getObject(arg0).info;
            return addHeapObject(ret);
        },
        __wbg_instanceof_ArrayBuffer_4480b9e0068a8adb: function(arg0) {
            let result;
            try {
                result = getObject(arg0) instanceof ArrayBuffer;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_CanvasRenderingContext2d_2284b703b7023dcc: function(arg0) {
            let result;
            try {
                result = getObject(arg0) instanceof CanvasRenderingContext2D;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_HtmlCanvasElement_ed02ed9136056019: function(arg0) {
            let result;
            try {
                result = getObject(arg0) instanceof HTMLCanvasElement;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_Memory_2550e651acb3f2f1: function(arg0) {
            let result;
            try {
                result = getObject(arg0) instanceof WebAssembly.Memory;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_Navigator_51c4c7741403f34f: function(arg0) {
            let result;
            try {
                result = getObject(arg0) instanceof Navigator;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_Promise_4cb210c0b8f8c959: function(arg0) {
            let result;
            try {
                result = getObject(arg0) instanceof Promise;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_WebGl2RenderingContext_90225152e4e3c799: function(arg0) {
            let result;
            try {
                result = getObject(arg0) instanceof WebGL2RenderingContext;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_Window_05ba1ee4f6781663: function(arg0) {
            let result;
            try {
                result = getObject(arg0) instanceof Window;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_invalidateFramebuffer_343bbfb15e6835fd: function() { return handleError(function (arg0, arg1, arg2) {
            getObject(arg0).invalidateFramebuffer(arg1 >>> 0, getObject(arg2));
        }, arguments); },
        __wbg_isContextLost_5181913f0016926b: function(arg0) {
            const ret = getObject(arg0).isContextLost();
            return ret;
        },
        __wbg_isFallbackAdapter_8ccb967428491dcb: function(arg0) {
            const ret = getObject(arg0).isFallbackAdapter;
            return ret;
        },
        __wbg_is_7b9d0b289033c7de: function(arg0, arg1) {
            const ret = Object.is(getObject(arg0), getObject(arg1));
            return ret;
        },
        __wbg_label_7ed42f25f841996b: function(arg0, arg1) {
            const ret = getObject(arg1).label;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_length_1f0964f4a5e2c6d8: function(arg0) {
            const ret = getObject(arg0).length;
            return ret;
        },
        __wbg_length_370319915dc99107: function(arg0) {
            const ret = getObject(arg0).length;
            return ret;
        },
        __wbg_limits_20c6f56636df7d38: function(arg0) {
            const ret = getObject(arg0).limits;
            return addHeapObject(ret);
        },
        __wbg_linkProgram_4e047fb3197a0348: function(arg0, arg1) {
            getObject(arg0).linkProgram(getObject(arg1));
        },
        __wbg_linkProgram_d7c71c539c8c6a43: function(arg0, arg1) {
            getObject(arg0).linkProgram(getObject(arg1));
        },
        __wbg_mapAsync_52b01fa9e8f765fd: function(arg0, arg1, arg2, arg3) {
            const ret = getObject(arg0).mapAsync(arg1 >>> 0, arg2, arg3);
            return addHeapObject(ret);
        },
        __wbg_matchMedia_9968278b31706f78: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg0).matchMedia(getStringFromWasm0(arg1, arg2));
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        }, arguments); },
        __wbg_matches_978994974df1e85b: function(arg0) {
            const ret = getObject(arg0).matches;
            return ret;
        },
        __wbg_maxBindGroupsPlusVertexBuffers_33e5006b23e20478: function(arg0) {
            const ret = getObject(arg0).maxBindGroupsPlusVertexBuffers;
            return ret;
        },
        __wbg_maxBindGroups_f6d26f3a67826666: function(arg0) {
            const ret = getObject(arg0).maxBindGroups;
            return ret;
        },
        __wbg_maxBindingsPerBindGroup_edab2e8dabbf6060: function(arg0) {
            const ret = getObject(arg0).maxBindingsPerBindGroup;
            return ret;
        },
        __wbg_maxBufferSize_bbc69284c14aa7da: function(arg0) {
            const ret = getObject(arg0).maxBufferSize;
            return ret;
        },
        __wbg_maxColorAttachmentBytesPerSample_63ebe4f81de2f34c: function(arg0) {
            const ret = getObject(arg0).maxColorAttachmentBytesPerSample;
            return ret;
        },
        __wbg_maxColorAttachments_aed8c38beabf3a5c: function(arg0) {
            const ret = getObject(arg0).maxColorAttachments;
            return ret;
        },
        __wbg_maxComputeInvocationsPerWorkgroup_2d964564c37f1c65: function(arg0) {
            const ret = getObject(arg0).maxComputeInvocationsPerWorkgroup;
            return ret;
        },
        __wbg_maxComputeWorkgroupSizeX_a3e3206570da184f: function(arg0) {
            const ret = getObject(arg0).maxComputeWorkgroupSizeX;
            return ret;
        },
        __wbg_maxComputeWorkgroupSizeY_dffa4a62244b7563: function(arg0) {
            const ret = getObject(arg0).maxComputeWorkgroupSizeY;
            return ret;
        },
        __wbg_maxComputeWorkgroupSizeZ_976ebcb760f6d07d: function(arg0) {
            const ret = getObject(arg0).maxComputeWorkgroupSizeZ;
            return ret;
        },
        __wbg_maxComputeWorkgroupStorageSize_2e8dbece6e532e2a: function(arg0) {
            const ret = getObject(arg0).maxComputeWorkgroupStorageSize;
            return ret;
        },
        __wbg_maxComputeWorkgroupsPerDimension_bb7d36b4d20c80f4: function(arg0) {
            const ret = getObject(arg0).maxComputeWorkgroupsPerDimension;
            return ret;
        },
        __wbg_maxDynamicStorageBuffersPerPipelineLayout_1ca859cb96a414e0: function(arg0) {
            const ret = getObject(arg0).maxDynamicStorageBuffersPerPipelineLayout;
            return ret;
        },
        __wbg_maxDynamicUniformBuffersPerPipelineLayout_e968f2c8cd8f4d46: function(arg0) {
            const ret = getObject(arg0).maxDynamicUniformBuffersPerPipelineLayout;
            return ret;
        },
        __wbg_maxInterStageShaderVariables_138ac882c4d6a3d3: function(arg0) {
            const ret = getObject(arg0).maxInterStageShaderVariables;
            return ret;
        },
        __wbg_maxSampledTexturesPerShaderStage_bb3e6b2698321fa6: function(arg0) {
            const ret = getObject(arg0).maxSampledTexturesPerShaderStage;
            return ret;
        },
        __wbg_maxSamplersPerShaderStage_98c00a1829fa414b: function(arg0) {
            const ret = getObject(arg0).maxSamplersPerShaderStage;
            return ret;
        },
        __wbg_maxStorageBufferBindingSize_e500e31f479e669e: function(arg0) {
            const ret = getObject(arg0).maxStorageBufferBindingSize;
            return ret;
        },
        __wbg_maxStorageBuffersPerShaderStage_eb663f6d7521b6a7: function(arg0) {
            const ret = getObject(arg0).maxStorageBuffersPerShaderStage;
            return ret;
        },
        __wbg_maxStorageTexturesPerShaderStage_bb3ad93b53e618c0: function(arg0) {
            const ret = getObject(arg0).maxStorageTexturesPerShaderStage;
            return ret;
        },
        __wbg_maxTextureArrayLayers_2a56d05fb261c99a: function(arg0) {
            const ret = getObject(arg0).maxTextureArrayLayers;
            return ret;
        },
        __wbg_maxTextureDimension1D_84590c1d4770d319: function(arg0) {
            const ret = getObject(arg0).maxTextureDimension1D;
            return ret;
        },
        __wbg_maxTextureDimension2D_7f2b5c8b2727e3fc: function(arg0) {
            const ret = getObject(arg0).maxTextureDimension2D;
            return ret;
        },
        __wbg_maxTextureDimension3D_7f3babddf55c32a6: function(arg0) {
            const ret = getObject(arg0).maxTextureDimension3D;
            return ret;
        },
        __wbg_maxUniformBufferBindingSize_d80a09e23c0b284c: function(arg0) {
            const ret = getObject(arg0).maxUniformBufferBindingSize;
            return ret;
        },
        __wbg_maxUniformBuffersPerShaderStage_0b8b2de676fa740e: function(arg0) {
            const ret = getObject(arg0).maxUniformBuffersPerShaderStage;
            return ret;
        },
        __wbg_maxVertexAttributes_a693dd921316649b: function(arg0) {
            const ret = getObject(arg0).maxVertexAttributes;
            return ret;
        },
        __wbg_maxVertexBufferArrayStride_f256d91f281076cb: function(arg0) {
            const ret = getObject(arg0).maxVertexBufferArrayStride;
            return ret;
        },
        __wbg_maxVertexBuffers_70ab564b25d5ac20: function(arg0) {
            const ret = getObject(arg0).maxVertexBuffers;
            return ret;
        },
        __wbg_minStorageBufferOffsetAlignment_3248ed00dcdbf79f: function(arg0) {
            const ret = getObject(arg0).minStorageBufferOffsetAlignment;
            return ret;
        },
        __wbg_minUniformBufferOffsetAlignment_3b9fa4caae03e903: function(arg0) {
            const ret = getObject(arg0).minUniformBufferOffsetAlignment;
            return ret;
        },
        __wbg_navigator_51379c10a84aeec9: function(arg0) {
            const ret = getObject(arg0).navigator;
            return addHeapObject(ret);
        },
        __wbg_navigator_99621db14b3f1099: function(arg0) {
            const ret = getObject(arg0).navigator;
            return addHeapObject(ret);
        },
        __wbg_new_227d7c05414eb861: function() {
            const ret = new Error();
            return addHeapObject(ret);
        },
        __wbg_new_25e75d1f0df4d87a: function() { return handleError(function (arg0, arg1) {
            const ret = new OffscreenCanvas(arg0 >>> 0, arg1 >>> 0);
            return addHeapObject(ret);
        }, arguments); },
        __wbg_new_32b398fb48b6d94a: function() {
            const ret = new Array();
            return addHeapObject(ret);
        },
        __wbg_new_da52cf8fe3429cb2: function() {
            const ret = new Object();
            return addHeapObject(ret);
        },
        __wbg_new_typed_1824d93f294193e5: function(arg0, arg1) {
            try {
                var state0 = {a: arg0, b: arg1};
                var cb0 = (arg0, arg1) => {
                    const a = state0.a;
                    state0.a = 0;
                    try {
                        return __wasm_bindgen_func_elem_7674(a, state0.b, arg0, arg1);
                    } finally {
                        state0.a = a;
                    }
                };
                const ret = new Promise(cb0);
                return addHeapObject(ret);
            } finally {
                state0.a = 0;
            }
        },
        __wbg_new_typed_4148bd5ae72ab3f0: function() {
            const ret = new Object();
            return addHeapObject(ret);
        },
        __wbg_new_with_byte_offset_and_length_54c7724ee3ec7d82: function(arg0, arg1, arg2) {
            const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
            return addHeapObject(ret);
        },
        __wbg_new_with_u8_clamped_array_and_sh_2767e4741c267d25: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            const ret = new ImageData(getClampedArrayU8FromWasm0(arg0, arg1), arg2 >>> 0, arg3 >>> 0);
            return addHeapObject(ret);
        }, arguments); },
        __wbg_now_390768da5ee9e776: function(arg0) {
            const ret = getObject(arg0).now();
            return ret;
        },
        __wbg_of_85f52f8b6491a7ca: function(arg0) {
            const ret = Array.of(getObject(arg0));
            return addHeapObject(ret);
        },
        __wbg_onSubmittedWorkDone_270d6b5a45520e79: function(arg0) {
            const ret = getObject(arg0).onSubmittedWorkDone();
            return addHeapObject(ret);
        },
        __wbg_performance_3ef602e13d6c3b56: function(arg0) {
            const ret = getObject(arg0).performance;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_pixelStorei_2a93b18efde9acf8: function(arg0, arg1, arg2) {
            getObject(arg0).pixelStorei(arg1 >>> 0, arg2);
        },
        __wbg_pixelStorei_c844cd0db4f1fde6: function(arg0, arg1, arg2) {
            getObject(arg0).pixelStorei(arg1 >>> 0, arg2);
        },
        __wbg_polygonOffset_4eb460adf41db6cd: function(arg0, arg1, arg2) {
            getObject(arg0).polygonOffset(arg1, arg2);
        },
        __wbg_polygonOffset_eccb68e40a18f861: function(arg0, arg1, arg2) {
            getObject(arg0).polygonOffset(arg1, arg2);
        },
        __wbg_prototypesetcall_4770620bbe4688a0: function(arg0, arg1, arg2) {
            Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), getObject(arg2));
        },
        __wbg_push_d2ae3af0c1217ae6: function(arg0, arg1) {
            const ret = getObject(arg0).push(getObject(arg1));
            return ret;
        },
        __wbg_putImageData_a4dee11e08ab9ac8: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            getObject(arg0).putImageData(getObject(arg1), arg2, arg3);
        }, arguments); },
        __wbg_queryCounterEXT_b74a4567ddfeecf0: function(arg0, arg1, arg2) {
            getObject(arg0).queryCounterEXT(getObject(arg1), arg2 >>> 0);
        },
        __wbg_querySelectorAll_7e98cbe256deaadd: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg0).querySelectorAll(getStringFromWasm0(arg1, arg2));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_querySelector_fd7d157ebe17cd16: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg0).querySelector(getStringFromWasm0(arg1, arg2));
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        }, arguments); },
        __wbg_queueMicrotask_0ab5b2d2393e99b9: function(arg0) {
            const ret = getObject(arg0).queueMicrotask;
            return addHeapObject(ret);
        },
        __wbg_queueMicrotask_6a09b7bc46549209: function(arg0) {
            queueMicrotask(getObject(arg0));
        },
        __wbg_queue_adce34608fd0c893: function(arg0) {
            const ret = getObject(arg0).queue;
            return addHeapObject(ret);
        },
        __wbg_readBuffer_4271437a70aae481: function(arg0, arg1) {
            getObject(arg0).readBuffer(arg1 >>> 0);
        },
        __wbg_readPixels_5f013a7d85b23800: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
            getObject(arg0).readPixels(arg1, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, getObject(arg7));
        }, arguments); },
        __wbg_readPixels_82c9dee754d58176: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
            getObject(arg0).readPixels(arg1, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, arg7);
        }, arguments); },
        __wbg_readPixels_c7861e25836bf57b: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
            getObject(arg0).readPixels(arg1, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, getObject(arg7));
        }, arguments); },
        __wbg_renderbufferStorageMultisample_5c6e5d20c0eaa6ba: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).renderbufferStorageMultisample(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
        },
        __wbg_renderbufferStorage_0a8de92542893819: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).renderbufferStorage(arg1 >>> 0, arg2 >>> 0, arg3, arg4);
        },
        __wbg_renderbufferStorage_ab5f745ff8efce3d: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).renderbufferStorage(arg1 >>> 0, arg2 >>> 0, arg3, arg4);
        },
        __wbg_requestAdapter_2e6718811c735a57: function(arg0, arg1) {
            const ret = getObject(arg0).requestAdapter(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_requestDevice_ab46d0519ea1cc34: function(arg0, arg1) {
            const ret = getObject(arg0).requestDevice(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_resolve_2191a4dfe481c25b: function(arg0) {
            const ret = Promise.resolve(getObject(arg0));
            return addHeapObject(ret);
        },
        __wbg_rource_new: function(arg0) {
            const ret = Rource.__wrap(arg0);
            return addHeapObject(ret);
        },
        __wbg_samplerParameterf_0b3308eeb1faa3a1: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).samplerParameterf(getObject(arg1), arg2 >>> 0, arg3);
        },
        __wbg_samplerParameteri_7b1b4091de49aabb: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).samplerParameteri(getObject(arg1), arg2 >>> 0, arg3);
        },
        __wbg_scissor_105e756596bc35df: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).scissor(arg1, arg2, arg3, arg4);
        },
        __wbg_scissor_573b844152316b8d: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).scissor(arg1, arg2, arg3, arg4);
        },
        __wbg_setBindGroup_268fd1714fff0ef5: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            getObject(arg0).setBindGroup(arg1 >>> 0, getObject(arg2), getArrayU32FromWasm0(arg3, arg4), arg5, arg6 >>> 0);
        }, arguments); },
        __wbg_setBindGroup_3e4ce136bc833ea1: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            getObject(arg0).setBindGroup(arg1 >>> 0, getObject(arg2), getArrayU32FromWasm0(arg3, arg4), arg5, arg6 >>> 0);
        }, arguments); },
        __wbg_setBindGroup_c22a1b95c0b17f37: function(arg0, arg1, arg2) {
            getObject(arg0).setBindGroup(arg1 >>> 0, getObject(arg2));
        },
        __wbg_setBindGroup_f0de6cb2c7dbfc2c: function(arg0, arg1, arg2) {
            getObject(arg0).setBindGroup(arg1 >>> 0, getObject(arg2));
        },
        __wbg_setPipeline_c41bf46790f27f9e: function(arg0, arg1) {
            getObject(arg0).setPipeline(getObject(arg1));
        },
        __wbg_setPipeline_d73f019e98c76d2d: function(arg0, arg1) {
            getObject(arg0).setPipeline(getObject(arg1));
        },
        __wbg_setScissorRect_42511fefb18b86ef: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).setScissorRect(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
        },
        __wbg_setVertexBuffer_1e448859663dd400: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).setVertexBuffer(arg1 >>> 0, getObject(arg2), arg3);
        },
        __wbg_setVertexBuffer_7cf533d694e747f3: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).setVertexBuffer(arg1 >>> 0, getObject(arg2), arg3, arg4);
        },
        __wbg_set_61e45ae8061eca11: function(arg0, arg1, arg2) {
            getObject(arg0).set(getObject(arg1), arg2 >>> 0);
        },
        __wbg_set_8535240470bf2500: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
            return ret;
        }, arguments); },
        __wbg_set_a_88262a42340d0b1c: function(arg0, arg1) {
            getObject(arg0).a = arg1;
        },
        __wbg_set_access_9a5092f05dc45fad: function(arg0, arg1) {
            getObject(arg0).access = __wbindgen_enum_GpuStorageTextureAccess[arg1];
        },
        __wbg_set_address_mode_u_9e2695575a219e33: function(arg0, arg1) {
            getObject(arg0).addressModeU = __wbindgen_enum_GpuAddressMode[arg1];
        },
        __wbg_set_address_mode_v_f479b2e6cccbcac4: function(arg0, arg1) {
            getObject(arg0).addressModeV = __wbindgen_enum_GpuAddressMode[arg1];
        },
        __wbg_set_address_mode_w_46273e153230180d: function(arg0, arg1) {
            getObject(arg0).addressModeW = __wbindgen_enum_GpuAddressMode[arg1];
        },
        __wbg_set_alpha_bfd2df62e7bc581b: function(arg0, arg1) {
            getObject(arg0).alpha = getObject(arg1);
        },
        __wbg_set_alpha_mode_df805952892caa9c: function(arg0, arg1) {
            getObject(arg0).alphaMode = __wbindgen_enum_GpuCanvasAlphaMode[arg1];
        },
        __wbg_set_alpha_to_coverage_enabled_8b5dc2b0a225b3b2: function(arg0, arg1) {
            getObject(arg0).alphaToCoverageEnabled = arg1 !== 0;
        },
        __wbg_set_array_layer_count_7312f0f31af94e7c: function(arg0, arg1) {
            getObject(arg0).arrayLayerCount = arg1 >>> 0;
        },
        __wbg_set_array_stride_f64_27ffaf4fffd74e61: function(arg0, arg1) {
            getObject(arg0).arrayStride = arg1;
        },
        __wbg_set_aspect_0d453bca3d012f02: function(arg0, arg1) {
            getObject(arg0).aspect = __wbindgen_enum_GpuTextureAspect[arg1];
        },
        __wbg_set_aspect_4962514fe99e68e6: function(arg0, arg1) {
            getObject(arg0).aspect = __wbindgen_enum_GpuTextureAspect[arg1];
        },
        __wbg_set_attributes_7537844a7e6dafdc: function(arg0, arg1, arg2) {
            getObject(arg0).attributes = getArrayJsValueViewFromWasm0(arg1, arg2);
        },
        __wbg_set_b_c47befe0af3261eb: function(arg0, arg1) {
            getObject(arg0).b = arg1;
        },
        __wbg_set_base_array_layer_f176bb9f1b37b342: function(arg0, arg1) {
            getObject(arg0).baseArrayLayer = arg1 >>> 0;
        },
        __wbg_set_base_mip_level_1df145d9f8db32a9: function(arg0, arg1) {
            getObject(arg0).baseMipLevel = arg1 >>> 0;
        },
        __wbg_set_beginning_of_pass_write_index_0d4fa06109208ad7: function(arg0, arg1) {
            getObject(arg0).beginningOfPassWriteIndex = arg1 >>> 0;
        },
        __wbg_set_beginning_of_pass_write_index_e9f5d016947893bd: function(arg0, arg1) {
            getObject(arg0).beginningOfPassWriteIndex = arg1 >>> 0;
        },
        __wbg_set_bind_group_layouts_5a9cfea401c020ab: function(arg0, arg1, arg2) {
            getObject(arg0).bindGroupLayouts = getArrayJsValueViewFromWasm0(arg1, arg2);
        },
        __wbg_set_binding_155b0440b4307793: function(arg0, arg1) {
            getObject(arg0).binding = arg1 >>> 0;
        },
        __wbg_set_binding_f74df3510792aba1: function(arg0, arg1) {
            getObject(arg0).binding = arg1 >>> 0;
        },
        __wbg_set_blend_7493c2066c3e9970: function(arg0, arg1) {
            getObject(arg0).blend = getObject(arg1);
        },
        __wbg_set_buffer_c3410572051920ba: function(arg0, arg1) {
            getObject(arg0).buffer = getObject(arg1);
        },
        __wbg_set_buffer_ef7f75306cf663ed: function(arg0, arg1) {
            getObject(arg0).buffer = getObject(arg1);
        },
        __wbg_set_buffers_7d0d8f507699e956: function(arg0, arg1, arg2) {
            getObject(arg0).buffers = getArrayJsValueViewFromWasm0(arg1, arg2);
        },
        __wbg_set_bytes_per_row_d69b88eee3929c07: function(arg0, arg1) {
            getObject(arg0).bytesPerRow = arg1 >>> 0;
        },
        __wbg_set_clear_value_gpu_color_dict_6211425789c76e59: function(arg0, arg1) {
            getObject(arg0).clearValue = getObject(arg1);
        },
        __wbg_set_code_b4f37f81f45b5b25: function(arg0, arg1, arg2) {
            getObject(arg0).code = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_color_83aa977526e88cbb: function(arg0, arg1) {
            getObject(arg0).color = getObject(arg1);
        },
        __wbg_set_color_attachments_581fdb3310e4abfa: function(arg0, arg1, arg2) {
            getObject(arg0).colorAttachments = getArrayJsValueViewFromWasm0(arg1, arg2);
        },
        __wbg_set_compare_cd9b62cdb92eb580: function(arg0, arg1) {
            getObject(arg0).compare = __wbindgen_enum_GpuCompareFunction[arg1];
        },
        __wbg_set_compare_f36b34abfaa08ccb: function(arg0, arg1) {
            getObject(arg0).compare = __wbindgen_enum_GpuCompareFunction[arg1];
        },
        __wbg_set_compute_d0c2d276b6d4b18d: function(arg0, arg1) {
            getObject(arg0).compute = getObject(arg1);
        },
        __wbg_set_count_069a4eac409bac55: function(arg0, arg1) {
            getObject(arg0).count = arg1 >>> 0;
        },
        __wbg_set_cull_mode_fc649853947a3d0c: function(arg0, arg1) {
            getObject(arg0).cullMode = __wbindgen_enum_GpuCullMode[arg1];
        },
        __wbg_set_depth_bias_clamp_1c0d695df7f092e5: function(arg0, arg1) {
            getObject(arg0).depthBiasClamp = arg1;
        },
        __wbg_set_depth_bias_d7cd16096242a657: function(arg0, arg1) {
            getObject(arg0).depthBias = arg1;
        },
        __wbg_set_depth_bias_slope_scale_c4e52ec743ef55ba: function(arg0, arg1) {
            getObject(arg0).depthBiasSlopeScale = arg1;
        },
        __wbg_set_depth_clear_value_beda3ec5b1a5c43a: function(arg0, arg1) {
            getObject(arg0).depthClearValue = arg1;
        },
        __wbg_set_depth_compare_0c8631eb2eae98e3: function(arg0, arg1) {
            getObject(arg0).depthCompare = __wbindgen_enum_GpuCompareFunction[arg1];
        },
        __wbg_set_depth_fail_op_668155ae33d3c06f: function(arg0, arg1) {
            getObject(arg0).depthFailOp = __wbindgen_enum_GpuStencilOperation[arg1];
        },
        __wbg_set_depth_load_op_511c513eab4e56a9: function(arg0, arg1) {
            getObject(arg0).depthLoadOp = __wbindgen_enum_GpuLoadOp[arg1];
        },
        __wbg_set_depth_or_array_layers_89371305ed0bd962: function(arg0, arg1) {
            getObject(arg0).depthOrArrayLayers = arg1 >>> 0;
        },
        __wbg_set_depth_read_only_7f41a74741c144ec: function(arg0, arg1) {
            getObject(arg0).depthReadOnly = arg1 !== 0;
        },
        __wbg_set_depth_stencil_97506c7bea4f53da: function(arg0, arg1) {
            getObject(arg0).depthStencil = getObject(arg1);
        },
        __wbg_set_depth_stencil_attachment_73b79e8b4e948222: function(arg0, arg1) {
            getObject(arg0).depthStencilAttachment = getObject(arg1);
        },
        __wbg_set_depth_store_op_c89f33b39b43361c: function(arg0, arg1) {
            getObject(arg0).depthStoreOp = __wbindgen_enum_GpuStoreOp[arg1];
        },
        __wbg_set_depth_write_enabled_ce89750042940350: function(arg0, arg1) {
            getObject(arg0).depthWriteEnabled = arg1 !== 0;
        },
        __wbg_set_device_e275d1d4f3c9eb74: function(arg0, arg1) {
            getObject(arg0).device = getObject(arg1);
        },
        __wbg_set_dimension_868eee80f4b90011: function(arg0, arg1) {
            getObject(arg0).dimension = __wbindgen_enum_GpuTextureDimension[arg1];
        },
        __wbg_set_dimension_e325282e613ca0a4: function(arg0, arg1) {
            getObject(arg0).dimension = __wbindgen_enum_GpuTextureViewDimension[arg1];
        },
        __wbg_set_dst_factor_ec7407f19be1aff9: function(arg0, arg1) {
            getObject(arg0).dstFactor = __wbindgen_enum_GpuBlendFactor[arg1];
        },
        __wbg_set_end_of_pass_write_index_0d546e46b86ea069: function(arg0, arg1) {
            getObject(arg0).endOfPassWriteIndex = arg1 >>> 0;
        },
        __wbg_set_end_of_pass_write_index_49a6ddbb2b888bfa: function(arg0, arg1) {
            getObject(arg0).endOfPassWriteIndex = arg1 >>> 0;
        },
        __wbg_set_entries_86a29dd6291c95e7: function(arg0, arg1, arg2) {
            getObject(arg0).entries = getArrayJsValueViewFromWasm0(arg1, arg2);
        },
        __wbg_set_entries_a12aca1e458b0456: function(arg0, arg1, arg2) {
            getObject(arg0).entries = getArrayJsValueViewFromWasm0(arg1, arg2);
        },
        __wbg_set_entry_point_207540f042015ce5: function(arg0, arg1, arg2) {
            getObject(arg0).entryPoint = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_entry_point_5f26aacbe4c545eb: function(arg0, arg1, arg2) {
            getObject(arg0).entryPoint = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_entry_point_e87e79251dd3144f: function(arg0, arg1, arg2) {
            getObject(arg0).entryPoint = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_external_texture_386483d8dd82ab56: function(arg0, arg1) {
            getObject(arg0).externalTexture = getObject(arg1);
        },
        __wbg_set_fail_op_92f716dbc88b6973: function(arg0, arg1) {
            getObject(arg0).failOp = __wbindgen_enum_GpuStencilOperation[arg1];
        },
        __wbg_set_format_1fcaa7d60546b490: function(arg0, arg1) {
            getObject(arg0).format = __wbindgen_enum_GpuTextureFormat[arg1];
        },
        __wbg_set_format_2c1414a817c213f8: function(arg0, arg1) {
            getObject(arg0).format = __wbindgen_enum_GpuTextureFormat[arg1];
        },
        __wbg_set_format_533f9ffa7eef563d: function(arg0, arg1) {
            getObject(arg0).format = __wbindgen_enum_GpuTextureFormat[arg1];
        },
        __wbg_set_format_5d2f25cc93654ecc: function(arg0, arg1) {
            getObject(arg0).format = __wbindgen_enum_GpuVertexFormat[arg1];
        },
        __wbg_set_format_5ff53724ed6cedf2: function(arg0, arg1) {
            getObject(arg0).format = __wbindgen_enum_GpuTextureFormat[arg1];
        },
        __wbg_set_format_815efd4dc4817bbb: function(arg0, arg1) {
            getObject(arg0).format = __wbindgen_enum_GpuTextureFormat[arg1];
        },
        __wbg_set_format_e52bdcca880d2c8e: function(arg0, arg1) {
            getObject(arg0).format = __wbindgen_enum_GpuTextureFormat[arg1];
        },
        __wbg_set_fragment_8b780f00a0b0e6f3: function(arg0, arg1) {
            getObject(arg0).fragment = getObject(arg1);
        },
        __wbg_set_front_face_28ffdf524eedce5b: function(arg0, arg1) {
            getObject(arg0).frontFace = __wbindgen_enum_GpuFrontFace[arg1];
        },
        __wbg_set_g_5983abfc46e0cf4e: function(arg0, arg1) {
            getObject(arg0).g = arg1;
        },
        __wbg_set_has_dynamic_offset_62bc230bdb7c54d0: function(arg0, arg1) {
            getObject(arg0).hasDynamicOffset = arg1 !== 0;
        },
        __wbg_set_height_14335c4047cf9c1b: function(arg0, arg1) {
            getObject(arg0).height = arg1 >>> 0;
        },
        __wbg_set_height_7d9d8f892e6964c6: function(arg0, arg1) {
            getObject(arg0).height = arg1 >>> 0;
        },
        __wbg_set_height_bbeef8f354041577: function(arg0, arg1) {
            getObject(arg0).height = arg1 >>> 0;
        },
        __wbg_set_label_08d9be3e4719c226: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_17eb9fe3a02f62b0: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_48e6b787d256f621: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_547d0d4aec39fbe9: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_5ee7427342869829: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_60ad96c811e0d109: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_6db0393d3fdc90a5: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_72bb4f41ef0cb893: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_79387decda299036: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_9556af8b5cda3c9d: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_d010f237b26f2c55: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_e16e2dbe51349c7f: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_e3944e54881b8c50: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_e922700240417ab5: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_ef44793ddf4455c5: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_layout_41021cfd2a2f62df: function(arg0, arg1) {
            getObject(arg0).layout = getObject(arg1);
        },
        __wbg_set_layout_50ab727f44b38f26: function(arg0, arg1) {
            getObject(arg0).layout = getObject(arg1);
        },
        __wbg_set_layout_913d53c17194c989: function(arg0, arg1) {
            getObject(arg0).layout = getObject(arg1);
        },
        __wbg_set_layout_gpu_auto_layout_mode_0a5a185b3d52b726: function(arg0, arg1) {
            getObject(arg0).layout = __wbindgen_enum_GpuAutoLayoutMode[arg1];
        },
        __wbg_set_layout_gpu_auto_layout_mode_aeba193938b47882: function(arg0, arg1) {
            getObject(arg0).layout = __wbindgen_enum_GpuAutoLayoutMode[arg1];
        },
        __wbg_set_load_op_99661da6c4eab9b0: function(arg0, arg1) {
            getObject(arg0).loadOp = __wbindgen_enum_GpuLoadOp[arg1];
        },
        __wbg_set_lod_max_clamp_dd2d9f9f052f4f44: function(arg0, arg1) {
            getObject(arg0).lodMaxClamp = arg1;
        },
        __wbg_set_lod_min_clamp_6d20c97916baeb93: function(arg0, arg1) {
            getObject(arg0).lodMinClamp = arg1;
        },
        __wbg_set_mag_filter_b5adebc99cb938e1: function(arg0, arg1) {
            getObject(arg0).magFilter = __wbindgen_enum_GpuFilterMode[arg1];
        },
        __wbg_set_mapped_at_creation_81b586dc90a50347: function(arg0, arg1) {
            getObject(arg0).mappedAtCreation = arg1 !== 0;
        },
        __wbg_set_mask_70a8a59ce09e5997: function(arg0, arg1) {
            getObject(arg0).mask = arg1 >>> 0;
        },
        __wbg_set_max_anisotropy_2beada0e2db62c45: function(arg0, arg1) {
            getObject(arg0).maxAnisotropy = arg1;
        },
        __wbg_set_min_binding_size_f64_5005a6904cdf43da: function(arg0, arg1) {
            getObject(arg0).minBindingSize = arg1;
        },
        __wbg_set_min_filter_c72f17375e135f0a: function(arg0, arg1) {
            getObject(arg0).minFilter = __wbindgen_enum_GpuFilterMode[arg1];
        },
        __wbg_set_mip_level_count_534caaa7e68e68b8: function(arg0, arg1) {
            getObject(arg0).mipLevelCount = arg1 >>> 0;
        },
        __wbg_set_mip_level_count_776c8c218b65bc08: function(arg0, arg1) {
            getObject(arg0).mipLevelCount = arg1 >>> 0;
        },
        __wbg_set_mip_level_f7ac79e8c54f59ad: function(arg0, arg1) {
            getObject(arg0).mipLevel = arg1 >>> 0;
        },
        __wbg_set_mipmap_filter_5bf66195a3639700: function(arg0, arg1) {
            getObject(arg0).mipmapFilter = __wbindgen_enum_GpuMipmapFilterMode[arg1];
        },
        __wbg_set_mode_9990b3393ba469ae: function(arg0, arg1) {
            getObject(arg0).mode = __wbindgen_enum_GpuCanvasToneMappingMode[arg1];
        },
        __wbg_set_module_5db9b76ee2dd2a59: function(arg0, arg1) {
            getObject(arg0).module = getObject(arg1);
        },
        __wbg_set_module_d0e2098713606cae: function(arg0, arg1) {
            getObject(arg0).module = getObject(arg1);
        },
        __wbg_set_module_f02e076ca7e7daf8: function(arg0, arg1) {
            getObject(arg0).module = getObject(arg1);
        },
        __wbg_set_multisample_37ddafe88b5cd466: function(arg0, arg1) {
            getObject(arg0).multisample = getObject(arg1);
        },
        __wbg_set_multisampled_7913fd7183272840: function(arg0, arg1) {
            getObject(arg0).multisampled = arg1 !== 0;
        },
        __wbg_set_offset_f64_28c24dc15000932e: function(arg0, arg1) {
            getObject(arg0).offset = arg1;
        },
        __wbg_set_offset_f64_89f0ce01a689839e: function(arg0, arg1) {
            getObject(arg0).offset = arg1;
        },
        __wbg_set_offset_f64_fa66068813376ca3: function(arg0, arg1) {
            getObject(arg0).offset = arg1;
        },
        __wbg_set_operation_62ce44e1728c4047: function(arg0, arg1) {
            getObject(arg0).operation = __wbindgen_enum_GpuBlendOperation[arg1];
        },
        __wbg_set_origin_gpu_origin_3d_dict_631c04520718091f: function(arg0, arg1) {
            getObject(arg0).origin = getObject(arg1);
        },
        __wbg_set_pass_op_cf02fa088d6352a7: function(arg0, arg1) {
            getObject(arg0).passOp = __wbindgen_enum_GpuStencilOperation[arg1];
        },
        __wbg_set_power_preference_8fdca0b7af640d49: function(arg0, arg1) {
            getObject(arg0).powerPreference = __wbindgen_enum_GpuPowerPreference[arg1];
        },
        __wbg_set_primitive_43c23761a55b4088: function(arg0, arg1) {
            getObject(arg0).primitive = getObject(arg1);
        },
        __wbg_set_query_set_41de86d2401aee04: function(arg0, arg1) {
            getObject(arg0).querySet = getObject(arg1);
        },
        __wbg_set_query_set_4889dd944d5ec0fd: function(arg0, arg1) {
            getObject(arg0).querySet = getObject(arg1);
        },
        __wbg_set_r_c6f4c68f4804d655: function(arg0, arg1) {
            getObject(arg0).r = arg1;
        },
        __wbg_set_required_features_1baf274a8669db60: function(arg0, arg1, arg2) {
            getObject(arg0).requiredFeatures = getArrayJsValueViewFromWasm0(arg1, arg2);
        },
        __wbg_set_required_limits_871ed33c68613dcb: function(arg0, arg1) {
            getObject(arg0).requiredLimits = getObject(arg1);
        },
        __wbg_set_resolve_target_gpu_texture_view_b19a4f2debf79b96: function(arg0, arg1) {
            getObject(arg0).resolveTarget = getObject(arg1);
        },
        __wbg_set_resource_5ae7b5e67924f234: function(arg0, arg1) {
            getObject(arg0).resource = getObject(arg1);
        },
        __wbg_set_resource_gpu_buffer_binding_e5dbca063e7cb67b: function(arg0, arg1) {
            getObject(arg0).resource = getObject(arg1);
        },
        __wbg_set_resource_gpu_texture_view_eb46c355d51ad7e5: function(arg0, arg1) {
            getObject(arg0).resource = getObject(arg1);
        },
        __wbg_set_rows_per_image_59a813ac5006e10e: function(arg0, arg1) {
            getObject(arg0).rowsPerImage = arg1 >>> 0;
        },
        __wbg_set_sample_count_eb86a8b18545b54f: function(arg0, arg1) {
            getObject(arg0).sampleCount = arg1 >>> 0;
        },
        __wbg_set_sample_type_c32e1dfff94e63eb: function(arg0, arg1) {
            getObject(arg0).sampleType = __wbindgen_enum_GpuTextureSampleType[arg1];
        },
        __wbg_set_sampler_c0e1258543a33bce: function(arg0, arg1) {
            getObject(arg0).sampler = getObject(arg1);
        },
        __wbg_set_shader_location_7e1832a74f912217: function(arg0, arg1) {
            getObject(arg0).shaderLocation = arg1 >>> 0;
        },
        __wbg_set_size_f64_6bcd40704bf4cfdc: function(arg0, arg1) {
            getObject(arg0).size = arg1;
        },
        __wbg_set_size_f64_8b8f6bba5d678162: function(arg0, arg1) {
            getObject(arg0).size = arg1;
        },
        __wbg_set_size_gpu_extent_3d_dict_7e42e1c98fa36434: function(arg0, arg1) {
            getObject(arg0).size = getObject(arg1);
        },
        __wbg_set_src_factor_9bfe84af9b7b5cac: function(arg0, arg1) {
            getObject(arg0).srcFactor = __wbindgen_enum_GpuBlendFactor[arg1];
        },
        __wbg_set_stencil_back_85b22f1db5b1940a: function(arg0, arg1) {
            getObject(arg0).stencilBack = getObject(arg1);
        },
        __wbg_set_stencil_clear_value_42be608809151e2a: function(arg0, arg1) {
            getObject(arg0).stencilClearValue = arg1 >>> 0;
        },
        __wbg_set_stencil_front_525526164a798a44: function(arg0, arg1) {
            getObject(arg0).stencilFront = getObject(arg1);
        },
        __wbg_set_stencil_load_op_31838c036993098a: function(arg0, arg1) {
            getObject(arg0).stencilLoadOp = __wbindgen_enum_GpuLoadOp[arg1];
        },
        __wbg_set_stencil_read_mask_5cc26495e8b3ae82: function(arg0, arg1) {
            getObject(arg0).stencilReadMask = arg1 >>> 0;
        },
        __wbg_set_stencil_read_only_bf1d0c1897e25c62: function(arg0, arg1) {
            getObject(arg0).stencilReadOnly = arg1 !== 0;
        },
        __wbg_set_stencil_store_op_e6be1cbc3a8fc210: function(arg0, arg1) {
            getObject(arg0).stencilStoreOp = __wbindgen_enum_GpuStoreOp[arg1];
        },
        __wbg_set_stencil_write_mask_d9cb40ec4b4bee5b: function(arg0, arg1) {
            getObject(arg0).stencilWriteMask = arg1 >>> 0;
        },
        __wbg_set_step_mode_a97bb24714da41a9: function(arg0, arg1) {
            getObject(arg0).stepMode = __wbindgen_enum_GpuVertexStepMode[arg1];
        },
        __wbg_set_storage_texture_939a097db4b18bd4: function(arg0, arg1) {
            getObject(arg0).storageTexture = getObject(arg1);
        },
        __wbg_set_store_op_b5fdf672436f13f3: function(arg0, arg1) {
            getObject(arg0).storeOp = __wbindgen_enum_GpuStoreOp[arg1];
        },
        __wbg_set_strip_index_format_9f787be6c5fc9e87: function(arg0, arg1) {
            getObject(arg0).stripIndexFormat = __wbindgen_enum_GpuIndexFormat[arg1];
        },
        __wbg_set_targets_c38bd200c836d66f: function(arg0, arg1, arg2) {
            getObject(arg0).targets = getArrayJsValueViewFromWasm0(arg1, arg2);
        },
        __wbg_set_texture_1f64653a5d2d7b4d: function(arg0, arg1) {
            getObject(arg0).texture = getObject(arg1);
        },
        __wbg_set_texture_9dcedde1bb31eda6: function(arg0, arg1) {
            getObject(arg0).texture = getObject(arg1);
        },
        __wbg_set_timestamp_writes_59c2d19ed8aecd97: function(arg0, arg1) {
            getObject(arg0).timestampWrites = getObject(arg1);
        },
        __wbg_set_timestamp_writes_98bed1a8bbc6682d: function(arg0, arg1) {
            getObject(arg0).timestampWrites = getObject(arg1);
        },
        __wbg_set_tone_mapping_b3464f1baa4cff92: function(arg0, arg1) {
            getObject(arg0).toneMapping = getObject(arg1);
        },
        __wbg_set_topology_da25f2cc5af203d2: function(arg0, arg1) {
            getObject(arg0).topology = __wbindgen_enum_GpuPrimitiveTopology[arg1];
        },
        __wbg_set_type_ccf8472d40abcddf: function(arg0, arg1) {
            getObject(arg0).type = __wbindgen_enum_GpuSamplerBindingType[arg1];
        },
        __wbg_set_type_d09829f59932a0fc: function(arg0, arg1) {
            getObject(arg0).type = __wbindgen_enum_GpuBufferBindingType[arg1];
        },
        __wbg_set_unclipped_depth_04524a2b44e1e3c1: function(arg0, arg1) {
            getObject(arg0).unclippedDepth = arg1 !== 0;
        },
        __wbg_set_usage_a137f82ca163b0a9: function(arg0, arg1) {
            getObject(arg0).usage = arg1 >>> 0;
        },
        __wbg_set_usage_b2a2935f37bf3d08: function(arg0, arg1) {
            getObject(arg0).usage = arg1 >>> 0;
        },
        __wbg_set_usage_ba5b0f8b333ab325: function(arg0, arg1) {
            getObject(arg0).usage = arg1 >>> 0;
        },
        __wbg_set_usage_ddd42599bbba7779: function(arg0, arg1) {
            getObject(arg0).usage = arg1 >>> 0;
        },
        __wbg_set_vertex_0be5d146f9ff6f36: function(arg0, arg1) {
            getObject(arg0).vertex = getObject(arg1);
        },
        __wbg_set_view_dimension_0df554032f1f3a85: function(arg0, arg1) {
            getObject(arg0).viewDimension = __wbindgen_enum_GpuTextureViewDimension[arg1];
        },
        __wbg_set_view_dimension_4818d4c18ce5815e: function(arg0, arg1) {
            getObject(arg0).viewDimension = __wbindgen_enum_GpuTextureViewDimension[arg1];
        },
        __wbg_set_view_formats_4347dc8363331086: function(arg0, arg1, arg2) {
            getObject(arg0).viewFormats = getArrayJsValueViewFromWasm0(arg1, arg2);
        },
        __wbg_set_view_formats_5797d2fff3c11808: function(arg0, arg1, arg2) {
            getObject(arg0).viewFormats = getArrayJsValueViewFromWasm0(arg1, arg2);
        },
        __wbg_set_view_gpu_texture_view_9b2d86b6b99d9fd9: function(arg0, arg1) {
            getObject(arg0).view = getObject(arg1);
        },
        __wbg_set_view_gpu_texture_view_c0f35f8857c25206: function(arg0, arg1) {
            getObject(arg0).view = getObject(arg1);
        },
        __wbg_set_visibility_9570b037224c4cc2: function(arg0, arg1) {
            getObject(arg0).visibility = arg1 >>> 0;
        },
        __wbg_set_width_49ac9b7d914afc85: function(arg0, arg1) {
            getObject(arg0).width = arg1 >>> 0;
        },
        __wbg_set_width_8e30d010cd66830d: function(arg0, arg1) {
            getObject(arg0).width = arg1 >>> 0;
        },
        __wbg_set_width_9f685402c2cbee70: function(arg0, arg1) {
            getObject(arg0).width = arg1 >>> 0;
        },
        __wbg_set_write_mask_d45279e56abbfcb5: function(arg0, arg1) {
            getObject(arg0).writeMask = arg1 >>> 0;
        },
        __wbg_set_x_876d592971db129a: function(arg0, arg1) {
            getObject(arg0).x = arg1 >>> 0;
        },
        __wbg_set_y_2b1f5ac0dd5586a5: function(arg0, arg1) {
            getObject(arg0).y = arg1 >>> 0;
        },
        __wbg_set_z_ef005d82bc9d24e3: function(arg0, arg1) {
            getObject(arg0).z = arg1 >>> 0;
        },
        __wbg_shaderSource_4cf90af97621ff49: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm0(arg2, arg3));
        },
        __wbg_shaderSource_c3469dc2221dd528: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm0(arg2, arg3));
        },
        __wbg_stack_3b0d974bbf31e44f: function(arg0, arg1) {
            const ret = getObject(arg1).stack;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_static_accessor_GLOBAL_4ef717fb391d88b7: function() {
            const ret = typeof global === 'undefined' ? null : global;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_static_accessor_GLOBAL_THIS_8d1badc68b5a74f4: function() {
            const ret = typeof globalThis === 'undefined' ? null : globalThis;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_static_accessor_SELF_146583524fe1469b: function() {
            const ret = typeof self === 'undefined' ? null : self;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_static_accessor_WINDOW_f2829a2234d7819e: function() {
            const ret = typeof window === 'undefined' ? null : window;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_stencilFuncSeparate_35136c4e5153406f: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).stencilFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3, arg4 >>> 0);
        },
        __wbg_stencilFuncSeparate_814300446c2969ef: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).stencilFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3, arg4 >>> 0);
        },
        __wbg_stencilMaskSeparate_49367b0b5883a8bd: function(arg0, arg1, arg2) {
            getObject(arg0).stencilMaskSeparate(arg1 >>> 0, arg2 >>> 0);
        },
        __wbg_stencilMaskSeparate_63976cc45fb94d84: function(arg0, arg1, arg2) {
            getObject(arg0).stencilMaskSeparate(arg1 >>> 0, arg2 >>> 0);
        },
        __wbg_stencilMask_1c99b79b516d12dd: function(arg0, arg1) {
            getObject(arg0).stencilMask(arg1 >>> 0);
        },
        __wbg_stencilMask_9a844dc58a89992f: function(arg0, arg1) {
            getObject(arg0).stencilMask(arg1 >>> 0);
        },
        __wbg_stencilOpSeparate_b2cb9af05b803e02: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).stencilOpSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
        },
        __wbg_stencilOpSeparate_c77fcb47561d0aee: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).stencilOpSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
        },
        __wbg_subgroupMaxSize_1527c5f7a8fe91bb: function(arg0) {
            const ret = getObject(arg0).subgroupMaxSize;
            return ret;
        },
        __wbg_subgroupMinSize_d6c5ad4bddc828e9: function(arg0) {
            const ret = getObject(arg0).subgroupMinSize;
            return ret;
        },
        __wbg_submit_ce44115121cd166c: function(arg0, arg1, arg2) {
            getObject(arg0).submit(getArrayJsValueViewFromWasm0(arg1, arg2));
        },
        __wbg_texImage2D_3813406af5bf54c8: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).texImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
        }, arguments); },
        __wbg_texImage2D_5abd8779d1d033c7: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).texImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
        }, arguments); },
        __wbg_texImage2D_5c8a1060d1f4a267: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
            getObject(arg0).texImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9 === 0 ? undefined : getArrayU8FromWasm0(arg9, arg10));
        }, arguments); },
        __wbg_texImage2D_8d168171984f2a40: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).texImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9);
        }, arguments); },
        __wbg_texImage3D_bdd9bebe42ed1f52: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
            getObject(arg0).texImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8 >>> 0, arg9 >>> 0, arg10);
        }, arguments); },
        __wbg_texImage3D_ef16a1f721b3f908: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
            getObject(arg0).texImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8 >>> 0, arg9 >>> 0, getObject(arg10));
        }, arguments); },
        __wbg_texParameteri_1fc451e0964fc91c: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).texParameteri(arg1 >>> 0, arg2 >>> 0, arg3);
        },
        __wbg_texParameteri_9d0daa263d3a863f: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).texParameteri(arg1 >>> 0, arg2 >>> 0, arg3);
        },
        __wbg_texStorage2D_7f947efc63dac273: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).texStorage2D(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
        },
        __wbg_texStorage3D_f8f2e4b3386736f9: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            getObject(arg0).texStorage3D(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5, arg6);
        },
        __wbg_texSubImage2D_047380bb2660e4f9: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9);
        }, arguments); },
        __wbg_texSubImage2D_5058af3d30a8e205: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
        }, arguments); },
        __wbg_texSubImage2D_6a376bfc3a31436b: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
        }, arguments); },
        __wbg_texSubImage2D_98c43894eb217aa7: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
        }, arguments); },
        __wbg_texSubImage2D_a73b8e21dda08f46: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
            getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9 === 0 ? undefined : getArrayU8FromWasm0(arg9, arg10));
        }, arguments); },
        __wbg_texSubImage2D_bed5e7a3cd81d409: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
        }, arguments); },
        __wbg_texSubImage2D_d1af697e69f8a9e4: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
        }, arguments); },
        __wbg_texSubImage2D_d3cd09d0ffcb27be: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
        }, arguments); },
        __wbg_texSubImage2D_e107b4f88c19b920: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
        }, arguments); },
        __wbg_texSubImage3D_323b6fdabf0028f4: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11, arg12) {
            getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, arg11 === 0 ? undefined : getArrayU8FromWasm0(arg11, arg12));
        }, arguments); },
        __wbg_texSubImage3D_45e498ae6298998c: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
            getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, getObject(arg11));
        }, arguments); },
        __wbg_texSubImage3D_4fdd4cd95a2925c2: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
            getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, getObject(arg11));
        }, arguments); },
        __wbg_texSubImage3D_6cb6cfd732dad145: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
            getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, getObject(arg11));
        }, arguments); },
        __wbg_texSubImage3D_8077e90ec309c414: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
            getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, arg11);
        }, arguments); },
        __wbg_texSubImage3D_93b38c69acb735c8: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
            getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, getObject(arg11));
        }, arguments); },
        __wbg_texSubImage3D_c9e5a071796d412f: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
            getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, getObject(arg11));
        }, arguments); },
        __wbg_texSubImage3D_feebaf7f0f4594c6: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
            getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, getObject(arg11));
        }, arguments); },
        __wbg_then_16d107c451e9905d: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
            return addHeapObject(ret);
        },
        __wbg_then_6ec10ae38b3e92f7: function(arg0, arg1) {
            const ret = getObject(arg0).then(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_unconfigure_0a07a0a40de8988d: function(arg0) {
            getObject(arg0).unconfigure();
        },
        __wbg_uniform1f_62692c8fa8e7bf1e: function(arg0, arg1, arg2) {
            getObject(arg0).uniform1f(getObject(arg1), arg2);
        },
        __wbg_uniform1f_b79d0c5667f9fb40: function(arg0, arg1, arg2) {
            getObject(arg0).uniform1f(getObject(arg1), arg2);
        },
        __wbg_uniform1i_5830de6702add20a: function(arg0, arg1, arg2) {
            getObject(arg0).uniform1i(getObject(arg1), arg2);
        },
        __wbg_uniform1i_7621f908f78177df: function(arg0, arg1, arg2) {
            getObject(arg0).uniform1i(getObject(arg1), arg2);
        },
        __wbg_uniform1ui_cd7ad5581093b3df: function(arg0, arg1, arg2) {
            getObject(arg0).uniform1ui(getObject(arg1), arg2 >>> 0);
        },
        __wbg_uniform2f_9240db2fb8813967: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform2f(getObject(arg1), arg2, arg3);
        },
        __wbg_uniform2fv_1b43656b33177d21: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform2fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
        },
        __wbg_uniform2fv_948dab6a82b428ac: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform2fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
        },
        __wbg_uniform2iv_859048b9d60f46ae: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform2iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
        },
        __wbg_uniform2iv_f84a24961c0cfcd0: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform2iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
        },
        __wbg_uniform2uiv_8a9cb3155271213b: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform2uiv(getObject(arg1), getArrayU32FromWasm0(arg2, arg3));
        },
        __wbg_uniform3fv_8ecb5ebb510b7bce: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform3fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
        },
        __wbg_uniform3fv_95d1933ea1440725: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform3fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
        },
        __wbg_uniform3iv_09abae5eabd6b9d6: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform3iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
        },
        __wbg_uniform3iv_a3a7008990fd84f0: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform3iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
        },
        __wbg_uniform3uiv_3c0b163732f5b8f0: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform3uiv(getObject(arg1), getArrayU32FromWasm0(arg2, arg3));
        },
        __wbg_uniform4f_9ff60fc65b0ed726: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).uniform4f(getObject(arg1), arg2, arg3, arg4, arg5);
        },
        __wbg_uniform4f_b25e39808b830021: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).uniform4f(getObject(arg1), arg2, arg3, arg4, arg5);
        },
        __wbg_uniform4fv_4ca8c114ca3de099: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform4fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
        },
        __wbg_uniform4fv_674a247aeb15012d: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform4fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
        },
        __wbg_uniform4iv_45ab52abcb3f882c: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform4iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
        },
        __wbg_uniform4iv_d02934d7b94df609: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform4iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
        },
        __wbg_uniform4uiv_0d1a8ed214f10c31: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform4uiv(getObject(arg1), getArrayU32FromWasm0(arg2, arg3));
        },
        __wbg_uniformBlockBinding_a9ed6b750199e03c: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniformBlockBinding(getObject(arg1), arg2 >>> 0, arg3 >>> 0);
        },
        __wbg_uniformMatrix2fv_769725d64641341f: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).uniformMatrix2fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
        },
        __wbg_uniformMatrix2fv_9284424cc6aac672: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).uniformMatrix2fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
        },
        __wbg_uniformMatrix2x3fv_dba00c4fc8eefe47: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).uniformMatrix2x3fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
        },
        __wbg_uniformMatrix2x4fv_d801a561c3c18169: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).uniformMatrix2x4fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
        },
        __wbg_uniformMatrix3fv_33e96c7d29dc1e22: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).uniformMatrix3fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
        },
        __wbg_uniformMatrix3fv_568aa181379c8a75: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).uniformMatrix3fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
        },
        __wbg_uniformMatrix3x2fv_ce43e8186ea60a1e: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).uniformMatrix3x2fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
        },
        __wbg_uniformMatrix3x4fv_8abccc5745b0dd90: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).uniformMatrix3x4fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
        },
        __wbg_uniformMatrix4fv_25115a23e04f6db7: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).uniformMatrix4fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
        },
        __wbg_uniformMatrix4fv_423b958042692150: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).uniformMatrix4fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
        },
        __wbg_uniformMatrix4x2fv_1ac2bf986a322e3f: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).uniformMatrix4x2fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
        },
        __wbg_uniformMatrix4x3fv_8640fa85b90ea910: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).uniformMatrix4x3fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
        },
        __wbg_unmap_adaf93276fdf9aaf: function(arg0) {
            getObject(arg0).unmap();
        },
        __wbg_useProgram_182d120fe476921b: function(arg0, arg1) {
            getObject(arg0).useProgram(getObject(arg1));
        },
        __wbg_useProgram_49495850b446fa56: function(arg0, arg1) {
            getObject(arg0).useProgram(getObject(arg1));
        },
        __wbg_vertexAttribDivisorANGLE_978337b09d11ed84: function(arg0, arg1, arg2) {
            getObject(arg0).vertexAttribDivisorANGLE(arg1 >>> 0, arg2 >>> 0);
        },
        __wbg_vertexAttribDivisor_fb31b5ed9bc856da: function(arg0, arg1, arg2) {
            getObject(arg0).vertexAttribDivisor(arg1 >>> 0, arg2 >>> 0);
        },
        __wbg_vertexAttribIPointer_de08a8d8b625e253: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).vertexAttribIPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
        },
        __wbg_vertexAttribPointer_a8f0af57269c2067: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
        },
        __wbg_vertexAttribPointer_b300c8e000cdac93: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
        },
        __wbg_viewport_affdf15c559df1e2: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).viewport(arg1, arg2, arg3, arg4);
        },
        __wbg_viewport_e8a16ca4a5085e5f: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).viewport(arg1, arg2, arg3, arg4);
        },
        __wbg_warn_b1370d804fa3e259: function(arg0) {
            console.warn(getObject(arg0));
        },
        __wbg_width_6d9315ecc7140ff6: function(arg0) {
            const ret = getObject(arg0).width;
            return ret;
        },
        __wbg_writeBuffer_8b5bd251a89198bc: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            getObject(arg0).writeBuffer(getObject(arg1), arg2, getArrayU8FromWasm0(arg3, arg4), arg5, arg6);
        }, arguments); },
        __wbg_writeTexture_53ba204c494b042c: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).writeTexture(getObject(arg1), getArrayU8FromWasm0(arg2, arg3), getObject(arg4), getObject(arg5));
        }, arguments); },
        __wbindgen_cast_0000000000000001: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [Externref], shim_idx: 2249, ret: Result(Unit), inner_ret: Some(Result(Unit)) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, __wasm_bindgen_func_elem_7653);
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000002: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [NamedExternref("GPUDevice")], shim_idx: 189, ret: Result(Unit), inner_ret: Some(Result(Unit)) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, __wasm_bindgen_func_elem_1688);
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000003: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [NamedExternref("any")], shim_idx: 189, ret: Result(Unit), inner_ret: Some(Result(Unit)) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, __wasm_bindgen_func_elem_1688_2);
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000004: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [NamedExternref("undefined")], shim_idx: 189, ret: Result(Unit), inner_ret: Some(Result(Unit)) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, __wasm_bindgen_func_elem_1688_3);
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000005: function(arg0) {
            // Cast intrinsic for `F64 -> Externref`.
            const ret = arg0;
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000006: function(arg0, arg1) {
            // Cast intrinsic for `Ref(Slice(F32)) -> NamedExternref("Float32Array")`.
            const ret = getArrayF32FromWasm0(arg0, arg1);
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000007: function(arg0, arg1) {
            // Cast intrinsic for `Ref(Slice(I16)) -> NamedExternref("Int16Array")`.
            const ret = getArrayI16FromWasm0(arg0, arg1);
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000008: function(arg0, arg1) {
            // Cast intrinsic for `Ref(Slice(I32)) -> NamedExternref("Int32Array")`.
            const ret = getArrayI32FromWasm0(arg0, arg1);
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000009: function(arg0, arg1) {
            // Cast intrinsic for `Ref(Slice(I8)) -> NamedExternref("Int8Array")`.
            const ret = getArrayI8FromWasm0(arg0, arg1);
            return addHeapObject(ret);
        },
        __wbindgen_cast_000000000000000a: function(arg0, arg1) {
            // Cast intrinsic for `Ref(Slice(U16)) -> NamedExternref("Uint16Array")`.
            const ret = getArrayU16FromWasm0(arg0, arg1);
            return addHeapObject(ret);
        },
        __wbindgen_cast_000000000000000b: function(arg0, arg1) {
            // Cast intrinsic for `Ref(Slice(U32)) -> NamedExternref("Uint32Array")`.
            const ret = getArrayU32FromWasm0(arg0, arg1);
            return addHeapObject(ret);
        },
        __wbindgen_cast_000000000000000c: function(arg0, arg1) {
            // Cast intrinsic for `Ref(Slice(U8)) -> NamedExternref("Uint8Array")`.
            const ret = getArrayU8FromWasm0(arg0, arg1);
            return addHeapObject(ret);
        },
        __wbindgen_cast_000000000000000d: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return addHeapObject(ret);
        },
        __wbindgen_object_clone_ref: function(arg0) {
            const ret = getObject(arg0);
            return addHeapObject(ret);
        },
        __wbindgen_object_drop_ref: function(arg0) {
            takeObject(arg0);
        },
    };
    return {
        __proto__: null,
        "./rource_wasm_bg.js": import0,
    };
}

function __wasm_bindgen_func_elem_7653(arg0, arg1, arg2) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.__wasm_bindgen_func_elem_7653(retptr, arg0, arg1, addHeapObject(arg2));
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        if (r1) {
            throw takeObject(r0);
        }
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

function __wasm_bindgen_func_elem_1688(arg0, arg1, arg2) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.__wasm_bindgen_func_elem_1688(retptr, arg0, arg1, addHeapObject(arg2));
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        if (r1) {
            throw takeObject(r0);
        }
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

function __wasm_bindgen_func_elem_1688_2(arg0, arg1, arg2) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.__wasm_bindgen_func_elem_1688_2(retptr, arg0, arg1, addHeapObject(arg2));
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        if (r1) {
            throw takeObject(r0);
        }
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

function __wasm_bindgen_func_elem_1688_3(arg0, arg1, arg2) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.__wasm_bindgen_func_elem_1688_3(retptr, arg0, arg1, addHeapObject(arg2));
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        if (r1) {
            throw takeObject(r0);
        }
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

function __wasm_bindgen_func_elem_7674(arg0, arg1, arg2, arg3) {
    wasm.__wasm_bindgen_func_elem_7674(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}


const __wbindgen_enum_GpuAddressMode = ["clamp-to-edge", "repeat", "mirror-repeat"];


const __wbindgen_enum_GpuAutoLayoutMode = ["auto"];


const __wbindgen_enum_GpuBlendFactor = ["zero", "one", "src", "one-minus-src", "src-alpha", "one-minus-src-alpha", "dst", "one-minus-dst", "dst-alpha", "one-minus-dst-alpha", "src-alpha-saturated", "constant", "one-minus-constant", "src1", "one-minus-src1", "src1-alpha", "one-minus-src1-alpha"];


const __wbindgen_enum_GpuBlendOperation = ["add", "subtract", "reverse-subtract", "min", "max"];


const __wbindgen_enum_GpuBufferBindingType = ["uniform", "storage", "read-only-storage"];


const __wbindgen_enum_GpuCanvasAlphaMode = ["opaque", "premultiplied"];


const __wbindgen_enum_GpuCanvasToneMappingMode = ["standard", "extended"];


const __wbindgen_enum_GpuCompareFunction = ["never", "less", "equal", "less-equal", "greater", "not-equal", "greater-equal", "always"];


const __wbindgen_enum_GpuCullMode = ["none", "front", "back"];


const __wbindgen_enum_GpuFilterMode = ["nearest", "linear"];


const __wbindgen_enum_GpuFrontFace = ["ccw", "cw"];


const __wbindgen_enum_GpuIndexFormat = ["uint16", "uint32"];


const __wbindgen_enum_GpuLoadOp = ["load", "clear"];


const __wbindgen_enum_GpuMipmapFilterMode = ["nearest", "linear"];


const __wbindgen_enum_GpuPowerPreference = ["low-power", "high-performance"];


const __wbindgen_enum_GpuPrimitiveTopology = ["point-list", "line-list", "line-strip", "triangle-list", "triangle-strip"];


const __wbindgen_enum_GpuSamplerBindingType = ["filtering", "non-filtering", "comparison"];


const __wbindgen_enum_GpuStencilOperation = ["keep", "zero", "replace", "invert", "increment-clamp", "decrement-clamp", "increment-wrap", "decrement-wrap"];


const __wbindgen_enum_GpuStorageTextureAccess = ["write-only", "read-only", "read-write"];


const __wbindgen_enum_GpuStoreOp = ["store", "discard"];


const __wbindgen_enum_GpuTextureAspect = ["all", "stencil-only", "depth-only"];


const __wbindgen_enum_GpuTextureDimension = ["1d", "2d", "3d"];


const __wbindgen_enum_GpuTextureFormat = ["r8unorm", "r8snorm", "r8uint", "r8sint", "r16unorm", "r16snorm", "r16uint", "r16sint", "r16float", "rg8unorm", "rg8snorm", "rg8uint", "rg8sint", "r32uint", "r32sint", "r32float", "rg16unorm", "rg16snorm", "rg16uint", "rg16sint", "rg16float", "rgba8unorm", "rgba8unorm-srgb", "rgba8snorm", "rgba8uint", "rgba8sint", "bgra8unorm", "bgra8unorm-srgb", "rgb9e5ufloat", "rgb10a2uint", "rgb10a2unorm", "rg11b10ufloat", "rg32uint", "rg32sint", "rg32float", "rgba16unorm", "rgba16snorm", "rgba16uint", "rgba16sint", "rgba16float", "rgba32uint", "rgba32sint", "rgba32float", "stencil8", "depth16unorm", "depth24plus", "depth24plus-stencil8", "depth32float", "depth32float-stencil8", "bc1-rgba-unorm", "bc1-rgba-unorm-srgb", "bc2-rgba-unorm", "bc2-rgba-unorm-srgb", "bc3-rgba-unorm", "bc3-rgba-unorm-srgb", "bc4-r-unorm", "bc4-r-snorm", "bc5-rg-unorm", "bc5-rg-snorm", "bc6h-rgb-ufloat", "bc6h-rgb-float", "bc7-rgba-unorm", "bc7-rgba-unorm-srgb", "etc2-rgb8unorm", "etc2-rgb8unorm-srgb", "etc2-rgb8a1unorm", "etc2-rgb8a1unorm-srgb", "etc2-rgba8unorm", "etc2-rgba8unorm-srgb", "eac-r11unorm", "eac-r11snorm", "eac-rg11unorm", "eac-rg11snorm", "astc-4x4-unorm", "astc-4x4-unorm-srgb", "astc-5x4-unorm", "astc-5x4-unorm-srgb", "astc-5x5-unorm", "astc-5x5-unorm-srgb", "astc-6x5-unorm", "astc-6x5-unorm-srgb", "astc-6x6-unorm", "astc-6x6-unorm-srgb", "astc-8x5-unorm", "astc-8x5-unorm-srgb", "astc-8x6-unorm", "astc-8x6-unorm-srgb", "astc-8x8-unorm", "astc-8x8-unorm-srgb", "astc-10x5-unorm", "astc-10x5-unorm-srgb", "astc-10x6-unorm", "astc-10x6-unorm-srgb", "astc-10x8-unorm", "astc-10x8-unorm-srgb", "astc-10x10-unorm", "astc-10x10-unorm-srgb", "astc-12x10-unorm", "astc-12x10-unorm-srgb", "astc-12x12-unorm", "astc-12x12-unorm-srgb"];


const __wbindgen_enum_GpuTextureSampleType = ["float", "unfilterable-float", "depth", "sint", "uint"];


const __wbindgen_enum_GpuTextureViewDimension = ["1d", "2d", "2d-array", "cube", "cube-array", "3d"];


const __wbindgen_enum_GpuVertexFormat = ["uint8", "uint8x2", "uint8x4", "sint8", "sint8x2", "sint8x4", "unorm8", "unorm8x2", "unorm8x4", "snorm8", "snorm8x2", "snorm8x4", "uint16", "uint16x2", "uint16x4", "sint16", "sint16x2", "sint16x4", "unorm16", "unorm16x2", "unorm16x4", "snorm16", "snorm16x2", "snorm16x4", "float16", "float16x2", "float16x4", "float32", "float32x2", "float32x3", "float32x4", "uint32", "uint32x2", "uint32x3", "uint32x4", "sint32", "sint32x2", "sint32x3", "sint32x4", "unorm10-10-10-2", "unorm8x4-bgra"];


const __wbindgen_enum_GpuVertexStepMode = ["vertex", "instance"];
const RourceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rource_free(ptr, 1));

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => wasm.__wbindgen_export5(state.a, state.b));

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function dropObject(idx) {
    if (idx < 1028) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function getArrayF32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayI16FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getInt16ArrayMemory0().subarray(ptr / 2, ptr / 2 + len);
}

function getArrayI32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getInt32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayI8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getInt8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

function getArrayJsValueViewFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(getObject(mem.getUint32(i, true)));
    }
    return result;
}

function getArrayU16FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint16ArrayMemory0().subarray(ptr / 2, ptr / 2 + len);
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

function getClampedArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ClampedArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let cachedFloat32ArrayMemory0 = null;
function getFloat32ArrayMemory0() {
    if (cachedFloat32ArrayMemory0 === null || cachedFloat32ArrayMemory0.byteLength === 0) {
        cachedFloat32ArrayMemory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32ArrayMemory0;
}

let cachedInt16ArrayMemory0 = null;
function getInt16ArrayMemory0() {
    if (cachedInt16ArrayMemory0 === null || cachedInt16ArrayMemory0.byteLength === 0) {
        cachedInt16ArrayMemory0 = new Int16Array(wasm.memory.buffer);
    }
    return cachedInt16ArrayMemory0;
}

let cachedInt32ArrayMemory0 = null;
function getInt32ArrayMemory0() {
    if (cachedInt32ArrayMemory0 === null || cachedInt32ArrayMemory0.byteLength === 0) {
        cachedInt32ArrayMemory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32ArrayMemory0;
}

let cachedInt8ArrayMemory0 = null;
function getInt8ArrayMemory0() {
    if (cachedInt8ArrayMemory0 === null || cachedInt8ArrayMemory0.byteLength === 0) {
        cachedInt8ArrayMemory0 = new Int8Array(wasm.memory.buffer);
    }
    return cachedInt8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint16ArrayMemory0 = null;
function getUint16ArrayMemory0() {
    if (cachedUint16ArrayMemory0 === null || cachedUint16ArrayMemory0.byteLength === 0) {
        cachedUint16ArrayMemory0 = new Uint16Array(wasm.memory.buffer);
    }
    return cachedUint16ArrayMemory0;
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

let cachedUint8ClampedArrayMemory0 = null;
function getUint8ClampedArrayMemory0() {
    if (cachedUint8ClampedArrayMemory0 === null || cachedUint8ClampedArrayMemory0.byteLength === 0) {
        cachedUint8ClampedArrayMemory0 = new Uint8ClampedArray(wasm.memory.buffer);
    }
    return cachedUint8ClampedArrayMemory0;
}

function getObject(idx) { return heap[idx]; }

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_export3(addHeapObject(e));
    }
}

let heap = new Array(1024).fill(undefined);
heap.push(undefined, null, true, false);

let heap_next = heap.length;

function isLikeNone(x) {
    return x === undefined || x === null;
}

function makeMutClosure(arg0, arg1, f) {
    const state = { a: arg0, b: arg1, cnt: 1 };
    const real = (...args) => {

        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            state.a = a;
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            wasm.__wbindgen_export5(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedFloat32ArrayMemory0 = null;
    cachedInt16ArrayMemory0 = null;
    cachedInt32ArrayMemory0 = null;
    cachedInt8ArrayMemory0 = null;
    cachedUint16ArrayMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    cachedUint8ClampedArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('rource_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
