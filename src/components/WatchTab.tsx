import { useEffect, useState } from "preact/hooks";
import { RequestFailed } from "../bridge";
import { useActions, useCompanion, useListAnswer } from "../companion";
import { tick } from "../haptics";
import { HapticFeedback } from "./HapticFeedback";
import { Picture } from "../pictures";
import { Icon } from "./Icon";
import { ListSkeleton } from "./ListSkeleton";
import { TabPage } from "./TabPage";
import { explorarProblem, KIND_LABEL, type TitleSummary, TitleScreen } from "./TitleScreen";

type UpNext = {
  upNext: string;
  title: string | null;
  episode: string | null;
  app: string;
  minutesLeft: number | null;
  progress: number | null;
  picture: string;
};

type Trending = TitleSummary & { genre: string | null };
type SearchResult = TitleSummary & { year: number | null; poster: string | null };

/** How long typing pauses before the search goes to the TV, so it never goes for each letter. */
export const SEARCH_PAUSE_MS = 400;

/** The TV's search for what is typed, once typing pauses; an answer to an older query is never shown. */
function useSearch(query: string) {
  const { status, request } = useCompanion();
  const [answer, setAnswer] = useState<{ query: string; results?: SearchResult[]; failed?: string }>();
  const wanted = query.trim();
  useEffect(() => {
    if (wanted.length < 2 || status !== "ready") return;
    const timer = setTimeout(() => {
      request({ type: "search", query: wanted })
        .then((found) => setAnswer({ query: wanted, results: (found as unknown as { results: SearchResult[] }).results }))
        .catch((error) => setAnswer({ query: wanted, failed: error instanceof RequestFailed ? error.reason : "error" }));
    }, SEARCH_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [wanted, status, request]);
  return answer?.query === wanted ? answer : undefined;
}

/** "faltam 18 min", or "faltam 1h05", as the TV's own Up Next Tray says it. */
function timeLeft(minutes: number): string {
  return minutes < 60 ? `faltam ${minutes} min` : `faltam ${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, "0")}`;
}

/** The Assistir tab: what to watch, each resuming or opening on the TV. */
export function WatchTab() {
  const { status } = useCompanion();
  const { items: upNext, failed: upNextFailed } = useListAnswer<UpNext>("up-next");
  const trending = useListAnswer<Trending>("trending");
  const [open, setOpen] = useState<TitleSummary>();
  const [query, setQuery] = useState("");
  const searching = query.trim().length >= 2;
  const found = useSearch(query);
  const { run, busy, failed } = useActions();

  const resume = (entry: UpNext) => {
    tick();
    void run(entry.upNext, { type: "open", upNext: entry.upNext });
  };

  if (open) return <TitleScreen summary={open} onBack={() => setOpen(undefined)} />;

  return (
    <TabPage title="Assistir" status={status}>
      <label class="search-box">
        <Icon name="search" size={24} />
        <input
          type="search"
          placeholder="Buscar filmes e séries"
          aria-label="Buscar filmes e séries"
          enterKeyHint="search"
          autoComplete="off"
          value={query}
          onInput={(event) => setQuery(event.currentTarget.value)}
        />
      </label>

      {searching ? (
        <section class="tab-section" aria-label="Resultados da busca">
          {found?.results?.length ? (
            <ul class="search-results">
              {found.results.map((result) => (
                <li key={`${result.kind}:${result.tmdbId}`}>
                  <button
                    type="button"
                    class="search-result"
                    aria-label={`Ver ${result.name}`}
                    onClick={() => {
                      tick();
                      setOpen(result);
                    }}
                  >
                    <span class="search-picture">{(result.backdrop ?? result.poster) && <img src={(result.backdrop ?? result.poster)!} alt="" loading="lazy" />}</span>
                    <span class="up-next-text">
                      <span class="up-next-title">{result.name}</span>
                      <span class="up-next-app">{[KIND_LABEL[result.kind], result.year].filter((fact) => fact != null).join(", ")}</span>
                    </span>
                    <HapticFeedback />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p class="tab-notice" role="status">
              {!found ? "Buscando…" : found.failed ? explorarProblem(found.failed, "os resultados da busca") : `Nada encontrado para “${found.query}”.`}
            </p>
          )}
        </section>
      ) : (
        <>
          {(upNext === undefined || upNext.length > 0) && (
            <section class="tab-section" aria-labelledby="up-next-title" aria-busy={upNext === undefined && !upNextFailed}>
              <h2 class="section-title" id="up-next-title">
                Continuar assistindo
              </h2>
              {upNext ? (
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
                          <HapticFeedback />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : upNextFailed ? (
                <p class="tab-notice" role="status">Não deu para carregar o que você estava assistindo. Tente abrir esta aba de novo.</p>
              ) : (
                <ListSkeleton of="up-next" label="Carregando o que você estava assistindo…" />
              )}
            </section>
          )}

          <section class="tab-section" aria-labelledby="trending-title" aria-busy={trending.items === undefined && !trending.failed}>
            <header class="section-header">
              <h2 class="section-title" id="trending-title">
                Em alta hoje
              </h2>
              <span class="section-note">Do Explorar</span>
            </header>
            {trending.items?.length ? (
              <ul class="trending-row">
                {trending.items.map((title) => (
                  <li key={`${title.kind}:${title.tmdbId}`}>
                    <button
                      type="button"
                      class="trending"
                      aria-label={`Ver ${title.name}`}
                      onClick={() => {
                        tick();
                        setOpen(title);
                      }}
                    >
                      <span class="trending-backdrop">{title.backdrop && <img src={title.backdrop} alt="" loading="lazy" />}</span>
                      <span class="trending-name">{title.name}</span>
                      <span class="trending-meta">{[KIND_LABEL[title.kind], title.genre?.toLowerCase()].filter(Boolean).join(", ")}</span>
                      <HapticFeedback />
                    </button>
                  </li>
                ))}
              </ul>
            ) : trending.items || trending.failed ? (
              <p class="tab-notice" role="status">{trending.failed ? explorarProblem(trending.failed, "os destaques de hoje") : "Nada em alta agora."}</p>
            ) : (
              <ListSkeleton of="trending" label="Carregando os destaques…" />
            )}
          </section>
        </>
      )}
    </TabPage>
  );
}
