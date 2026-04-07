# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## 3.1.0

### Added

- Grading policy test added to syllabus tests to check for "extenuating circumstance" line
- ImportHelpers created to house helper functions for extracting & importing content into syllabus body
- handleImportClicks created as main handler for import button click
- Test coverage for the import suite

### Changed

- README updated to reflect ueu-canvas being a npm package
- README.dist updated to expand on extension features to help user understanding
- resizeBanner.ts change so fileName will end with .png
- copy-webpack-plugin dependency updated
- updateStartDate refactored to handle edge case where malformed syllabus error throws silently
- push-test now includes linting and type checks
- The course overview test was refactored to accomodate both UG and Grad langauge
- The academic integrity process has changed to reflect the module name changing to "Citation and Attribution Learning Module"
- Syllabus and course overview tests now checking for the old policy tech link

### Internal

- package-lock.json removed from gitignore
- CHANGELOG.md added(very meta)
- Information about CHANGELOG added to README
- docs/KNOWLEDGE_BASE.md created to host specific knowledge about this code base
- Deployed dependabot for dependency alerts/updates
- Intentionally unused variables now universally feature a leading underscore
- URL checking patterns updated to avoid partial match injection
- main-delpoy workflow changed to accomodate new bucket for auto-update files
- main-deploy automates releases and pulls release notes from the changelog
- build.yml created as manual testing for the file deploy system
- Dependencies updated
- Dependabot changed to only alert, not open PR requests, to avoid PR requests to main that trigger the build pipeline
