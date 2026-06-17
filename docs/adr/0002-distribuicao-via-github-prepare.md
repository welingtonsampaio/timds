# 0002 — Distribution directly from GitHub via `prepare`

- Status: Accepted
- Date: 2026-06-17

## Context

A project requirement is that the library can be **imported directly from
GitHub**, without needing to publish to an npm registry (public or private). At the
same time, the consumer should not need any manual build steps after installing.

## Decision

Distribute via Git and use npm's **`prepare`** lifecycle script to compile `dist/`
automatically at install time:

```json
{
  "scripts": {
    "prepare": "vite build"
  }
}
```

When someone runs `npm install github:<org>/timds`, npm clones the repository,
installs the `devDependencies`, and runs `prepare`, generating `dist/` (JS, types,
and CSS). The `package.json` exposes these artifacts via `exports`/`main`/`types`.

The `dist/` folder is kept in `.gitignore` — it is generated at install time, not
versioned.

## Alternatives considered

- **Version `dist/` in Git** — would avoid the build at install time, but it
  pollutes the history, causes conflicts, and risks publishing stale artifacts.
- **Publish to an npm registry (public/private)** — explicitly out of scope for
  this project.
- **GitHub Packages** — still requires authentication and registry configuration
  on the consumer's side; the goal is registry-less installation.

## Consequences

- **Positive:**
  - `npm install github:<org>/timds` works without extra steps.
  - The artifact is always compiled from the code at the installed commit/tag.
- **Negative/limitations:**
  - The consumer compiles the lib at install time, which requires downloading the
    `devDependencies` and costs a few seconds.
  - It is recommended to **pin a tag or commit** (`#v0.0.1`) for reproducible
    builds.

## Related

- [0001 — Build as a library with Vite](./0001-build-com-vite-library-mode.md)
