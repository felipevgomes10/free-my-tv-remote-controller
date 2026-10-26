import { icons, type IconName } from "../icons";

export function Icon({ name, size = 30 }: { name: IconName; size?: number }) {
  const svg = icons[name].replace("<svg ", `<svg fill="currentColor" width="${size}" height="${size}" `);
  return <span class="icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
}
