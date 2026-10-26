import { createContext } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";

/** The Paired Phone's credential, for fetching the Home's pictures. */
export const CredentialContext = createContext<string>("");

const loaded = new Map<string, Promise<string>>();

/**
 * One of the Home's pictures (an App Banner, an Up Next still), fetched once from the bridge
 * with the credential in a header, never in the URL (ADR 0006), and kept as a blob URL for as
 * long as the page is open.
 */
export function loadPicture(id: string, credential: string): Promise<string> {
  let picture = loaded.get(id);
  if (!picture) {
    picture = fetch(`/pictures/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${credential}` } }).then(
      async (response) => {
        if (!response.ok) throw new Error(`picture ${id}: ${response.status}`);
        return URL.createObjectURL(await response.blob());
      },
    );
    // A failed fetch is tried again the next time the picture is shown.
    picture.catch(() => loaded.delete(id));
    loaded.set(id, picture);
  }
  return picture;
}

/** Forgets every picture, for a new credential. */
export function forgetPictures() {
  loaded.clear();
}

type Props = { id?: string; alt?: string; class?: string };

/** A picture from the Home, a plain tile until it arrives. */
export function Picture({ id, alt = "", class: className }: Props) {
  const credential = useContext(CredentialContext);
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    setUrl(undefined);
    if (!id) return;
    let live = true;
    loadPicture(id, credential).then(
      (loadedUrl) => live && setUrl(loadedUrl),
      () => {},
    );
    return () => {
      live = false;
    };
  }, [id, credential]);

  return url ? <img class={`picture ${className ?? ""}`} src={url} alt={alt} /> : <span class={`picture placeholder ${className ?? ""}`} aria-hidden="true" />;
}
