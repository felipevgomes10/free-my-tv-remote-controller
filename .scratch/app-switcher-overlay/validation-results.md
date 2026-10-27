# Controller validation and local bundle — 2026-10-26

- `npm test`: **99 tests passed** across 9 files, including `tests/multitasking.test.tsx`.
- `npm run build`: passed; no dependency added.
- Browser: dedicated button shown beside the navigation controls, successful request against the development bridge, and all primary controls fit at 320 × 740 CSS pixels. [Controls](evidence/controls.png), [narrow viewport](evidence/controls-320.png), [reusable fixture](viewport-check.html).
- Local bundle: `release/web-remote-app-switcher-candidate.zip`.
- Bundle SHA-256: `e12caf144392ee87e55ddd6aaae6d5b386fd0de47c5261c5a0da1206fb2c4201`.
- The Home's tests consume this bundle's examples, and its candidate APKs embed this bundle's page.

This bundle is built from unreleased source with the current page version; it is not a GitHub release. The Home can consume it with `-PwebRemoteZip=/Users/felipe_gomes/Documents/repos/free-my-tv-remote-controller/release/web-remote-app-switcher-candidate.zip`.

See the [Home acceptance results](../../../free-my-tv/.scratch/app-switcher-overlay/acceptance-results.md) for actual emulator evidence and the remaining TCL/iPhone checks. After those pass, use the existing page release workflow, update the Home's page version/SHA pin, then build/release/install the Home through its existing workflow. Neither publication nor a production pin change was performed here.

**Subsequent TV test, 2026-10-26:** A fresh Controller build was bundled in Home `0.6.4-multitarefas` and installed on the TCL at the owner's request. The owner confirmed the real iPhone opening/Back flow over Disney+. The TV serves the new assets byte-for-byte. See [TV installation results](../../../free-my-tv/.scratch/app-switcher-overlay/tv-install-test.md); public release/pinning is still a separate step.
