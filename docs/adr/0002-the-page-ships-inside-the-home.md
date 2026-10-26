# The Web Remote's page ships inside the Home's APK, at a version the Home pins

The Web Remote is its own project, built and released from this repository, but it is never hosted on its own: Safari won't let an HTTPS page on the internet call the Home's plain-HTTP address on the home network, so the Home serves the page next to its bridge. Each release here publishes the built page as a zip on GitHub; free-my-tv pins the version it uses and its checksum in `gradle.properties`, and its build downloads, verifies and unpacks that zip into the APK's assets. Each Home release therefore carries the one page that speaks its bridge's language, the page works without internet, and the Home's release stays the only way anything new reaches the TV.

## Considered Options

- **The Home downloads the newest page from this repository's releases at run time**, like an Update Source: the page could change without a Home release, but page and bridge could drift into incompatible versions.
- **Hosting the page on the internet**: needs either a real domain and certificate pointing at the TV, renewed by the Home, or WebRTC through a signalling server, making a remote control depend on the internet.
- **Copying the built page into free-my-tv's `third_party/`**: no network at build time, but generated, minified files in its history.
- **A git submodule built by Gradle**: always from source, but the Home's build would need Node.
- **Reading a sibling checkout's `dist/`**: only works on one computer, at whatever version happens to be there.
