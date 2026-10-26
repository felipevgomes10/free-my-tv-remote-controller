import { useActions, useCompanion, useList } from "../companion";
import { tick } from "../haptics";
import { Picture } from "../pictures";
import { Icon } from "./Icon";
import { TabPage } from "./TabPage";

type App = { package: string; label: string; picture: string; inTray: boolean };
type Input = { input: string; name: string; port: string; kind: "hdmi" | "antenna" };

/** The Apps tab: the TV's Inputs and every installed app, each opening on the TV. */
export function AppsTab() {
  const { status } = useCompanion();
  const inputs = useList<Input>("inputs");
  const apps = useList<App>("apps");
  const { run, busy, failed } = useActions();

  const open = (key: string, message: Record<string, string>) => {
    tick();
    void run(key, { type: "open", ...message });
  };
  const state = (key: string) => `${busy.has(key) ? " busy" : ""}${failed.has(key) ? " failed" : ""}`;

  return (
    <TabPage title="Apps" status={status}>
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
