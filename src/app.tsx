import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { type Bridge, connectBridge } from "./bridge";
import { Controls } from "./components/Controls";
import type { Key, KeyAction } from "./protocol";
import { loadCredential } from "./storage";

export function App({ bridgeUrl }: { bridgeUrl: string }) {
  const bridge = useRef<Bridge>(undefined);
  const [tvName, setTvName] = useState("TV");

  useEffect(() => {
    bridge.current = connectBridge(bridgeUrl, loadCredential() ?? "", {
      onReady: setTvName,
      onClosed: () => {},
    });
    return () => bridge.current?.close();
  }, [bridgeUrl]);

  const send = useCallback((key: Key, action: KeyAction) => {
    bridge.current?.sendKey(key, action);
  }, []);

  return <Controls tvName={tvName} send={send} />;
}
