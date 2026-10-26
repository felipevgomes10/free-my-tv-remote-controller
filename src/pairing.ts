export type PairingRefusal = "wrong-code" | "pairing-closed" | "too-many-tries" | "unreachable";

export type PairingResult = { credential: string } | { refusal: PairingRefusal };

/** Pairing: one request with the code on the TV and the phone's name (protocol/README.md). */
export async function requestPairing(code: string, name: string): Promise<PairingResult> {
  let response: Response;
  try {
    response = await fetch("/pair", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, name }),
    });
  } catch {
    return { refusal: "unreachable" };
  }
  const body = await response.json().catch(() => ({}));
  if (response.ok && typeof body.credential === "string") return { credential: body.credential };
  if (body.error === "wrong-code" || body.error === "pairing-closed" || body.error === "too-many-tries") {
    return { refusal: body.error };
  }
  return { refusal: "unreachable" };
}

/** In a Safari tab on iOS, as opposed to the app opened from the Home Screen. */
export function isIosSafariTab(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return "standalone" in nav && nav.standalone === false;
}
