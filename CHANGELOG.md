# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Grading policy test added to syllabus tests to check for "extenuating circumstance" line
- package-lock.json removed from gitignore
- ImportHelpers created to house helper functions for extracting & importing content into syllabus body
- handleImportClicks created as main handler for import button click
- Test coverage for the import suite

### Changed

- README updated to reflect ueu-canvas being a npm package
- README.dist updated to expand on extension features to help user understanding
- resizeBanner.ts change so fileName will end with .png
- copy-webpack-plugin dependency updated
- updateStartDate refactored to handle edge case where malformed syllabus error throws silently

### Removed
