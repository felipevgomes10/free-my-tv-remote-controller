/** The Paired Phone's credential, kept in the Home Screen app's own storage. */
const CREDENTIAL = "fmtv-controller.credential";

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
