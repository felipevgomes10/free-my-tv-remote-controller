import type { IconName } from "../icons";
import { Icon } from "./Icon";

const steps: [string, IconName][] = [
  ["Toque em Compartilhar, na barra do Safari.", "iosShare"],
  ["Escolha Adicionar à Tela de Início.", "addBox"],
  ["Abra o FMTV Controller pelo novo ícone.", "touchApp"],
];

export function AddToHomeScreen({ onPairHere }: { onPairHere: () => void }) {
  return (
    <main class="screen message-screen">
      <img class="app-icon" src="/icons/apple-touch-icon.png" alt="" width="72" height="72" />
      <div class="message-text">
        <h1 class="title">Primeiro, adicione o FMTV Controller à Tela de Início</h1>
        <p class="explanation">
          Assim ele abre em tela cheia, como um app, e o pareamento fica guardado no ícone que você vai usar.
        </p>
      </div>
      <ol class="steps">
        {steps.map(([text, icon], i) => (
          <li class="step" key={icon}>
            <span class="step-number">{i + 1}</span>
            <span class="step-text">{text}</span>
            <span class="step-icon">
              <Icon name={icon} size={24} />
            </span>
          </li>
        ))}
      </ol>
      <div class="spacer" />
      <button type="button" class="text-button" onClick={onPairHere}>
        Parear no Safari mesmo assim
      </button>
    </main>
  );
}
