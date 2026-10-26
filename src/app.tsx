import { useState } from "preact/hooks";
import { AddToHomeScreen } from "./components/AddToHomeScreen";
import { Controls } from "./components/Controls";
import { MessageScreen } from "./components/MessageScreen";
import { PairingScreen } from "./components/PairingScreen";
import { useConnection } from "./connection";
import { isIosSafariTab } from "./pairing";
import { forgetCredential, loadCredential, saveCredential } from "./storage";

type Phase = "add-to-home" | "pairing" | "controls";

function firstPhase(credential: string | undefined): Phase {
  if (credential) return "controls";
  return isIosSafariTab() ? "add-to-home" : "pairing";
}

export function App({ bridgeUrl }: { bridgeUrl: string }) {
  const [credential, setCredential] = useState(loadCredential);
  const [phase, setPhase] = useState<Phase>(() => firstPhase(credential));

  if (phase === "add-to-home") return <AddToHomeScreen onPairHere={() => setPhase("pairing")} />;
  if (phase === "pairing" || !credential) {
    return (
      <PairingScreen
        onPaired={(paired) => {
          saveCredential(paired);
          setCredential(paired);
          setPhase("controls");
        }}
      />
    );
  }
  return (
    <Connected
      bridgeUrl={bridgeUrl}
      credential={credential}
      onPairAgain={() => {
        forgetCredential();
        setCredential(undefined);
        setPhase("pairing");
      }}
    />
  );
}

function Connected({ bridgeUrl, credential, onPairAgain }: { bridgeUrl: string; credential: string; onPairAgain: () => void }) {
  const { status, tvName, send, tryTurnOn } = useConnection(bridgeUrl, credential);

  if (status === "not-linked") {
    return (
      <MessageScreen icon="linkOff" title="O Home ainda não está vinculado à TV">
        <p class="explanation">
          Sem isso, as teclas não chegam aos apps. No controle físico, abra Configurações → FMTV Controller e escolha
          Vincular.
        </p>
        <p class="explanation">Esta tela some sozinha assim que o Home for vinculado.</p>
      </MessageScreen>
    );
  }
  if (status === "revoked") {
    return (
      <MessageScreen
        icon="mobileOff"
        title="Este iPhone não está mais pareado"
        action={{ label: "Parear de novo", onClick: onPairAgain }}
      >
        <p class="explanation">
          Ele foi removido dos aparelhos pareados da TV. Para voltar a usar o FMTV Controller, pareie de novo com o
          código da TV.
        </p>
      </MessageScreen>
    );
  }
  return <Controls tvName={tvName} status={status} send={send} onTryTurnOn={tryTurnOn} />;
}
