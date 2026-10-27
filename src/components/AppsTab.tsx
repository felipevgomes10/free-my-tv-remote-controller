import { useEffect, useState } from "preact/hooks";
import { useActions, useCompanion, useList } from "../companion";
import { tick } from "../haptics";
import { HapticFeedback } from "./HapticFeedback";
import { Picture } from "../pictures";
import { Icon } from "./Icon";
import { TabPage } from "./TabPage";

type App = { package: string; label: string; picture: string; inTray: boolean };
type OpenApp = { package: string; label: string; picture: string; playing: boolean };
type Input = { input: string; name: string; port: string; kind: "hdmi" | "antenna" };

/** The Apps tab: the TV's Open Apps, its Inputs and every installed app, each opening on the TV. */
export function AppsTab() {
  const { status } = useCompanion();
  const openApps = useList<OpenApp>("open-apps");
  const inputs = useList<Input>("inputs");
  const apps = useList<App>("apps");
  const { run, busy, failed } = useActions();

  const open = (key: string, message: Record<string, string>) => {
    tick();
    void run(key, { type: "open", ...message });
  };
  const state = (key: string) => `${busy.has(key) ? " busy" : ""}${failed.has(key) ? " failed" : ""}`;

  // Closed apps leave at once, once the TV confirms; the Home's next list has them gone too.
  const [closed, setClosed] = useState<Set<string>>(new Set());
  useEffect(() => setClosed(new Set()), [openApps]);
  const close = async (app: OpenApp) => {
    tick();
    if (await run(`close:${app.package}`, { type: "close-app", package: app.package })) setClosed((current) => new Set(current).add(app.package));
  };
  const stillOpen = openApps?.filter((app) => !closed.has(app.package));

  return (
    <TabPage title="Apps" status={status}>
      {!!stillOpen?.length && (
        <section class="tab-section" aria-labelledby="open-apps-title">
          <header class="section-header">
            <h2 class="section-title" id="open-apps-title">
              Abertos
            </h2>
            <span class="section-note">Mais recente primeiro</span>
          </header>
          <ul class="open-app-row">
            {stillOpen.map((app) => (
              <li key={app.package} class="open-app">
                <button
                  type="button"
                  class={`app-tile${state(`app:${app.package}`)}`}
                  aria-label={`Voltar para ${app.label}`}
                  aria-busy={busy.has(`app:${app.package}`)}
                  onClick={() => open(`app:${app.package}`, { package: app.package })}
                >
                  <Picture id={app.picture} class="app-banner" />
                  <span class="app-label">
                    {app.label}
                    {app.playing && (
                      <span class="playing">
                        <Icon name="graphicEq" size={16} />
                        Tocando
                      </span>
                    )}
                  </span>
                  <HapticFeedback />
                </button>
                {!app.playing && (
                  <button
                    type="button"
                    class={`close-app${state(`close:${app.package}`)}`}
                    aria-label={`Fechar ${app.label}`}
                    aria-busy={busy.has(`close:${app.package}`)}
                    onClick={() => close(app)}
                  >
                    <Icon name="close" size={20} />
                    <HapticFeedback />
                  </button>
                )}
              </li>
            ))}
          </ul>
          <p class="section-help">Fechar encerra o app na TV. Apps tocando música não podem ser fechados.</p>
        </section>
      )}

      {!!inputs?.length && (
        <section class="tab-section" aria-labelledby="inputs-title">
          <h2 class="section-title" id="inputs-title">
            Entradas
          </h2>
          <div class="input-row">
            {inputs.map((input) => (
              <button
                type="button"
                key={input.input}
                class={`input-card${state(`input:${input.input}`)}`}
                aria-label={`Mudar para ${input.name}`}
                aria-busy={busy.has(`input:${input.input}`)}
                onClick={() => open(`input:${input.input}`, { input: input.input })}
              >
                <Icon name={input.kind === "antenna" ? "settingsInputAntenna" : "settingsInputHdmi"} size={24} />
                <span class="input-name">{input.name}</span>
                {input.port !== input.name && <span class="input-port">{input.port}</span>}
                <HapticFeedback />
              </button>
            ))}
          </div>
        </section>
      )}

      <section class="tab-section" aria-labelledby="apps-title">
        <h2 class="section-title" id="apps-title">
          Todos os apps
        </h2>
        {apps ? (
          <div class="app-grid">
            {apps.map((app) => (
              <button
                type="button"
                key={app.package}
                class={`app-tile${state(`app:${app.package}`)}`}
                aria-label={`Abrir ${app.label}`}
                aria-busy={busy.has(`app:${app.package}`)}
                onClick={() => open(`app:${app.package}`, { package: app.package })}
              >
                <Picture id={app.picture} class="app-banner" />
                <span class="app-label">{app.label}</span>
                <HapticFeedback />
              </button>
            ))}
          </div>
        ) : (
          <p class="tab-notice">Carregando os apps da TV…</p>
        )}
      </section>
    </TabPage>
  );
}
