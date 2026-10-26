# 15: Search

**What to build:** The search box at the top of Assistir: typing shows results as one types (debounced), each with its backdrop or poster, name, year and kind; a result opens the Title screen. Empty and no-result states. Examples for `search` and `search-results`.

The spec is `.scratch/companion/spec.md` in free-my-tv-remote-controller. Tickets are numbered across both repositories: 01, 02, 04, 06, 08, 10, 12, 14, 16, 18 and 19 live in free-my-tv; 03, 05, 07, 09, 11, 13, 15 and 17 in free-my-tv-remote-controller.

**Blocked by:** 13 (Em alta hoje and the Title screen)

**Status:** resolved

- [x] Typing sends `search` after a short pause, never for each letter
- [x] Results show name, year and kind, and open the Title screen
- [x] No results and an empty box each have their state
- [x] The examples exist and the page's tests read them

## Comments

**2026-10-26, done.** The search box opens Assistir. From two letters on, the lists give way to the results; `useSearch` sends `search` once typing pauses for 400 ms and shows an answer only while it matches what is typed, so a late answer to an older query never shows. Each result has its backdrop (or poster), name, and kind with year, and opens the Title screen; Voltar comes back to the results with the query kept. "Buscando…", "Nada encontrado para “…”." and the token or offline messages cover the rest; emptying the box brings the lists back. Examples `search` and `search-results`, and their rows in the protocol README. The dev bridge searches its trending Titles. 4 new tests, 84 in all.
