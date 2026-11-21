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

There are currently two active GitHub Action Workflows:

### Push Test

On every commit, this action runs runs test coverage, linting and typechecking on the code to ensure that changes haven't caused any errors.

### PR Build

On every pull request, this workflow will lint, typecheck and test the code and then create a build artifact that it will comment in the pull request, this makes it easier for a user to pull the built extension and test.

## Tips/Tricks

- `npm run build` writes the production extension to `dist/` inside this repository. Load that folder as an unpacked extension, then reload the extension and existing Canvas tabs after rebuilding.
- `npm run build:dev` writes to `lxd-extension-build/` inside this repository with a separate local extension identity, so it can coexist with the released extension. `npm run watch:dev` rebuilds the same folder on changes.
- A Canvas test environment exists at https://unity.test.instructure.com/.
  - I find myself using a test course in the live Canvas more often, which allows me to reset and pull any course in.
