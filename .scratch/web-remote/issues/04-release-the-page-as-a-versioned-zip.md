# 04: Release the page as a versioned zip

**What to build:** A release script for this repository, in the spirit of free-my-tv's release script, that publishes the built Web Remote for the Home to pin (ADR 0002).
- From a clean `main`, it bumps the page's version, builds it and zips the result as `web-remote-<version>.zip`, printing its SHA-256.
- A dry run builds only. A real run asks the owner to type `sim`, then commits, tags `v<version>`, pushes `main` and the tag, and creates the GitHub release with the zip and its checksum.
- The README says how to release and how free-my-tv pins a version.

The spec is `.scratch/web-remote/spec.md` in free-my-tv-remote-controller. Tickets are numbered across both repositories: 01, 02, 06, 07 and 09 live in free-my-tv; 03, 04, 05 and 08 in free-my-tv-remote-controller.

**Blocked by:** 03 (The Web Remote's controls, against a fake bridge)

**Status:** resolved

- [x] A dry run produces the zip and its checksum without touching git or GitHub
- [x] A real run refuses a dirty tree or a branch other than `main`
- [x] A real run waits for `sim` before committing, tagging, pushing and publishing
- [x] The published release holds the zip, and its checksum matches the one printed
- [x] The README documents releasing and pinning

## Comments

**2026-10-26, done.** The guards were checked with a bad version and a dirty tree, and the dry run built the zip with `page/` and `protocol/`. With the owner's go-ahead, `scripts/release.sh 0.1.0` published [v0.1.0](https://github.com/felipevgomes10/free-my-tv-remote-controller/releases/tag/v0.1.0); the zip downloaded from it has the SHA-256 printed (`30ec302c…`). free-my-tv pins it, and its build downloaded and checked it; the Home's v0.5.0 carries it.
