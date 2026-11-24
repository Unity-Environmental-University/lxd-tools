# Knowledge Base

The purpose of this is to collect extension-specific information as an attempt to make it easier to pick up developing the extension.

## Canvas Authentication

The extension does not use a standalone API Key. Instead, it piggybacks on the user’s active browser session. It authorizes requests by extracting the Cross-Site Request Forgery (CSRF) token that Canvas already generated for the user.

**Where we get it:**

_Primary:_ A hidden input field in the Canvas DOM: `input[name='authenticity_token']`.

_Fallback:_ The browser cookie named `\_csrf_token `(which the extension manually decodes).

NOTE: If the university updates Canvas and they change the name of that input field or the cookie, all POST/PUT requests will fail (403 Forbidden).

## 'Style Guide'

This is a set of general patterns in the codebase.

### Async/Await

For the sake of code that runs asynchronously, await is used predominantly over .then()

### Intentionally unused variables

The code was getting a lot of unused variable warnings that were false flags as those variables were being used outside of the file. Anywhere that happens, the variable now has a leading underscore to indicate that it is intentionally unused.

### Link checking

**Find a link in Canvas HTML**

Parse the syllabus or discussion body with [`parseHtmlInert`](../src/utils/html.ts).
Select anchors with `a[href]` and compare each anchor's `getAttribute("href")`
with the expected value. An `href` that contains the URL inside a redirect
has a different attribute value.

**Check the current page's hostname**

When checking whether the current page URL belongs to a trusted host, parse the URI with `new URL()` and check the `hostname` property: `new URL(document.documentURI).hostname.endsWith(".instructure.com")`. Never use `.includes()` on a raw URL string to check the host — a URL like `https://evil.com/?r=https://unity.instructure.com` would falsely pass. See [content/index.ts](../src/content/index.ts).

## GitHub Actions

There are currently four active GitHub Action Workflows:

### Push Test

On every commit, this action runs runs test coverage, linting and typechecking on the code to ensure that changes haven't caused any errors.

### Build Testing

On every pull request, this workflow will lint, typecheck and test the code and then create a build artifact that it will comment in the pull request, this makes it easier for a user to pull the built extension and test.

### Version Check

Checks pull requests to main to make sure the version number in package and package-lock have been updated. This is to prevent issues in production deploys. A second version exists that skips the check if the changes are only .md, .yml, or .yaml files. This allows the documentation and workflow files to be iterated separetly from a publishes.

### Production Deploy

On a merged pull request to main that has more that documentation and workflow files, the build process runs. More on the build process can be found [here](docs/BUILD_PROCESS.md).

## Tips/Tricks

- `npm run build` writes the production extension to `dist/` inside this repository. Load that folder as an unpacked extension, then reload the extension and existing Canvas tabs after rebuilding.
- `npm run build:dev` writes to `lxd-extension-build/` inside this repository with a separate local extension identity, so it can coexist with the released extension. `npm run watch:dev` rebuilds the same folder on changes.
- A Canvas test environment exists at https://unity.test.instructure.com/.
  - I find myself using a test course in the live Canvas more often, which allows me to reset and pull any course in.

### Testing changes to ueu-canvas locally

I've found situations where I need to make sure changes to ueu-canvas don't break things in the extension. Below is my preferred way of doing so.


1. Build and pack ueu-canvas
``` bash
cd <local ueu-canvas repo>
npm run build && npm pack     # creates ueu-ueu-canvas-<version>.tgz
```

2. Install the tarball into lxd-tools and clear the webpack cache
``` bash
cd <local lxd-tools repo>
npm install --no-save <local ueu-canvas repo>/ueu-ueu-canvas-<version>.tgz
rm -rf node_modules/.cache/webpack/default-development
```

3. Test

4. After testing, restore the registry version and clear the cache again
``` bash
cd <local lxd-tools repo>
npm install
rm -rf node_modules/.cache/webpack/default-development
```

- `--no-save` leaves `package.json` and the lockfile untouched.
- Clear the cache after each install, not just once. Webpack caches the previous build of `ueu-canvas`, so without the wipe you may test stale code.
- Re-run `npm run build && npm pack` and repeat steps 2-3 after every change to `ueu-canvas`.
