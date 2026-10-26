import type { ComponentChildren } from "preact";
import type { IconName } from "../icons";
import { Icon } from "./Icon";

type Props = { icon: IconName; title: string; children: ComponentChildren; action?: { label: string; onClick: () => void } };

/** A full screen that explains why the controls aren't there, and what fixes it. */
export function MessageScreen({ icon, title, children, action }: Props) {
  return (
    <main class="screen message-screen notice">
      <span class="message-icon">
        <Icon name={icon} size={30} />
      </span>
      <div class="message-text">
        <h1 class="title">{title}</h1>
        {children}
      </div>
      <div class="spacer" />
      {action && (
        <button type="button" class="primary-button" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </main>
  );
}
