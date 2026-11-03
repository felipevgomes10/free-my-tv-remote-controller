import { createContext, type ComponentChildren } from "preact";
import { useContext, useState } from "preact/hooks";

export type Shortcut = { kind: "app" | "input"; target: string; label: string };
const STORAGE_KEY = "fmtv-controller.shortcuts.v1";
export const shortcutKey = (item: Shortcut) => `${item.kind}:${item.target}`;

function load(): Shortcut[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(value)) return [];
    const seen = new Set<string>();
    return value.filter((item): item is Shortcut => {
      if (!item || (item.kind !== "app" && item.kind !== "input") || typeof item.target !== "string" || !item.target || typeof item.label !== "string" || !item.label) return false;
      const key = shortcutKey(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch {
    return [];
  }
}

type Shortcuts = {
  items: Shortcut[];
  saved: boolean;
  add: (item: Shortcut) => void;
  remove: (key: string) => void;
  move: (key: string, direction: -1 | 1) => void;
};
const ShortcutsContext = createContext<Shortcuts | undefined>(undefined);

/** This phone's own ordered list, independent of the physical Remote's buttons. */
export function ShortcutsProvider({ children }: { children: ComponentChildren }) {
  const [items, setItems] = useState(load);
  const [saved, setSaved] = useState(true);
  function change(next: Shortcut[]) {
    setItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }
  return <ShortcutsContext.Provider value={{
    items, saved,
    add: (item) => {
      if (!items.some((current) => shortcutKey(current) === shortcutKey(item))) change([...items, item]);
    },
    remove: (key) => change(items.filter((item) => shortcutKey(item) !== key)),
    move: (key, direction) => {
      const index = items.findIndex((item) => shortcutKey(item) === key);
      const destination = index + direction;
      if (index < 0 || destination < 0 || destination >= items.length) return;
      const next = [...items];
      [next[index], next[destination]] = [next[destination], next[index]];
      change(next);
    },
  }}>{children}</ShortcutsContext.Provider>;
}

export function useShortcuts() {
  const shortcuts = useContext(ShortcutsContext);
  if (!shortcuts) throw new Error("ShortcutsProvider is required");
  return shortcuts;
}
