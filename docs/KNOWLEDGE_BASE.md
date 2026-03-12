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

There are three patterns used in this codebase for checking URLs, depending on context:

**1. Regex over raw HTML strings (syllabus/discussion content)**

When checking whether a specific URL exists in an HTML string (e.g. a syllabus or discussion body), use `new RegExp(escapedUrl, "ig")` where `escapedUrl` has been sanitized with `.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")`. This escapes special regex characters in the URL so dots and other metacharacters are treated as literals. See `makeSyllabusUrlCheck` in [syllabusTests.ts](../src/publish/fixesAndUpdates/validations/syllabusTests.ts).

**2. Quote-bounded substring check (HTML attribute values)**

When checking for the presence or absence of a URL as an `href` value inside an HTML string, wrap the URL in double quotes: `htmlString.includes(`"${url}"`)`. Since HTML attributes are quoted, this ensures the URL is matched as an exact attribute value rather than as a substring of a longer URL (e.g. a redirect parameter). See `aiPolicyMediaRun` in [syllabusTests.ts](../src/publish/fixesAndUpdates/validations/syllabusTests.ts) and the `run` function in [discussionTests.ts](../src/publish/fixesAndUpdates/validations/discussionTests.ts).

**3. URL hostname check (actual browser URLs)**

When checking whether the current page URL belongs to a trusted host, parse the URI with `new URL()` and check the `hostname` property: `new URL(document.documentURI).hostname.endsWith(".instructure.com")`. Never use `.includes()` on a raw URL string to check the host — a URL like `https://evil.com/?r=https://unity.instructure.com` would falsely pass. See [content/index.ts](../src/content/index.ts).

## GitHub Actions

There are currently two active GitHub Action Workflows:

### Push Test

On every commit, this action runs runs test coverage, linting and typechecking on the code to ensure that changes haven't caused any errors.

### PR Build

On every pull request, this workflow will lint, typecheck and test the code and then create a build artifact that it will comment in the pull request, this makes it easier for a user to pull the built extension and test.

## Tips/Tricks

- npm run build:dev will build the extension at ../lxd-extension-build to create a local build. This was created so you could keep the released version along side a local version for testing
- A Canvas test environment exists at https://unity.test.instructure.com/.
  - I find myself using a test course in the live Canvas more often, which allows me to reset and pull any course in.
