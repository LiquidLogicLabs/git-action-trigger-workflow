## [2.0.2](https://github.com/LiquidLogicLabs/git-action-trigger-workflow/compare/v2.0.1...v2.0.2) (2026-04-21)


### Bug Fixes

* correct action runtime to node24 ([fd7b063](https://github.com/LiquidLogicLabs/git-action-trigger-workflow/commit/fd7b063d5ce5875fe4b567df09bed6e70d5ac8a1))


### Features

* remove misapplied deprecationMessages, add status/endpoint outputs, bump @actions/core to v2 ([86bd29c](https://github.com/LiquidLogicLabs/git-action-trigger-workflow/commit/86bd29c34de7c98c948da4b3be50484b29edfe4b))



# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2024-12-22

### Added
- Initial release of git-action-trigger-workflow (initially published as gitea-action-trigger-workflow)
- Node-based action to trigger workflows in remote Gitea repositories
- Support for workflow discovery by name
- Configurable inputs: repo, workflow_name, ref, base_url, token, inputs, verbose
- Automatic base URL and token resolution from runner environment
- Comprehensive documentation and examples
- Unit tests with Jest
- CI workflows for Gitea and GitHub
- Release workflows with changelog generation from Conventional Commits
