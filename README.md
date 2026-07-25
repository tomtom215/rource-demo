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

Bundled sample histories include React, Go, Rust, Linux, VS Code, Svelte and
Deno, or you can point it at any public GitHub repository from the sidebar.

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
tree and carries no source history of its own, so its commit log says nothing
about how the project was built.

## License

Rource is licensed under the **GPL-3.0**; the full text is in [LICENSE](LICENSE).

This repository distributes object code (a compiled `.wasm` binary) rather than
source. In accordance with **GPL-3.0 section 6(b)**, the copyright holder offers
to provide the Corresponding Source for the binary published here, for a period
of three years, to anyone who requests it — open an issue on this repository or
contact the author via <https://github.com/tomtom215>.

The Rource source repository is not currently public. That is a deliberate
choice about timing, not a restriction on your rights under the GPL: the offer
above stands regardless.

### Third-party components

The binary statically links third-party Rust crates, all under permissive
licences (MIT, Apache-2.0, BSD, ISC, Zlib and similar). Their required copyright
notices and licence texts are reproduced in
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md), generated from the resolved
dependency graph of this exact build.

### Attribution

Inspired by [Gource](https://github.com/acaudwell/Gource) by Andrew Caudwell.
Rource is an independent rewrite from scratch and shares no code with it.
