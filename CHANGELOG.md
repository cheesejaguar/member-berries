# Changelog

All notable changes to `member-berries` will be documented in this file.

The format is intentionally simple and human-readable.

## [1.0.0] - 2026-04-10

### Added
- guided interactive `/memory-promote` flow using Pi UI prompts
- stronger heading-aware and path-aware search ranking
- `v1.0.0` release prep with package metadata, changelog, and GitHub release workflow

### Changed
- `memory-promote` now supports both no-arg guided mode and explicit structured arguments
- ranking now treats subsection headings and path-like query terms as stronger relevance signals
- release docs now document the `v1.0.0` release path

## [0.2.0] - 2026-04-10

### Added
- checkpoint hooks on pre-compact and shutdown
- `memory-prune` command for duplicate-checkpoint cleanup
- `memory-promote` command for safer durable-memory promotion
- `memory_promote` tool for structured promotion into durable memory
- release-oriented package metadata and `npm pack --dry-run` support
- demo workflow docs and Pi package install guidance

### Changed
- package metadata now includes repository, homepage, bugs, files list, and publish config
- README and extension docs now describe the package-style install path and MVP feature set more clearly

## [0.1.0] - 2026-04-10

### Added
- onboarding docs
- templates
- sample project
- extension MVP
- tested helper core
