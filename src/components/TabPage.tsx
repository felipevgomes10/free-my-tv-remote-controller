import type { ComponentChildren } from "preact";
import type { Status } from "../connection";

/** Why a tab other than the Controls tab can't show the TV's lists yet. */
function notReady(status: Status): string | undefined {
  switch (status) {
    case "ready":
      return undefined;
    case "connecting":
      return "Conectando à TV…";
    default:
      return "Sem conexão com a TV. Esta aba volta a mostrar o que há nela quando a TV responder.";
  }
}

/** The Apps and Watch tabs' frame: their title, and why they're empty while the TV isn't ready. */
export function TabPage({ title, status, children }: { title: string; status: Status; children?: ComponentChildren }) {
  const reason = notReady(status);
  return (
    <main class="tab-page">
      <h1 class="title">{title}</h1>
      {reason ? (
        <p class="tab-notice" role="status">
          {reason}
        </p>
      ) : (
        children
      )}
    </main>
  );
}
