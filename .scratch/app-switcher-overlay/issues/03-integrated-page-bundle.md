# 03: Prepare the page bundle for integrated TV validation

**Status:** resolved

**Blocked by:** [Controller 02: Multitarefas button](02-multitarefas-button.md), [Home 03: Bridge command](../../../../free-my-tv/.scratch/app-switcher-overlay/issues/03-open-app-switcher-command.md).

**What to build:** Package the page and protocol examples together using the existing release tooling's dry-run/local path. Hand the candidate to [Home 04: TV acceptance](../../../../free-my-tv/.scratch/app-switcher-overlay/issues/04-tv-acceptance.md), which validates the combined build. Follow the [spec](../spec.md).

- [x] `npm test` and `npm run build` pass with the final contract.
- [x] The local zip includes the button and shared protocol examples; record its version/path/checksum under Comments.
- [x] Home builds/tests can consume it with `-PwebRemoteZip=<path>`; verify that the page served by the candidate Home is this bundle.
- [x] An older bridge produces the update message; an older page retains its original controls against the new Home.
- [x] Record the release/pin steps needed after Home 04 passes. Publication, pinning a public release and installing on the owner's TV remain subject to the existing release workflow and its authorization requirements.

## Comments

**2026-10-26:** Local bundle and integrated Home debug/release APKs built successfully. See ../validation-results.md. Physical combined acceptance and the release/pin workflow remain.
