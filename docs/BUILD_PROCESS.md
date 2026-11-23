# LXD Tools Extension Build Process

## Overview

This document describes the automated build and deployment process for the LXD browser extension. The workflow runs when a change is pushed to the main branch (in practice, when a pull request is merged) or when it is started manually from main, and handles building, signing, and distributing the extension across multiple platforms (Chrome and Firefox).

The deployment pipeline manages version control, package signing, storage on Cloudflare R2, and maintains a clean version history.

## Workflow Trigger

### When the workflow runs

- A push to the main branch, which in practice means a pull request was merged (branch protection requires a pull request for main)
  - If the push only changes .md, .yml, .yaml and/or `.github/release-tools/` files, the workflow will not run. This allows documentation and workflows to be iterated separately of release cycles.
- A manual run (Actions → "Deploy Extension Updates" → Run workflow). This is a fallback, for example to re-run a deploy that failed partway. It always builds the tip of main.

### What triggers it NOT to run

- Pull request is closed without merging, opened or updated
- A manual run started on any ref other than main (the job is skipped)

Test builds that must not publish use the separate **Build testing** workflow (`build-testing.yml`), which runs on pull requests and can be started manually for any branch. It uploads an unsigned `dist/` as a workflow artifact and never uses the secrets below.

## Pre-requisites

### Repository requirements

- Version number in `package.json` is updated with each release
- Extension source code follows the npm build pipeline
- `updates.json` and `update.xml` files are present in the dist directory

### Secrets and credentials

These are stored as secrets of the `production` GitHub environment, whose deployment branches are limited to `main`. Only the deploy job (`environment: production`) can read them, so workflows on other branches cannot.

| Secret Name             | Purpose                                                     |
| ----------------------- | ----------------------------------------------------------- |
| `CHROME_KEY_PEM_B64`    | Base64-encoded Chrome extension signing key (PEM format)    |
| `WEB_EXT_API_KEY`       | Firefox AMO API key for signing                             |
| `WEB_EXT_API_SECRET`    | Firefox AMO API secret for signing                          |
| `R2_ACCESS_KEY_ID`      | Cloudflare R2 access key ID for storage                     |
| `R2_SECRET_ACCESS_KEY`  | Cloudflare R2 secret access key                             |
| `CF_ACCOUNT_ID`         | Cloudflare account ID for R2 endpoint                       |
| `R2_BUCKET_NAME`        | Name of the Cloudflare R2 bucket for storage                |
| `LXD_TOOLS_BUILD_TOKEN` | GitHub personal access token for lxd-tools-build repository |

