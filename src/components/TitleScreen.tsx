import { useEffect, useState } from "preact/hooks";
import { RequestFailed } from "../bridge";
import { useActions, useCompanion } from "../companion";
import { tick } from "../haptics";
import { HapticFeedback } from "./HapticFeedback";
import { Picture } from "../pictures";
import { Icon } from "./Icon";

export type TitleKind = "movie" | "series";

/** What Em alta hoje and the search know of a Title, enough to open its screen at once. */
export type TitleSummary = { kind: TitleKind; tmdbId: number; name: string; backdrop: string | null };

type Service = { service: string | null; name: string; offer: "subscription" | "rent-or-buy"; picture: string | null };
type Title = TitleSummary & {
  ageRating: string | null;
  year: number | null;
  genres: string[];
  runtimeMinutes: number | null;
  seasons: number | null;
  rating: number | null;
  overview: string | null;
  trailer: boolean;
  services: Service[];
};

export const KIND_LABEL: Record<TitleKind, string> = { movie: "Filme", series: "Série" };

/** Brazil's age ratings in ClassInd's colours, as the Home draws them. */
const AGE_RATING_COLOURS: Record<string, [string, string]> = {
  L: ["#0c9447", "#fff"],
  "10": ["#0f7dc2", "#fff"],
  "12": ["#f8c411", "#000"],
  "14": ["#e67824", "#000"],
  "16": ["#db2827", "#fff"],
  "18": ["#1d1815", "#fff"],
};

const OFFER_LABEL = { subscription: "Incluído na assinatura", "rent-or-buy": "Alugar ou comprar" };

/** "2 h 08 min", or "45 min". */
function duration(minutes: number): string {
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")} min`;
}

/** Why a Title's details, or Em alta hoje, couldn't come from the TV. */
export function explorarProblem(reason: string, what: string): string {
  if (reason === "missing-token") return "O Explorar da TV precisa da chave do TMDB. Quem configurou a TV a coloca pelo Setup do Free My TV.";
  if (reason === "offline") return `A TV está sem internet: não deu para trazer ${what}.`;
  return `Não deu para trazer ${what} agora.`;
}

/** A Title's screen: its facts, Ver trailer na TV and Onde assistir, each acting on the TV. */
export function TitleScreen({ summary, onBack }: { summary: TitleSummary; onBack: () => void }) {
  const { status, request } = useCompanion();
  const [title, setTitle] = useState<Title>();
  const [problem, setProblem] = useState<string>();
  const { run, busy, failed } = useActions();

  useEffect(() => {
    if (status !== "ready" || title) return;
    setProblem(undefined);
    request({ type: "title", kind: summary.kind, tmdbId: summary.tmdbId })
      .then((answer) => setTitle(answer as unknown as Title))
      .catch((error) => setProblem(error instanceof RequestFailed ? error.reason : "error"));
  }, [status, summary.kind, summary.tmdbId, request, title]);

  const open = (key: string, message: Record<string, unknown>) => {
    tick();
    void run(key, { type: "open", kind: summary.kind, tmdbId: summary.tmdbId, ...message });
  };
  const state = (key: string) => `${busy.has(key) ? " busy" : ""}${failed.has(key) ? " failed" : ""}`;

  const backdrop = title?.backdrop ?? summary.backdrop;
  const colours = title?.ageRating ? AGE_RATING_COLOURS[title.ageRating] : undefined;
  const facts = title ? [KIND_LABEL[title.kind], title.year, title.genres[0]].filter((fact) => fact != null).join(", ") : undefined;
  const length = title?.runtimeMinutes ? duration(title.runtimeMinutes) : title?.seasons ? `${title.seasons} ${title.seasons === 1 ? "temporada" : "temporadas"}` : undefined;

  return (
    <article class="title-screen" aria-labelledby="title-name">
      <div class="title-backdrop">{backdrop && <img src={backdrop} alt="" />}</div>
      <button type="button" class="title-back" aria-label="Voltar" onClick={onBack}>
        <Icon name="arrowBack" size={24} />
        <HapticFeedback />
      </button>

      <div class="title-body">
        <h1 class="title-name" id="title-name">
          {summary.name}
        </h1>

        {title ? (
          <>
            <p class="title-facts">
              {title.ageRating && (
                <span class="age-rating" style={colours && { background: colours[0], color: colours[1] }} aria-label={`Classificação ${title.ageRating}`}>
                  {title.ageRating}
                </span>
              )}
              <span>{facts}</span>
              {length && <span>{length}</span>}
              {title.rating != null && (
                <span class="title-rating" aria-label={`Nota ${title.rating.toFixed(1).replace(".", ",")} de 10`}>
                  ☆ {title.rating.toFixed(1).replace(".", ",")}
                </span>
              )}
            </p>
            {title.overview && <p class="title-overview">{title.overview}</p>}

            {title.trailer && (
              <button type="button" class={`trailer-button${state("trailer")}`} aria-busy={busy.has("trailer")} onClick={() => open("trailer", { trailer: true })}>
                <Icon name="playArrow" size={24} />
                Ver trailer na TV
                <HapticFeedback />
              </button>
            )}

            {title.services.length > 0 && (
              <section class="tab-section" aria-labelledby="where-to-watch">
                <h2 class="section-title" id="where-to-watch">
                  Onde assistir
                </h2>
                <ul class="services">
                  {title.services.map((service) => (
                    <li key={service.name} class="service">
                      {service.picture ? (
                        <Picture id={service.picture} class="service-logo" />
                      ) : (
                        <span class="service-logo plain" aria-hidden="true">
                          {service.name}
                        </span>
                      )}
                      <span class="service-text">
                        <span class="service-name">{service.name}</span>
                        <span class="service-offer">{OFFER_LABEL[service.offer]}</span>
                      </span>
                      {service.service && (
                        <button
                          type="button"
                          class={`open-on-tv${state(`service:${service.service}`)}`}
                          aria-label={`Abrir na TV em ${service.name}`}
                          aria-busy={busy.has(`service:${service.service}`)}
                          onClick={() => open(`service:${service.service}`, { service: service.service })}
                        >
                          Abrir na TV
                          <HapticFeedback />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                <p class="section-help">Abre a obra no app do streaming, na TV. Pode exigir assinatura ou pagamento.</p>
              </section>
            )}
          </>
        ) : (
          <p class="tab-notice" role="status">
            {problem ? explorarProblem(problem, "os detalhes desta obra") : status === "ready" ? "Carregando os detalhes…" : "Sem conexão com a TV."}
          </p>
        )}
      </div>
    </article>
  );
}
