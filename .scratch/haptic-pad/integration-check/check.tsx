import { render } from "preact";
import { useCallback, useState } from "preact/hooks";
import { Touchpad } from "../../../src/components/Touchpad";
import type { Key, KeyAction } from "../../../src/protocol";
import "../../../src/styles.css";
import "./check.css";

function Check() {
  const [events, setEvents] = useState<string[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [report, setReport] = useState("");
  const send = useCallback((key: Key, action: KeyAction) => {
    setEvents((current) => [...current, `${key} · ${action}`].slice(-20));
  }, []);
  const checks = ["Vibração no deslize", "Toque envia um OK", "Segurar e soltar OK"];
  const generate = () => setReport([
    "FMTV · Pad integrado v1 (componente real, sem conexão com a TV)",
    ...checks.map((check) => `${check}: ${answers[check] ?? "Não avaliado"}`),
    `Comandos recentes: ${events.join(", ") || "nenhum"}`,
    "Vibração confirmada pela pessoa, não medida pelo navegador.",
  ].join("\n"));

  return (
    <main class="check-shell">
      <header>
        <p class="check-tag">TESTE LOCAL · NÃO CONTROLA A TV</p>
        <h1>Pad integrado</h1>
        <p>Deslize para mover. Toque para OK. Segure parado para manter OK pressionado.</p>
      </header>
      <Touchpad send={send} enabled={enabled} />
      <p class="check-command" role="status">{events.at(-1) ?? "Aguardando um gesto"}</p>
      <details>
        <summary>Conferir e registrar resultado</summary>
        <p>Um toque deve gerar um único <b>ok · press</b>. Segurar gera <b>hold-start</b>; soltar gera <b>hold-end</b>. Os deslizes enviam direções.</p>
        {checks.map((check) => (
          <label class="check-field" key={check}>{check}
            <select value={answers[check] ?? "Não avaliado"} onChange={(event) => setAnswers({ ...answers, [check]: event.currentTarget.value })}>
              <option>Não avaliado</option><option>Funcionou</option><option>Com problema</option>
            </select>
          </label>
        ))}
        <button type="button" onClick={() => setEnabled(!enabled)}>{enabled ? "Simular desconexão" : "Reconectar"}</button>
        <button type="button" onClick={generate}>Gerar relato</button>
        {report && <textarea aria-label="Relato do pad integrado" readOnly value={report} onFocus={(event) => event.currentTarget.select()} />}
        <pre>{events.join("\n") || "Nenhum comando."}</pre>
      </details>
    </main>
  );
}

render(<Check />, document.getElementById("check")!);
