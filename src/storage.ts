/** The Paired Phone's credential, kept in the Home Screen app's own storage. */
const CREDENTIAL = "fmtv-controller.credential";
/** The last TV's name, for the header while the TV is out of reach. */
const TV_NAME = "fmtv-controller.tv-name";

export function loadTvName(): string {
  try {
    return localStorage.getItem(TV_NAME) ?? "TV";
  } catch {
    return "TV";
  }
}

export function saveTvName(name: string) {
  try {
    localStorage.setItem(TV_NAME, name);
  } catch {
    // The header says "TV" next time.
  }
}

export function loadCredential(): string | undefined {
  try {
    return localStorage.getItem(CREDENTIAL) ?? undefined;
  } catch {
    return undefined;
  }
}

export function saveCredential(credential: string) {
  try {
    localStorage.setItem(CREDENTIAL, credential);
  } catch {
    // Private mode: Pairing works for this open only.
  }
}

export function forgetCredential() {
  try {
    localStorage.removeItem(CREDENTIAL);
  } catch {
    // Nothing kept.
  }
}
