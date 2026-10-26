import { useActions, useCompanion, useList } from "../companion";
import { tick } from "../haptics";
import { Picture } from "../pictures";
import { Icon } from "./Icon";
import { TabPage } from "./TabPage";

type UpNext = {
  upNext: string;
  title: string | null;
  episode: string | null;
  app: string;
  minutesLeft: number | null;
  progress: number | null;
  picture: string;
};

/** "faltam 18 min", or "faltam 1h05", as the TV's own Up Next Tray says it. */
function timeLeft(minutes: number): string {
  return minutes < 60 ? `faltam ${minutes} min` : `faltam ${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, "0")}`;
}

/** The Assistir tab: what to watch, each resuming or opening on the TV. */
export function WatchTab() {
  const { status } = useCompanion();
  const upNext = useList<UpNext>("up-next");
  const { run, busy, failed } = useActions();

  const resume = (entry: UpNext) => {
    tick();
    void run(entry.upNext, { type: "open", upNext: entry.upNext });
  };

  return (
    <TabPage title="Assistir" status={status}>
      {!!upNext?.length && (
        <section class="tab-section" aria-labelledby="up-next-title">
          <h2 class="section-title" id="up-next-title">
            Continuar assistindo
          </h2>
          <ul class="up-next-list">
            {upNext.map((entry) => {
              const title = entry.title ?? `Continuar no ${entry.app}`;
              return (
                <li key={entry.upNext}>
                  <button
                    type="button"
                    class={`up-next${busy.has(entry.upNext) ? " busy" : ""}${failed.has(entry.upNext) ? " failed" : ""}`}
                    aria-label={entry.title ? `Continuar ${entry.title}` : title}
                    aria-busy={busy.has(entry.upNext)}
                    onClick={() => resume(entry)}
                  >
                    <span class="up-next-still">
                      <Picture id={entry.picture} class="up-next-picture" />
                      {entry.progress != null && (
                        <span class="up-next-progress">
                          <span style={{ width: `${Math.round(entry.progress * 100)}%` }} />
                        </span>
                      )}
                    </span>
                    <span class="up-next-text">
                      <span class="up-next-title">{title}</span>
                      {entry.episode && <span class="up-next-episode">{entry.episode}</span>}
                      <span class="up-next-app">{entry.minutesLeft != null ? `${entry.app}, ${timeLeft(entry.minutesLeft)}` : entry.app}</span>
                    </span>
                    <Icon name="playArrow" size={26} />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </TabPage>
  );
}