> **`LXD_TOOLS_BUILD_TOKEN` expires on November 17, 2027.** It must be renewed before then (see [Renewing the build repository token](#renewing-the-build-repository-token)). If it lapses, the deploy fails at the "Push to lxd-tools-build" step.

## Build Process Steps

The workflow performs the following automated steps in sequence:

1. **Repository Checkout & Setup** — Clones the lxd-tools repository, sets up Node.js 24 and installs dependencies from the lockfile with `npm ci`. The packaging tools (`crx3`, `web-ext`) are installed at pinned versions from `.github/release-tools/` (see [Updating the release tools](#updating-the-release-tools)). 
2. **Version Validation** — Reads the version from `package.json` and verifies it hasn't been deployed before. A version counts as deployed once its GitHub Release (`v{VERSION}`) exists; the legacy unprefixed git tag `{VERSION}` used by older deploys is also checked. If a duplicate version is detected, the entire build fails with a clear error message to prevent accidental re-deployment. A bare `v{VERSION}` tag without a release does not block a re-run.
3. **Extension Compilation** — Runs `npm run build` to compile the extension source code into `dist/` inside the source repository. Since Actions checks out the source into `lxd-tools/`, the workspace-relative artifact path is `lxd-tools/dist/`. Local development builds use repo-local `lxd-extension-build/` with a separate extension identity.
4. **Platform-Specific Signing** — The compiled extension is signed for both platforms:
   - **Chrome**: Uses the crx3 tool with the private key to produce `lxd-extension-{VERSION}.crx`
   - **Firefox**: Uses the `web-ext sign` command with AMO API credentials to produce `lxd-extension-{VERSION}.xpi` signed for the unlisted channel

5. **Artifact Verification** — Validates that all required output files exist: both signed extensions (`.crx` and `.xpi`), plus the update manifests (`updates.json` and `update.xml`). File paths are captured for downstream steps.
6. **Upload to Cloudflare R2** — All artifacts are uploaded to the R2 bucket with appropriate content types. This includes both signed extensions and update manifests needed by the browser extension update mechanisms.
7. **Version Pruning** — Automatically deletes old versions from R2, keeping only the 5 most recent releases of each file type (`.crx` and `.xpi`). This reduces storage costs while maintaining version history.
8. **Sync to Build Repository** — The entire `dist` directory is copied to the `lxd-tools-build` repository on the `stable` branch, creating an audit trail of all deployments with commits attributed to `github-actions[bot]`.
9. **Release Branch** — A release branch (`release/{VERSION}`) is pushed for long-term reference and potential rollback scenarios. If the branch already exists on origin (from an earlier attempt), this step is skipped.
10. **GitHub Release** — The final step creates the `v{VERSION}` tag on the deployed commit and a GitHub Release in a single `gh release create` call. The release notes are the `CHANGELOG.md` section for the version (headings `## 3.3.1`, `## [3.3.1]` or `## [3.3.1] - date`, with empty subsections dropped); if that section is missing or has no entries, a warning is logged and GitHub-generated notes are used instead. The release has three assets: the signed `.crx` (Chrome), the signed `.xpi` (Firefox), and `lxd-extension-{VERSION}-build.zip`, the unpacked build for "Load unpacked" (it excludes the `.crx`, `.xpi` and update manifests). The release is created last on purpose: its existence is what marks the version as deployed.

## Important Considerations

### Version Management

- `package.json` version must be incremented **BEFORE** merging the PR
  - The pull reqest will be blocked from merging unless the package version is bumped
  - Bump it with `npm version <new version>` (e.g. `npm version 3.3.1` or `npm version patch`) rather than editing `package.json` by hand. This updates `package.json` and both version fields in `package-lock.json` (the top-level `version` and `packages[""].version`) in one step. The repository's `.npmrc` sets `git-tag-version=false`, so npm does not create a commit or a tag; the deploy workflow creates the `v`-prefixed tag (e.g. `v3.3.1`) and the GitHub Release itself.
  - The Version Check workflow also fails the PR if either `package-lock.json` version differs from `package.json`
- Duplicate version deployments are prevented by the version validation step
- If the version's GitHub Release (or a legacy unprefixed tag) already exists, the entire build fails with a clear error message
- Add the release notes to `CHANGELOG.md` under a heading for the new version (rename `Unreleased`) before merging, so the GitHub Release uses them

### Security

- The deploy job only runs from main and uses the `production` environment; the secrets are not available to other branches
- All secrets are referenced via `${{ secrets.VAR_NAME }}` syntax, per GitHub Actions format
- Chrome key is base64-encoded; it is decoded to the runner's temp directory only inside the pack step and deleted when that step ends
- Firefox API credentials are environment variables, never logged
- GitHub token used for pushing to build repository is scoped and temporary (it expires; see [Renewing the build repository token](#renewing-the-build-repository-token))

### Storage Retention

- Only the 5 most recent versions are retained in R2
- Older versions are automatically pruned to control costs
- This applies to both `.xpi` and `.crx` files

### Repository Structure

- **Source code**: `lxd-tools` repository (main branch)
- **Built artifacts**: `lxd-tools-build` repository (`stable` branch)
- This separation allows history tracking and rollback capability

## Workflow Execution Environment

- **Runner**: ubuntu-22.04
- **Permissions**: `contents: write` (for creating releases, tags and branches)
- **Timeout**: 45 minutes
- **Duration**: Typically 5-10 minutes depending on npm install time

## File Outputs

After successful execution, the following files are available:

| File                          | Location          | Platform | Purpose                     |
| ----------------------------- | ----------------- | -------- | --------------------------- |
| `lxd-extension-{VERSION}.crx` | R2 bucket & dist/ | Chrome   | Signed extension package    |
| `lxd-extension-{VERSION}.xpi` | R2 bucket & dist/ | Firefox  | Signed extension package    |
| `update.xml`                  | R2 bucket & dist/ | Chrome   | Update manifest for Chrome  |
| `updates.json`                | R2 bucket & dist/ | Firefox  | Update manifest for Firefox |

The GitHub Release for `v{VERSION}` additionally carries the `.crx`, the `.xpi` and `lxd-extension-{VERSION}-build.zip` (the unpacked build) as downloadable assets.

## Troubleshooting

### Build fails at version validation

**Cause**: `package.json` version was not incremented, or that version already has a GitHub Release (or a legacy unprefixed tag)

**Solution**:

1. Run `npm version <new version>` to update `package.json` and `package-lock.json` together
2. Land the change on main through a new pull request that includes the bump

### Re-running a failed deploy

After fixing the cause, start the workflow manually from main (Actions → "Deploy Extension Updates" → Run workflow).

- Most failures can simply be re-run. The GitHub Release is created last, and it is what the duplicate-version check looks for, so a run that failed earlier leaves nothing that blocks the next one. The release branch step skips a branch that already exists, and the R2 upload and `lxd-tools-build` push are safe to repeat.
- If the run failed at the final step after creating the release, the version counts as deployed and the check will stop a re-run. Finish the remaining work by hand, or delete the release and the `v{VERSION}` tag first.
- If the failure came after the Firefox signing step, AMO has already used that version number and will reject signing it again. Bump the version through a new pull request instead.

### Chrome extension fails to sign

**Cause**: Invalid or missing `CHROME_KEY_PEM_B64` secret

**Solution**:

1. Verify the secret is properly base64-encoded
2. Check that the PEM file is valid (openssl x509 -in cert.pem -text -noout)
3. Update the secret in GitHub repository settings if needed
4. Re-run the workflow

## Monitoring and Notifications

The workflow produces the following artifacts for monitoring:

- **GitHub Actions logs**: Real-time build output in Actions tab
- **GitHub Releases**: A `v{VERSION}` release (with tag, notes and the `.crx`, `.xpi` and build zip assets) created on successful deployment
- **Release branches**: Version-specific branches created at release/{VERSION}
- **lxd-tools-build commits**: Automatic commits showing deployment history

## Maintenance

### Before modifying the workflow

1. Test changes in a separate branch
2. Ensure all secrets are still available
3. Verify npm build script still works
4. Test signing keys are still valid
5. Review and test any version management changes

### Renewing the build repository token

`LXD_TOOLS_BUILD_TOKEN` is a GitHub personal access token with write access to `lxd-tools-build`. The organization caps token lifetime at 366 days, so it must be renewed every year. The current token **expires November 17, 2027**; renew it before then.

1. Generate a new token with the same scope (write access to `lxd-tools-build`) and a 366-day lifetime
2. Update the `LXD_TOOLS_BUILD_TOKEN` secret in the `production` environment (Settings → Environments → production)
3. Update the expiration date in this section and in the Secrets table above

If the token expires before renewal, the deploy fails at "Push to lxd-tools-build" and never reaches the release-branch and release steps. After renewing, push the build, branch and release by hand or re-run the workflow (see [Re-running a failed deploy](#re-running-a-failed-deploy)).

### Updating the release tools

`crx3` and `web-ext` are pinned in `.github/release-tools/package.json` and its own `package-lock.json`, separate from the extension's dependencies so the root `overrides` do not apply to them. To update them, change the versions there, run `npm install` in that folder, and commit both files. A pull request that only changes `.github/release-tools/` does not start the deploy workflow and does not need a version bump; the new versions are used by the next release. The Build testing workflow runs `npm ci --ignore-scripts` in that folder on every pull request, so an out-of-sync lockfile fails the PR.

## Related Documentation

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Firefox Add-on Development](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
