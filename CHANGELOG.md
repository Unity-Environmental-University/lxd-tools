# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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

### Internal

- package-lock.json removed from gitignore
- CHANGELOG.md added(very meta)
- Information about CHANGELOG added to README
- docs/KNOWLEDGE_BASE.md created to host specific knowledge about this code base
- Deployed dependabot for dependency alerts/updates
