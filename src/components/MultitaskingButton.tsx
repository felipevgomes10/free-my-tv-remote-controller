import { useLayoutEffect, useRef, useState } from "preact/hooks";
import { RequestFailed } from "../bridge";
import { useCompanion } from "../companion";
import { tick } from "../haptics";
import { HapticFeedback } from "./HapticFeedback";
import { Icon } from "./Icon";

const errors: Record<string, string> = {
  "overlay-unavailable": "Não foi possível abrir o multitarefas. Confira a preparação do Home na TV.",
  busy: "A TV está concluindo outra ação. Tente novamente.",
  "unknown-request": "Atualize o Home para usar o botão Multitarefas.",
};
const unconfirmed = "Não foi possível confirmar a abertura do multitarefas. Tente novamente.";

/** A show-only action: the TV owns the window, its focus and its dismissal. */
export function MultitaskingButton() {
  const { status, request } = useCompanion();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const inFlight = useRef(false);
  const generation = useRef(0);

  useLayoutEffect(() => {
    generation.current++;
    inFlight.current = false;
    setPending(false);
    setError(undefined);
    return () => { generation.current++; };
  }, [status, request]);

  const open = async () => {
    if (status !== "ready" || inFlight.current) return;
    inFlight.current = true;
    const current = generation.current;
    setPending(true);
    setError(undefined);
    tick();
    try {
      const answer = await request({ type: "open-app-switcher" });
      if (answer.type !== "done") throw new RequestFailed("error");
    } catch (failure) {
      if (current === generation.current) setError(failure instanceof RequestFailed ? errors[failure.reason] ?? unconfirmed : unconfirmed);
    } finally {
      if (current === generation.current) {
        inFlight.current = false;
        setPending(false);
      }
    }
  };

  return (
    <div class="multitasking-action">
      <button type="button" class="multitasking-button" aria-label="Multitarefas" aria-busy={pending}
        disabled={status !== "ready" || pending} onClick={open}>
        <Icon name="multitasking" size={22} />
        <span>{pending ? "Abrindo…" : "Multitarefas"}</span>
        <HapticFeedback />
      </button>
      {error && <p class="multitasking-error" role="alert">{error}</p>}
    </div>
  );
}
