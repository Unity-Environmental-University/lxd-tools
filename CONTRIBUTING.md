# Contributing to the LXD Extension

This is the developer guide for the LXD extension. To install and use the extension, see the [README](README.md).

Production builds (`npm run build`) are written to `dist/` inside this repository.
Load that folder as an unpacked extension, then reload the extension and refresh
Canvas tabs after rebuilding. `npm run build:dev` and `npm run watch:dev` use
repo-local `lxd-extension-build/` with a separate local extension identity.
Older builds used `../dist/`; check the loaded directory if an old version persists.

Current automated release behavior is documented in [docs/BUILD_PROCESS.md](docs/BUILD_PROCESS.md).

## Getting Started

This guide will walk you through setting up your local development environment for the LXD extension. Follow the steps below to create your local branches, install dependencies, build local changes, and test your work.

### Prerequisites

- [**Git:**](https://git-scm.com/install/) Ensure you have Git installed and configured.
- **[Node.js](https://nodejs.org/en/download) & [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm):** Verify that your Node.js and npm installations are up-to-date.
- **Existing Tools:**
  - [**lxd-tools**](https://github.com/Unity-Environmental-University/lxd-tools) repository
- [**GitHub Desktop**](https://desktop.github.com/download/)(optional): Depending on your familiarity working with Git in the command line, GitHub Desktop may be a helpful tool for pulling repos and committing your code changes.

### Step-by-Step Setup

#### 1. Create a Local Branch of lxd-tools

1. Clone the `lxd-tools` repository:

   `git clone <URL_TO_LXD_TOOLS_REPOSITORY>`

   `cd lxd-tools`

2. Install dependencies:

   `npm install`

Note: These dependencies are also defined in the package.json of lxd-tools.

#### 2. Starting Development

1. At this point, you should test if you're able to build the extension locally. In the `lxd-tools` directory, run `npm run build`. If that fails, you will need to address any errors.

2. If your build is successful, you are ready to start working on code. Work can be done either in the current release branch(for small changes), your own testing branch, or a feature branch(if the work you're doing will go on to be it's own feature.) Make sure you checkout/create a branch that isn't main before you begin working.

3. After you made changes, please document them in the Unreleased section of the [change log](./CHANGELOG.md)

#### 3. Testing Your Changes

1. Once the local build is working and you're in a non-main branch, you can make changes to the code and test them in the browser. `npm run build` will output a dist folder that you can load into the browser. `npm run watch` does the same, but rebuilds every time you make a change in the code. `npm run build:dev` and `npm run watch:dev` do the same thing but output to lxd-extension-build and have -local on the version number and (Local) in the title, which makes it a bit easier to know which is which if you load it alongside the production extension.

2. Jest is the testing suite used for unit testing. Any time you change code, you should run the tests to make sure they still pass. Tests can be run with the command `npm test`.

#### 4. Finalizing Your Changes

- Features that have passed testing and are ready to go into the extension can be pushed to the current release branch.
- Features that still need work may be best placed in their own feature branch.

## Publishing the Extension

This guide explains how to publish the LXD Extension.

### 1. Prepare Your Branches

- **Merge Changes Down:**  
   Ensure that finished code in feature or development branches are merged down into the release branch.
- **Push Commits:**  
   Before starting the publishing process, verify that all users' finished changes on the release branch have been pushed to the remote repository.

### 2. Update the Version Number

- **Increment the Version:**
  - Run `npm version <new version>` (e.g., `npm version 3.3.1`, or `npm version patch`). This updates `package.json` **and** both version fields in `package-lock.json` together, so type the version only once. The repo's `.npmrc` sets `git-tag-version=false`, so this does not create a commit or tag; the deploy workflow creates the `v`-prefixed tag and the GitHub Release.
  - Don't edit the `version` field in `package.json` by hand: the PR's Version Check fails if `package-lock.json` doesn't match.

  - Versioning in incremented based on the following:

    +0.0.0.1 for a hotfix
    +0.0.1 for sprint-based releases
    +0.1 for feature releases
    +1.0 for massive changes


### 4. Build Locally and Test Manually

- **Build the extension locally for testing**

  Run `npm run build` to build the extension locally

- **Test the Local Build Version:**  
   Perform a manual test of the extension in its intended environment. Verify that all functionalities work as expected.

### 5. Publish the Extension

Publishing is automated; there is no local publish command. Before merging, rename the `Unreleased` heading in [CHANGELOG.md](./CHANGELOG.md) to the new version (and add a fresh `Unreleased` section above it), since those entries become the GitHub Release notes.

Merging the release branch into `main` (through a pull request) starts the **Deploy Extension Updates** workflow, which:

- Fails if the version in `package.json` has already been deployed.
- Builds the extension and signs the Chrome (`.crx`) and Firefox (`.xpi`) packages.
- Pushes a `release/<version>` branch.
- Creates the `v<version>` tag and a GitHub Release with the changelog notes, the `.crx`, the `.xpi`, and a zip of the unpacked build.

See [docs/BUILD_PROCESS.md](docs/BUILD_PROCESS.md) for details, including how to re-run a failed deploy. PRs to main are blocked if the test workflow or version check workflow fails.

### 6. Communicate & Finalize the Release

- **Notify the Team:**  
   Let everyone know about the new release. The people that use the extension are in The Mighty LXD Team chat on Microsoft Teams. Let them know there's a new version of the extension, including a few top level details about what is new.

### Summary

1. **Merge Changes Down:**
   - Consolidate updates from various branches into the release branch.
2. **Increment the Version:**
   - Run `npm version <new version>` (updates `package.json` and `package-lock.json`; no commit or tag is made).
4. **Build Locally**
   - Run `npm run build` to build the extension locally for testing.
5. **Manual Testing:**
   - Manually verify that the extension works as intended.
6. **Publish:**
   - Move the version's entries in `CHANGELOG.md` under a heading for the new version.
   - Merge changes in lxd-tools to main; the deploy workflow publishes the extension automatically.
7. **Notify the Team:**
   - Communicate the new release to the team.
