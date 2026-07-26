# Rource — Live Demo

Software version-control visualization in **Rust + WebAssembly**. Open the demo
and press play.

**▶ [Try it live](https://tomtom215.github.io/rource-demo/)**

Rource renders a repository's commit history as an animated force-directed tree:
directories branch outward, files appear as coloured leaves, and contributors move
between the files they touch. Everything runs client-side in WebAssembly — there is
no server, and no repository data leaves the browser.

---

## What you are looking at

| Element | Meaning |
|---------|---------|
| Coloured dots | Files, coloured by type |
| Larger circles | Contributors |
| Beams | A contributor modifying a file |
| Grey circles | Directories, linked parent → child |

Bundled sample histories cover React, Vue, Svelte, Deno, Rust, VS Code, Go and
Linux — the eight repositories in `demo-data/` — or you can point it at any
public GitHub repository from the sidebar.

---

## Technical notes

- **Rendering**: WebGPU where available, automatic fallback to WebGL2, and a
  pure-CPU software rasteriser so it runs without a GPU at all.
- **Payload**: ~1.2 MB gzipped WebAssembly.
- **Layout**: force-directed graph with Barnes-Hut approximation.
- **Portability**: no GPU required, no native dependencies, no server round-trips.

The renderer targets a 20 µs frame budget; the on-screen stats panel reports live
frame time, entity count, draw calls and the active backend.

---

## About this repository

This repository contains **only the compiled demo** — the WebAssembly binary,
its JavaScript glue, and static assets. It is generated from the Rource source
tree and carries no source history of its own.

## License

GPL-3.0. Inspired by [Gource](https://github.com/acaudwell/Gource) by Andrew
Caudwell; Rource is an independent rewrite from scratch.
