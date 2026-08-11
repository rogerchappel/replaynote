# Changelog

All notable changes to this project will be documented in this file.

This project follows the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
format and uses semantic versioning when versioned releases are published.

## [Unreleased]

- Added release-readiness validation for package metadata, CI placeholder cleanup, and package smoke coverage.
- Fixed command-start failures to report concise executable or working-directory context instead of Node.js internal stack traces.
- Fixed fixture validation to reject incomplete result metadata and non-string command entries before formatting.
- Fixed fixture read, JSON parse, and output write failures to report concise path-aware diagnostics with exit status 2.
### Added

- Initial project setup.

## Release Links

- Unreleased:
  `https://github.com/rogerchappel/replaynote/compare/...HEAD`
- Latest release:
  `https://github.com/rogerchappel/replaynote/releases/latest`

Replace placeholder links once the first release tag exists.
