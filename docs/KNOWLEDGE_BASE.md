# Knowledge Base

The purpose of this is to collect extension-specific information as an attempt to make it easier to pick up developing the extension.

## Canvas Authentication

The extension does not use a standalone API Key. Instead, it piggybacks on the user’s active browser session. It authorizes requests by extracting the Cross-Site Request Forgery (CSRF) token that Canvas already generated for the user.

**Where we get it:**

_Primary:_ A hidden input field in the Canvas DOM: input[name='authenticity_token'].

_Fallback:_ The browser cookie named \_csrf_token (which the extension manually decodes).

NOTE: If the university updates Canvas and they change the name of that input field or the cookie, all POST/PUT requests will fail (403 Forbidden).

## 'Style Guide'

This is a set of general patterns in the codebase

### Async/Await

For the sake of code that runs asynchronously, await is used predominantly over .then()

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
