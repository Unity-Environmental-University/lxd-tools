# Working on LXD Tools

## Repository and architecture

This is a Manifest V3 browser extension for Unity Environmental University's
Learning Experience Designers using Canvas. It targets Chrome-family browsers
and Firefox. It is not a standalone web app: most UI runs inside authenticated
Canvas pages, with separate extension popup and search pages.

- `webpack.config.js` defines the entry points and generated manifests.
  `manifest.source.json` defines content-script routes, permissions, and browser
  identities. Keep these in sync when adding an entry point.
- `src/background/` handles extension messages and privileged browser operations.
  `src/content/` contains injected page helpers and course navigation.
- `src/popup/` and `src/search/` are extension pages; search integrates with LISA.
- `src/ui/` contains Canvas page integrations, including syllabus import,
  course navigation, modules, and SpeedGrader tools.
- `src/publish/` handles Blueprint publishing, migrations, profile content, and
  course validations/fixes. Validation contracts and registration live under
  `src/publish/fixesAndUpdates/validations/`; follow the active registry rather
  than assuming every validation file is enabled.
- `src/reporting/` and `src/admin/` contain reporting and administrative UI.
- `src/canvas-redux/` contains shared Redux slices. Other features use their own
  state; follow the affected feature's existing pattern.
- `@ueu/ueu-canvas` supplies Canvas API models and request utilities. It is an npm
  dependency, not source maintained in this repository. Check its installed
  declarations before assuming an export exists. `src/canvasInstances.ts`
  defines configurable Canvas origins/accounts.

## Setup and builds

Use npm and the committed `package-lock.json`; CI uses Node.js 24. Run `npm ci`
after switching to a branch with different dependencies. Do not change source
to work around an outdated `node_modules` installation.

| Command | Behavior |
| --- | --- |
| `npm run build` | Production build, minification and TypeScript checking; writes to sibling `dist/`. |
| `npm run build:dev` | Development build in sibling `lxd-extension-build/`, with a separate local extension identity. |
| `npm run watch` | Development watcher writing to `dist/`; retains the normal extension identity. |
| `npm run watch:dev` | Development watcher using the separate local build and identity. |

Output paths resolve against the repository directory, not the shell working directory.
The sibling layout supports a separate build repository and the CI workspace layout. `BUILD_OUTPUT_DIR` can
override the output path, but the separate local identity is selected only for
the exact `lxd-extension-build/` override used by the dev scripts. Development builds transpile without
type checking; run `npm run typecheck` separately. Generated artifacts are
ignored; edit sources, not bundles. Version values in the generated manifest
and update manifests come from `package.json`.

Load the relevant output folder as an unpacked extension. After rebuilding,
reload that extension in the browser's extension manager and refresh existing
Canvas tabs. If the browser shows an old version, check the loaded folder and
its `manifest.json`; a successful build does not reload installed extensions.
The default build does not update an in-repo `dist/` folder. Check for duplicate
installations before changing the output path. Multiple source checkouts under
one parent directory share the same default output, so use isolated parent
directories or an explicit `BUILD_OUTPUT_DIR` when testing worktrees.

## Validation

- `npm test -- --runInBand` runs Jest once with a single worker. For focused
  checks, use `npm test -- --runInBand --runTestsByPath <test-file>`.
- `npm run typecheck` runs TypeScript without emitting files.
- `npm run lint` runs the flat ESLint configuration in `eslint.config.mjs`.
- `npm run build` verifies the production bundles and manifest transforms.

CI runs tests, lint, and type checking on pushes; the PR build workflow also
builds and uploads an unsigned extension. Run checks appropriate to code changes
and report actual failures, including existing failures, rather than claiming a
successful build proves tests pass. Documentation-only changes need link/path
review, not new implementation tests.

Jest uses jsdom, ts-jest, aliases from `tsconfig.json`, shared fixtures under
`src/__mocks__/`, and a browser API mock in `src/__mocks__/runtime.ts`.
Tests generally sit beside the feature or in its `__tests__/` directory.
For DOM or extension lifecycle changes, also verify the relevant browser flow
on a designated test course. Do not run course mutations against production
courses just to validate a change.

## Implementation conventions

TypeScript is strict; reuse the existing `@/` and `@publish/` aliases and nearby
React/Bootstrap patterns. Prefer existing Canvas models and request helpers,
including `src/fetch/apiWriteConfig.ts`, over duplicating API plumbing. Canvas
requests use the browser's authenticated session and CSRF handling, not a new
standalone API key. Preserve the selected Canvas instance when constructing
links and requests.

Parse fetched Canvas HTML with `parseHtmlInert` from `src/utils/html.ts` when
inspecting or transforming it. Inert parsing is not sanitization for rendering
untrusted HTML. Validate URL origins/hostnames structurally rather than checking
whether a raw URL contains a trusted hostname. Keep browser message handlers,
content scripts, and service-worker contexts distinct.

## Changes and releases

Work on a feature/fix branch, preferably in a separate worktree when the main
checkout needs to stay unchanged. Preserve unrelated user files and changes.
Document user-facing changes under Unreleased in `CHANGELOG.md`.

Use `.github/workflows/` as the authority for current automation:

- `push-test.yaml`: tests, lint, and types on pushes.
- `build-testing.yml`: PR/manual unsigned builds; artifacts come from
  `dist` at the workspace root because Actions checks out the source into
  `lxd-tools/` and webpack writes to its sibling `dist/`.
- `main-deploy.yml`: production signing, R2 uploads/pruning, build-repository
  sync, tags, and release branches on eligible pushes/manual runs from main.
- `version-check.yml`: requires a changed package version for applicable PRs
  into main, and that both version fields in `package-lock.json` match
  `package.json`; Markdown/YAML-only and release-tools-only changes are excluded.

Bump versions with `npm version <version>` (or `patch`/`minor`/`major`), never by
hand-editing `package.json`: it updates `package.json` and both lockfile version
fields (`version` and `packages[""].version`) together. The repo's `.npmrc` sets
`git-tag-version=false`, so it makes no commit or tag; `main-deploy.yml` creates
the unprefixed release tag. Keep tokens out of `.npmrc`.

Keep build, packaging, artifact discovery, and distribution-copy paths aligned
when changing output locations. Release tools have their own lockfile under
`.github/release-tools/`. See `docs/BUILD_PROCESS.md` for deployment details and
`docs/SYLLABUS_SYNC.md` for syllabus behavior. Some README publishing instructions
describe the older manual process; verify them against the workflows.

Signing, publishing, deployment dispatch, and merging are separate actions from building or opening a PR. Keep private signing keys, tokens, `.env` files, and browser/session data out of commits and artifacts.
