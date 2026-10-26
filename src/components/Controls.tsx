import type { Key, KeyAction } from "../protocol";
import { Icon } from "./Icon";
import { RemoteButton } from "./RemoteButton";
import { Touchpad } from "./Touchpad";

type Props = { tvName: string; send: (key: Key, action: KeyAction) => void };

export function Controls({ tvName, send }: Props) {
  return (
    <main class="screen controls">
      <header class="controls-header">
        <h1 class="tv-name">{tvName}</h1>
        <RemoteButton label="Desligar" keyName="power" send={send} class="round-button small">
          <Icon name="power" size={22} />
        </RemoteButton>
      </header>

      <Touchpad send={send} />

      <div class="buttons">
        <div class="button-column">
          <RemoteButton label="Voltar" keyName="back" send={send}>
            <Icon name="arrowBack" />
          </RemoteButton>
          <RemoteButton label="Play ou pausa" keyName="play-pause" send={send}>
            <Icon name="playPause" />
          </RemoteButton>
        </div>
        <div class="button-column">
          <RemoteButton label="Home" keyName="home" behaviour="hold" send={send}>
            <Icon name="home" />
          </RemoteButton>
          <RemoteButton label="Mudo" keyName="mute" send={send}>
            <Icon name="volumeOff" />
          </RemoteButton>
        </div>
        <div class="volume" role="group" aria-label="Volume">
          <RemoteButton label="Aumentar volume" keyName="volume-up" behaviour="repeat" send={send} class="volume-button">
            <Icon name="add" />
          </RemoteButton>
          <span class="volume-mark">
            <Icon name="volumeUp" size={20} />
          </span>
          <RemoteButton label="Diminuir volume" keyName="volume-down" behaviour="repeat" send={send} class="volume-button">
            <Icon name="remove" />
          </RemoteButton>
        </div>
      </div>
    </main>
  );
}
