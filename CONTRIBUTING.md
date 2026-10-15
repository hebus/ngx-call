# Contributing — releases with Changesets

`ngx-call` uses [Changesets](https://github.com/changesets/changesets) to manage versions and the changelog of the published package (`projects/ngx-call`).

> **Never edit the `version` field by hand.** Every PR that changes the library declares its release intent with a *changeset* file.

## In every PR touching the library

```bash
npm run changeset
```

Pick the bump and write a summary aimed at **consumers** of the library (not a commit message). This creates a file like `.changeset/tricky-lions-sleep.md`:

```md
---
"ngx-call": minor
---

Add `foo()` helper
```

Commit it with your change. The `Changeset Check` workflow fails the PR if none is present.

| Bump | When |
|---|---|
| `patch` | bug fix, nothing new in the API |
| `minor` | backward-compatible addition |
| `major` | breaking change (while `0.x`, a `minor` is the breaking bump) |

**No release needed** (docs, CI, demo, chore): add `#skip-changeset` to the PR title, or the `skip-changeset` label, or run `npx changeset --empty`.

## Releasing (maintainer)

1. On every push to `main`, the `Release PR` workflow opens/updates a **"chore: version packages"** PR that bumps `projects/ngx-call/package.json` and writes `projects/ngx-call/CHANGELOG.md`.
2. Merge it when you want to ship.
3. Publish locally (npm 2FA/OTP, tag, GitHub Release) with `npm run release` (add `-- --dry-run` to rehearse, `-- --userconfig <.npmrc>` to pick the npm account), or with the `release` skill — see `.claude/skills/release/SKILL.md`.

## Cheat sheet

```bash
npm run changeset          # add a changeset
npm run changeset:status   # what would be released
npm run changeset:version  # apply bumps + changelog (CI; needs GITHUB_TOKEN)
```

## One-time repo setup

GitHub → Settings → Actions → General → Workflow permissions: **Read and write** + tick **Allow GitHub Actions to create and approve pull requests**.
