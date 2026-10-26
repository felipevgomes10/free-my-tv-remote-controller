import type { IconName } from "../icons";
import { Icon } from "./Icon";

export type Tab = "controls" | "apps" | "watch";

const tabs: [Tab, string, IconName][] = [
  ["controls", "Controle", "settingsRemote"],
  ["apps", "Apps", "apps"],
  ["watch", "Assistir", "playCircle"],
];

/** The floating tab bar: the Controls, Apps and Watch tabs. */
export function TabBar({ tab, onTab }: { tab: Tab; onTab: (tab: Tab) => void }) {
  return (
    <nav class="tab-bar" aria-label="Abas">
      <div class="tab-capsule" role="tablist">
        {tabs.map(([id, label, icon]) => (
          <button
            type="button"
            role="tab"
            key={id}
            class={`tab${id === tab ? " selected" : ""}`}
            aria-selected={id === tab}
            onClick={() => onTab(id)}
          >
            <Icon name={icon} size={24} />
            <span class="tab-label">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
