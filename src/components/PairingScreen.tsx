import { useState } from "preact/hooks";
import { type PairingRefusal, requestPairing } from "../pairing";
import { Icon } from "./Icon";

const CODE_LENGTH = 4;

const refusals: Record<PairingRefusal, string> = {
  "wrong-code": "Código errado. Confira o código na TV e tente de novo.",
  "pairing-closed": "A tela de pareamento foi fechada na TV. Abra Parear aparelho de novo e use o código novo.",
  "too-many-tries": "Tentativas demais. A TV mostrou um código novo: digite esse.",
  unreachable: "Sem conexão com a TV. Confira se o iPhone está no mesmo Wi-Fi da TV.",
};

export function PairingScreen({ onPaired }: { onPaired: (credential: string) => void }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [refusal, setRefusal] = useState<PairingRefusal>();
  const [sending, setSending] = useState(false);

  const ready = code.length === CODE_LENGTH && name.trim() !== "" && !sending;

  const submit = async (event: Event) => {
    event.preventDefault();
    if (!ready) return;
    setSending(true);
    const result = await requestPairing(code, name.trim());
    setSending(false);
    if ("credential" in result) onPaired(result.credential);
    else setRefusal(result.refusal);
  };

  return (
    <form class="screen message-screen pairing" onSubmit={submit}>
      <div class="message-text">
        <h1 class="title">Parear este iPhone</h1>
        <p class="explanation">
          Na TV, abra Configurações → FMTV Controller → Parear aparelho e digite aqui o código que aparece.
        </p>
      </div>

      <div class="field">
        <label class="field-label" for="pairing-code">
          Código da TV
        </label>
        <div class={`code-boxes${refusal && refusal !== "unreachable" ? " refused" : ""}`}>
          <input
            id="pairing-code"
            class="code-input"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={CODE_LENGTH}
            value={code}
            autoFocus
            onInput={(event) => {
              setCode(event.currentTarget.value.replace(/\D/g, "").slice(0, CODE_LENGTH));
              setRefusal(undefined);
            }}
          />
          {Array.from({ length: CODE_LENGTH }, (_, i) => (
            <span class={`code-box${i === code.length ? " current" : ""}`} aria-hidden="true" key={i}>
              {code[i] ?? ""}
            </span>
          ))}
        </div>
        {refusal && (
          <p class="refusal" role="alert">
            <Icon name="error" size={20} />
            <span>{refusals[refusal]}</span>
          </p>
        )}
      </div>

      <div class="field">
        <label class="field-label" for="phone-name">
          Nome deste iPhone
        </label>
        <input
          id="phone-name"
          class="text-input"
          placeholder="iPhone da Ana"
          autoComplete="off"
          maxLength={40}
          value={name}
          onInput={(event) => setName(event.currentTarget.value)}
        />
        <p class="field-help">É por este nome que o iPhone aparece na lista de aparelhos pareados da TV.</p>
      </div>

      <div class="spacer" />
      <button type="submit" class="primary-button" disabled={!ready}>
        Parear
      </button>
    </form>
  );
}
