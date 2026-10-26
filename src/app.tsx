import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { type Bridge, connectBridge } from "./bridge";
import { AddToHomeScreen } from "./components/AddToHomeScreen";
import { Controls } from "./components/Controls";
import { PairingScreen } from "./components/PairingScreen";
import { isIosSafariTab } from "./pairing";
import type { Key, KeyAction } from "./protocol";
import { loadCredential, saveCredential } from "./storage";

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
  return <Connected bridgeUrl={bridgeUrl} credential={credential} />;
}

function Connected({ bridgeUrl, credential }: { bridgeUrl: string; credential: string }) {
  const bridge = useRef<Bridge>(undefined);
  const [tvName, setTvName] = useState("TV");

  useEffect(() => {
    bridge.current = connectBridge(bridgeUrl, credential, {
      onReady: setTvName,
      onClosed: () => {},
    });
    return () => bridge.current?.close();
  }, [bridgeUrl, credential]);

  const send = useCallback((key: Key, action: KeyAction) => {
    bridge.current?.sendKey(key, action);
  }, []);

  return <Controls tvName={tvName} send={send} />;
}
