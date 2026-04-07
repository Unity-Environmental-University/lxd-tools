# LXD Tools Extension Build Process

## Overview

This document describes the automated build and deployment process for the LXD browser extension. The workflow is triggered when a pull request is merged to the main branch and handles building, signing, and distributing the extension across multiple platforms (Chrome and Firefox).

The deployment pipeline manages version control, package signing, storage on Cloudflare R2, and maintains a clean version history.

## Workflow Trigger

### When the workflow runs

- A pull request is merged to the main branch
- The event type must be 'closed' (not open, reopened, or synchronize)

### What triggers it NOT to run

- Pull request is closed without merging
- Pull request is opened or updated

## Pre-requisites

### Repository requirements

- Version number in `package.json` is updated with each release
- Extension source code follows the npm build pipeline
- `updates.json` and `update.xml` files are present in the dist directory

### Secrets and credentials

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

## Build Process Steps

The workflow performs the following automated steps in sequence:

1. **Repository Checkout & Setup** — Clones the lxd-tools repository and installs Node.js 20 with all dependencies. Git tags are fetched to enable version detection.
2. **Version Validation** — Reads the version from `package.json` and verifies it hasn't been deployed before by checking for an existing git tag. If a duplicate version is detected, the entire build fails with a clear error message to prevent accidental re-deployment.
3. **Extension Compilation** — Runs `npm run build` to compile the extension source code into the `dist` directory.
4. **Platform-Specific Signing** — The compiled extension is signed for both platforms:
   - **Chrome**: Uses the crx3 tool with the private key to produce `lxd-extension-{VERSION}.crx`
   - **Firefox**: Uses the `web-ext sign` command with AMO API credentials to produce `lxd-extension-{VERSION}.xpi` signed for the unlisted channel

5. **Artifact Verification** — Validates that all required output files exist: both signed extensions (`.crx` and `.xpi`), plus the update manifests (`updates.json` and `update.xml`). File paths are captured for downstream steps.
6. **Upload to Cloudflare R2** — All artifacts are uploaded to the R2 bucket with appropriate content types. This includes both signed extensions and update manifests needed by the browser extension update mechanisms.
7. **Version Pruning** — Automatically deletes old versions from R2, keeping only the 5 most recent releases of each file type (`.crx` and `.xpi`). This reduces storage costs while maintaining version history.
8. **Sync to Build Repository** — The entire `dist` directory is copied to the `lxd-tools-build` repository on the main branch, creating an audit trail of all deployments with commits attributed to `github-actions[bot]`.
9. **Git Release Management** — A git tag matching the version number is created and pushed, and a corresponding release branch (`release/{VERSION}`) is created for long-term reference and potential rollback scenarios.

## Important Considerations

### Version Management

- `package.json` version must be incremented **BEFORE** merging the PR
  - The pull reqest will be blocked from merging unless the package version is bumped
- Duplicate version deployments are prevented by version validation step
- If version already exists, entire build fails with clear error message

### Security

- All secrets are referenced via `${{ secrets.VAR_NAME }}` syntax, per GitHub Actions format
- Chrome key is base64-encoded and must be decoded before use
- Firefox API credentials are environment variables, never logged
- GitHub token used for pushing to build repository is scoped and temporary

### Storage Retention

- Only the 5 most recent versions are retained in R2
- Older versions are automatically pruned to control costs
- This applies to both `.xpi` and `.crx` files

### Repository Structure

- **Source code**: `lxd-tools` repository (main branch)
- **Built artifacts**: `lxd-tools-build` repository (main branch)
- This separation allows history tracking and rollback capability

## Workflow Execution Environment

- **Runner**: ubuntu-latest
- **Permissions**: `contents: write` (for creating tags and commits)
- **Duration**: Typically 5-10 minutes depending on npm install time

## File Outputs

After successful execution, the following files are available:

| File                          | Location          | Platform | Purpose                     |
| ----------------------------- | ----------------- | -------- | --------------------------- |
| `lxd-extension-{VERSION}.crx` | R2 bucket & dist/ | Chrome   | Signed extension package    |
| `lxd-extension-{VERSION}.xpi` | R2 bucket & dist/ | Firefox  | Signed extension package    |
| `update.xml`                  | R2 bucket & dist/ | Chrome   | Update manifest for Chrome  |
| `updates.json`                | R2 bucket & dist/ | Firefox  | Update manifest for Firefox |

## Troubleshooting

### Build fails at version validation

**Cause**: `package.json` version was not incremented

**Solution**:

1. Update `package.json` with a new version number
2. Push the change to a new commit or amend the PR
3. Re-merge the PR to trigger the workflow again

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
- **Git tags**: Version tags created on successful deployment (visible in Releases)
- **Release branches**: Version-specific branches created at release/{VERSION}
- **lxd-tools-build commits**: Automatic commits showing deployment history

## Maintenance

### Before modifying the workflow

1. Test changes in a separate branch
2. Ensure all secrets are still available
3. Verify npm build script still works
4. Test signing keys are still valid
5. Review and test any version management changes

## Related Documentation

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Firefox Add-on Development](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
