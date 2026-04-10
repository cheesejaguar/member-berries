# Releasing

This repository now has a `v1.0.0` release workflow built around git tags and GitHub releases.

## Current release-ready elements

- semantic version in `package.json`
- `CHANGELOG.md`
- repository/homepage/bugs metadata
- `files` allowlist for package contents
- `publishConfig.access = public`
- Pi package manifest in `package.json`

## Local verification before a release

Run:

```bash
npm test
npm run pack:check
```

What this proves:
- tests pass
- the package can be packed
- the package contents are limited to the intended files

## Installing from source today

Local path:

```bash
pi install /Users/aaron/Documents/member-berries
```

GitHub repo:

```bash
pi install git:github.com/cheesejaguar/member-berries
```

## Suggested release checklist

1. update `CHANGELOG.md`
2. bump `package.json` version
3. run `npm test`
4. run `npm run pack:check`
5. run a secret scan
6. inspect `git diff`
7. create a git tag (for example `v1.0.0`)
8. push branch and tag to GitHub
9. create a GitHub release with notes
10. optionally publish to npm later

## Important note

Even with publish metadata in place, you should only publish to npm after:
- the install path is stable
- docs match behavior
- the extension API is considered stable enough for users
- you are comfortable supporting the package outside of direct git installs
