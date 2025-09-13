# Changelog

## Unreleased

- fix: avoid redirect loop after sign-in by excluding auth routes from middleware matcher and setting Clerk components to redirect to dashboard
- chore: add env example and test scripts
- test: add unit test for safeAuth and e2e guard test
