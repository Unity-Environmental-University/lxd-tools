# Installation

Follow instructions in https://github.com/Unity-Environmental-University/lxd-tools-build
or README.dist.md, pointing the extensions loader to dist/

---

# LXD Extension Development Guide

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

2. If your build successful, you are ready to start working on code. Work can be done either in the current release branch, your own testing branch, or a feature branch(if the work you're doing will go on to be it's own feature.) Make sure you checkout/create a branch that isn't main before you begin working.

#### 3. Testing Your Changes

1. Once the local build is working and you're in a non-main branch, you can make changes to the code and test them in the browser. To have a build of the extension that updates every time the code is changed, you can run `npm run watch`.

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

- **Increment the Version in package.json:**

  - Open `package.json` and update the `version` field to the next release version (e.g., from `2.9.1.2` to `2.9.1.3`).

  - Versioning in incremented based on the following:

    +0.0.0.1 for a hotfix
    +0.0.1 for sprint-based releases
    +0.1 for feature releases
    +1.0 for massive changes

### 3. Run Tests

- **Test the Code:**  
   Run the test suite to validate that all tests pass successfully:
  `npm test`

- **Fix Any Failures:**  
   If any tests fail, resolve the issues before proceeding.

### 4. Build Locally and Test Manually

- **Build the extension locally for testing**

  Run `npm run build` to build the extension locally

- **Test the Local Build Version:**  
   Perform a manual test of the extension in its intended environment. Verify that all functionalities work as expected.

### 5. Publish the Extension

- **Execute the Publishing Command:**  
   Once you've built the extension, publish the extension by running the publish script:
  `npm run publish`

The publish script performs the following tasks:

- Checks the current version from `package.json` and creates the corresponding package tag.
- Ensures that the tag does not already exist in the distribution folder’s Git history.
- Updates Git tags.
- Reads the manifest (`manifest.source.json`) and synchronizes its version with the package version.
- Stages changes, constructs a commit message from the differences between tags, commits the changes, and finally pushes commit and tags to the remote repository.

### 6. Communicate & Finalize the Release

- **Notify the Team:**  
   Let everyone know about the new release. The people that use the extension are in The Mighty LXD Team chat on Microsoft Teams. Let them know there's a new version of the extension, including a few top level details about what is new.

* **Merge Current Release Branch into main in LXD-Tools**
  Merge the current release branch into main in the lxd-tools repository.

- **New Release Branch in LXD-Tools:**  
   Create a new release branch in lxd-tools based on the newly merged main branch.

### Summary

1. **Merge Changes Down:**
   - Consolidate updates from various branches into the release branch.
2. **Increment the Version:**
   - Update the version number in `package.json`.
3. **Run Tests:**
   - Run `npm test` Ensure all tests pass (fix any failing tests).
4. **Build Locally**
   - Run `npm run build` to build the extension locally for testing.
5. **Manual Testing:**
   - Manually verify that the extension works as intended.
6. **Build & Publish:**
   - Run `npm run publish` to publish the extension.
7. **Notify the Team:**
   - Communicate the new release to the team.
8. **Manage Release Branches:**
   - Merge changes in lxd-tools to main.
   - Create a new release branch in lxd-tools for the new version.
