import type { Status } from "../connection";
import type { Key, KeyAction } from "../protocol";
import { Icon } from "./Icon";
import { RemoteButton } from "./RemoteButton";
import { ShortcutRow } from "./ShortcutRow";
import { Touchpad } from "./Touchpad";
import { MultitaskingButton } from "./MultitaskingButton";

type Props = {
  tvName: string;
  status: Status;
  send: (key: Key, action: KeyAction) => void;
  onTryTurnOn: () => void;
};

export function Controls({ tvName, status, send, onTryTurnOn }: Props) {
  const ready = status === "ready";
  const outOfReach = status === "out-of-reach" || status === "turning-on" || status === "turn-on-failed";

  return (
    <main class="screen controls">
      <header class="controls-header">
        <h1 class="tv-name">{tvName}</h1>
        <fieldset class="control-group" disabled={!ready}>
          <RemoteButton label="Desligar" keyName="power" send={send} class="round-button small">
            <Icon name="power" size={22} />
          </RemoteButton>
        </fieldset>
      </header>

      {outOfReach ? <OutOfReach status={status} onTryTurnOn={onTryTurnOn} /> : <Touchpad send={send} enabled={ready} />}

      <ShortcutRow />

      <fieldset class="control-group buttons" disabled={!ready}>
        <MultitaskingButton />
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
      </fieldset>
    </main>
  );
}

function OutOfReach({ status, onTryTurnOn }: { status: Status; onTryTurnOn: () => void }) {
  const failed = status === "turn-on-failed";
  return (
    <section class="touchpad out-of-reach" role="status">
      <span class="attention-icon">
        <Icon name="wifiOff" size={36} />
      </span>
      <div class="out-of-reach-text">
        <h2 class="out-of-reach-title">Sem conexão com a TV</h2>
        <p class="out-of-reach-detail">
          {failed
            ? "A TV não respondeu. Ligue-a pelo controle físico; o FMTV Controller volta sozinho em seguida."
            : "A TV pode estar desligada ou este iPhone em outra rede Wi-Fi. O controle volta sozinho quando a TV responder."}
        </p>
      </div>
      <button type="button" class="pill-button" onClick={onTryTurnOn} disabled={status === "turning-on"}>
        <Icon name="power" size={20} />
        {status === "turning-on" ? "Tentando ligar…" : failed ? "Tentar de novo" : "Tentar ligar a TV"}
      </button>
    </section>
  );
}
