# 15: Search

**What to build:** The search box at the top of Assistir: typing shows results as one types (debounced), each with its backdrop or poster, name, year and kind; a result opens the Title screen. Empty and no-result states. Examples for `search` and `search-results`.

The spec is `.scratch/companion/spec.md` in free-my-tv-remote-controller. Tickets are numbered across both repositories: 01, 02, 04, 06, 08, 10, 12, 14, 16, 18 and 19 live in free-my-tv; 03, 05, 07, 09, 11, 13, 15 and 17 in free-my-tv-remote-controller.

**Blocked by:** 13 (Em alta hoje and the Title screen)

**Status:** ready-for-agent

- [ ] Typing sends `search` after a short pause, never for each letter
- [ ] Results show name, year and kind, and open the Title screen
- [ ] No results and an empty box each have their state
- [ ] The examples exist and the page's tests read them
