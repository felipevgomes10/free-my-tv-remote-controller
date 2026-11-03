import { useEffect, useState } from "preact/hooks";
import { useActions, useCompanion, useListAnswer } from "../companion";
import { shortcutKey, useShortcuts, type Shortcut } from "../shortcuts";
import { ShortcutSheet } from "./ShortcutSheet";
import { ShortcutTargetButton } from "./ShortcutTargetButton";
import { tick } from "../haptics";
import { HapticFeedback } from "./HapticFeedback";
import { Picture } from "../pictures";
import { Icon } from "./Icon";
import { ListSkeleton } from "./ListSkeleton";
import { TabPage } from "./TabPage";

type App = { package: string; label: string; picture: string; inTray: boolean };
type OpenApp = { package: string; label: string; picture: string; playing: boolean };
type Input = { input: string; name: string; port: string; kind: "hdmi" | "antenna" };

/** The Apps tab: the TV's Open Apps, its Inputs and every installed app, each opening on the TV. */
export function AppsTab() {
  const { status } = useCompanion();
  const { items: shortcuts, add, saved } = useShortcuts();
  const [selected, setSelected] = useState<Shortcut>();
  const [notice, setNotice] = useState("");
  const alreadyAdded = selected && shortcuts.some((item) => shortcutKey(item) === shortcutKey(selected));
  const { items: openApps, failed: openAppsFailed } = useListAnswer<OpenApp>("open-apps");
  const { items: inputs, failed: inputsFailed } = useListAnswer<Input>("inputs");
  const { items: apps, failed: appsFailed } = useListAnswer<App>("apps");
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
      <p class="section-help">Segure um app ou entrada para adicionar aos atalhos do controle.</p>
      {notice && <p class="shortcut-notice" role="status">{notice}</p>}
      {!saved && <p class="shortcut-warning" role="status">Não deu para salvar os atalhos neste aparelho. Eles só serão mantidos enquanto o controle estiver aberto.</p>}
      {selected && <ShortcutSheet title={selected.label} onClose={() => setSelected(undefined)}>
        <p class="section-help">{alreadyAdded ? "Este item já está nos atalhos do controle." : "Adicione aos atalhos para abrir direto pela aba Controle."}</p>
        <button type="button" class="pill-button" disabled={!!alreadyAdded} onClick={() => {
          add(selected);
          setNotice(`${selected.label} adicionado aos atalhos.`);
          setSelected(undefined);
        }}><Icon name="add" size={20} />{alreadyAdded ? "Já está nos atalhos" : "Adicionar aos atalhos"}</button>
      </ShortcutSheet>}
      {(stillOpen === undefined || stillOpen.length > 0) && (
        <section class="tab-section" aria-labelledby="open-apps-title" aria-busy={openApps === undefined && !openAppsFailed}>
          <header class="section-header">
            <h2 class="section-title" id="open-apps-title">
              Abertos
            </h2>
            <span class="section-note">Mais recente primeiro</span>
          </header>
          {stillOpen ? (
            <>
              <ul class="open-app-row">
                {stillOpen.map((app) => (
                  <li key={app.package} class="open-app">
                    <ShortcutTargetButton
                      item={{ kind: "app", target: app.package, label: app.label }} onShortcut={setSelected}
                      class={`app-tile${state(`app:${app.package}`)}`}
                      aria-label={`Voltar para ${app.label}`}
                      aria-busy={busy.has(`app:${app.package}`)}
                      onOpen={() => open(`app:${app.package}`, { package: app.package })}
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
                    </ShortcutTargetButton>
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
            </>
          ) : openAppsFailed ? (
            <p class="tab-notice" role="status">Não deu para carregar os apps abertos. Tente abrir esta aba de novo.</p>
          ) : (
            <ListSkeleton of="open-apps" label="Carregando os apps abertos…" />
          )}
        </section>
      )}

      {(inputs === undefined || inputs.length > 0) && (
        <section class="tab-section" aria-labelledby="inputs-title" aria-busy={inputs === undefined && !inputsFailed}>
          <h2 class="section-title" id="inputs-title">
            Entradas
          </h2>
          {inputs ? (
            <div class="input-row">
              {inputs.map((input) => (
                <ShortcutTargetButton
                  item={{ kind: "input", target: input.input, label: input.name }} onShortcut={setSelected}
                  key={input.input}
                  class={`input-card${state(`input:${input.input}`)}`}
                  aria-label={`Mudar para ${input.name}`}
                  aria-busy={busy.has(`input:${input.input}`)}
                  onOpen={() => open(`input:${input.input}`, { input: input.input })}
                >
                  <Icon name={input.kind === "antenna" ? "settingsInputAntenna" : "settingsInputHdmi"} size={24} />
                  <span class="input-name">{input.name}</span>
                  {input.port !== input.name && <span class="input-port">{input.port}</span>}
                  <HapticFeedback />
                </ShortcutTargetButton>
              ))}
            </div>
          ) : inputsFailed ? (
            <p class="tab-notice" role="status">Não deu para carregar as entradas da TV. Tente abrir esta aba de novo.</p>
          ) : (
            <ListSkeleton of="inputs" label="Carregando as entradas da TV…" />
          )}
        </section>
      )}

      <section class="tab-section" aria-labelledby="apps-title" aria-busy={apps === undefined && !appsFailed}>
        <h2 class="section-title" id="apps-title">
          Todos os apps
        </h2>
        {apps ? (
          <div class="app-grid">
            {apps.map((app) => (
              <ShortcutTargetButton
                item={{ kind: "app", target: app.package, label: app.label }} onShortcut={setSelected}
                key={app.package}
                class={`app-tile${state(`app:${app.package}`)}`}
                aria-label={`Abrir ${app.label}`}
                aria-busy={busy.has(`app:${app.package}`)}
                onOpen={() => open(`app:${app.package}`, { package: app.package })}
              >
                <Picture id={app.picture} class="app-banner" />
                <span class="app-label">{app.label}</span>
                <HapticFeedback />
              </ShortcutTargetButton>
            ))}
          </div>
        ) : appsFailed ? (
          <p class="tab-notice" role="status">Não deu para carregar os apps da TV. Tente abrir esta aba de novo.</p>
        ) : (
          <ListSkeleton of="apps" label="Carregando os apps da TV…" />
        )}
      </section>
    </TabPage>
  );
}
