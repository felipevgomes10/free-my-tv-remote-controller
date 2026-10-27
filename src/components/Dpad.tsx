import type { Key, KeyAction } from "../protocol";
import { Icon } from "./Icon";
import { RemoteButton } from "./RemoteButton";

type Props = {
  send: (key: Key, action: KeyAction) => void;
  enabled: boolean;
};

export function Dpad({ send, enabled }: Props) {
  return (
    <div class="dpad" role="group" aria-label="D-pad">
      {([
        ["up", "Cima"],
        ["left", "Esquerda"],
        ["right", "Direita"],
        ["down", "Baixo"],
      ] as const).map(([key, label]) => (
        <RemoteButton key={key} label={label} keyName={key} behaviour="repeat" send={send}
          disabled={!enabled} class={`dpad-button dpad-${key}`}>
          <Icon name="chevronUp" size={28} />
        </RemoteButton>
      ))}
      <RemoteButton label="OK" keyName="ok" behaviour="hold" send={send}
        disabled={!enabled} class="dpad-button dpad-ok">
        <span>OK</span>
      </RemoteButton>
    </div>
  );
}
