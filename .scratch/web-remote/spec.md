# Web Remote: first release

**Status:** ready-for-agent

## Problem Statement

The TV is only controllable from its Remote. When the Remote is under a cushion, in another room or out of batteries, nobody can pause, change the volume or go back. Everyone in the home already carries an iPhone on the sofa, but the TV gives them nothing to use it for: Google's own phone remote expects Google's launcher and Google's app, and the Home has no way to be reached from a phone except APK Drop, which only installs apps.

## Solution

The **Web Remote** (FMTV Controller): a page that any **Household Member** opens in Safari on their iPhone and keeps on the Home Screen, which controls the **TV** like the Remote does.

**Getting it.** In the Home's Settings, a new section **FMTV Controller**:
- **Linking**: the first time, the Home links itself to the **TV Remote Service**. Android shows a code on the TV, and the Owner types it with the Remote. Settings says whether the Home is linked, and lets the Owner link it again.
- **Parear aparelho**: a screen with the TV's address as a QR code and a **Pairing Code**. The Household Member scans the QR code, adds the page to the Home Screen, types the Pairing Code and gives the phone a name ("iPhone da Ana"). From then on, the Web Remote opens straight to the controls.
- **Aparelhos pareados**: every **Paired Phone** by its name, each of which the Owner can revoke.

**Using it.** The Web Remote is one screen, in pt-BR:
- A **Touchpad**: swiping moves the TV's focus, tapping presses OK, and touching and holding is holding OK, which opens Edit Mode on the Home.
- **Voltar** and **Home**. Pressing Home twice opens the App Switcher, and holding it opens the Notification Panel, as with the Remote.
- **Play/pausa**, **volume +/−**, **mudo** and **desligar**.
- A haptic tick on each press where iOS allows it.

**When the TV is out of reach**, because it's off, the phone is on another network or the Home is restarting, the Web Remote says "Sem conexão com a TV". It offers to try turning the TV on and reconnects by itself when the TV comes back.

Keys travel from the page to a bridge inside the Home over the home network, then to the TV Remote Service on the TV itself, which delivers them to whatever app is on screen (ADR 0001). The page is built and released from this repository and ships inside the Home at a version the Home pins (ADR 0002). Everything travels over plain HTTP on the home network (ADR 0003).

## User Stories

### Linking the Home

1. As the Owner, I want the Home to link itself to the TV Remote Service once, so that the Web Remote can send keys to any app.
2. As the Owner, I want to type the code Android shows using the Remote, inside the Home's Settings, so that Linking needs no computer.
3. As the Owner, I want Settings to say whether the Home is linked, so that I know why the Web Remote might not be working.
4. As the Owner, I want to link the Home again from Settings, so that I can recover if Linking is lost, after a Restore or a system update for example.
5. As the Owner, I want a wrong or expired Linking code to be told apart from success, with a way to try again, so that I'm never left guessing.
6. As the Owner, I want Setup never to disable the TV Remote Service, whatever the approved extras list says, so that Setup can't silently break the Web Remote.
7. As the Owner, I want the Home's Setup status to report when the TV Remote Service is missing or disabled, so that I learn it from the Home rather than from a dead Web Remote.

### Pairing a phone

8. As the Owner, I want a "Parear aparelho" screen in Settings → FMTV Controller, so that pairing a phone is one place to go.
9. As a Household Member, I want a QR code on that screen that opens the Web Remote in Safari, so that I never type an address.
10. As a Household Member, I want the Web Remote to suggest "Adicionar à Tela de Início" before pairing, so that I pair the icon I will actually use.
11. As a Household Member, I want to type the Pairing Code shown on the TV, so that only someone in front of the TV can pair.
12. As the Owner, I want the Pairing Code to exist only while "Parear aparelho" is open, so that nobody pairs while I'm not looking.
13. As the Owner, I want the Pairing Code to change after a few wrong tries, so that it can't be guessed.
14. As a Household Member, I want to name my phone while pairing ("iPhone da Ana"), so that the Owner can tell two iPhones apart.
15. As a Household Member, I want the TV to confirm the new Paired Phone by its name, so that I know pairing worked.
16. As a Household Member, I want the Web Remote to open straight to the controls after pairing, every time, so that I never pair twice.
17. As a Household Member, I want a clear message when the Pairing Code is wrong or the TV closed "Parear aparelho", so that I know what to do.

### Paired Phones

18. As the Owner, I want to see every Paired Phone by name in Settings → FMTV Controller, so that I know who can control the TV.
19. As the Owner, I want to revoke a Paired Phone, so that a phone that left the home stops working.
20. As a Household Member whose phone was revoked, I want the Web Remote to say it is no longer paired and offer to pair again, so that I'm not left with a silent screen.
21. As the Owner, I want every Paired Phone to control the TV equally, mine included, so that there are no permissions to manage.
22. As a Household Member, I want my phone and another Paired Phone to work at the same time, so that nobody has to wait for anyone.

### Touchpad

23. As a Household Member, I want to swipe on the Touchpad to move the TV's focus, so that I navigate as on an Apple TV Remote.
24. As a Household Member, I want a longer swipe to move the focus several steps, so that long rows don't take a swipe per item.
25. As a Household Member, I want a tap on the Touchpad to press OK, so that I open what is focused.
26. As a Household Member, I want touching and holding on the Touchpad to be holding OK, so that I can enter Edit Mode on the Home or use any app's long press.
27. As a Household Member, I want a tap not to be mistaken for a short swipe, so that I don't move the focus when I meant OK.
28. As a Household Member, I want a haptic tick for each step the focus moves and each press, where iOS allows it, so that the Touchpad feels firm.
29. As a Household Member, I want the Web Remote to keep working when there's no haptic, so that an iOS update can't break it.

### Buttons

30. As a Household Member, I want a Voltar button, so that I can go back as with the Remote.
31. As a Household Member, I want a Home button, so that I can return to the Home from any app.
32. As a Household Member, I want pressing Home twice to open the App Switcher, so that it works as on the Remote.
33. As a Household Member, I want holding Home to open the Notification Panel, so that it works as on the Remote.
34. As a Household Member, I want a play/pause button, so that I can pause without finding the Remote.
35. As a Household Member, I want volume up and down buttons, held to keep changing, so that I can turn it up or down quickly, since iOS doesn't let the page use the phone's own volume buttons.
36. As a Household Member, I want a mute button, so that I can silence the TV at once.
37. As a Household Member, I want a power button that turns the TV off, so that I can turn it off from the sofa.

### Reaching the TV

38. As a Household Member, I want the Web Remote to say "Sem conexão com a TV" when it can't reach the TV, so that I know why nothing happens.
39. As a Household Member, I want buttons disabled while there's no connection, so that I don't press keys that go nowhere.
40. As a Household Member, I want the Web Remote to reconnect by itself when the TV is back, so that I don't have to reload it.
41. As a Household Member, I want to try turning the TV on from the "Sem conexão" screen, so that I can use the Web Remote even with the TV off, when the TV allows it.
42. As a Household Member, I want to be told when turning the TV on didn't work, so that I know to use the Remote.
43. As a Household Member, I want the Web Remote to tell "the Home isn't linked to the TV" apart from "no connection", so that I know whether it is the Owner who has to fix something.
44. As a Household Member, I want the Web Remote on my Home Screen to keep working after the Home updates, reloading itself if it is out of date, so that I never use a stale page.
45. As a Household Member, I want keys to arrive as fast as with the Remote, so that the Web Remote doesn't feel laggy.
46. As a Household Member, I want a key I pressed while the connection was dropping either to arrive once or not at all, never late or twice, so that I don't skip two episodes.

### Look and language

47. As a Household Member, I want the Web Remote in pt-BR, like the Home, so that both speak the same language.
48. As a Household Member, I want the Web Remote full screen from the Home Screen, without Safari's bars, so that it feels like an app.
49. As a Household Member, I want the Web Remote to fit every iPhone's screen in portrait, with nothing under the notch or the home indicator, so that every control is reachable with one thumb.
50. As a Household Member, I want the Web Remote's look to match the Home's dark, Apple TV–style design, so that both feel like one product.
51. As a Household Member, I want the screen not to scroll, zoom or select text while I'm using the Touchpad, so that gestures only ever control the TV.

### On the Home Screen

52. As a Household Member, I want the Web Remote on my Home Screen as "FMTV Controller" with its own icon, so that I find it like any other app.
53. As a Household Member, I want it to open full screen in portrait, with the status bar over its black background, so that nothing of Safari shows.
54. As a Household Member, I want it to open even when the TV is off or the Home is restarting, showing Sem conexão instead of Safari's error page, so that I can try turning the TV on from it.
55. As a Household Member, I want it to load the newest page whenever the TV answers, so that a copy saved on my phone never hides a Home update.

## Implementation Decisions

**Two projects, one feature.** This repository holds the Web Remote's page, its design and the protocol between page and bridge. free-my-tv holds the bridge, Linking, Pairing, the FMTV Controller section of Settings, the Setup changes and the Home's new screens in its own design file. Tickets for the Home's side live in free-my-tv's tracker and point back to this spec.

**The page.**
- Preact, TypeScript and Vite. It is small and has little state: connection, pairing, and the controls.
- It is served by the Home, from the same address and port as the bridge, so it needs no cross-origin rules.
- **A Home Screen app (PWA).** The page is set up to be added to the iPhone's Home Screen and open like an app:
  - A web app manifest names it **FMTV Controller** and opens it standalone, in portrait, on a black background and theme, with its start and scope at the bridge's root.
  - Safari's own tags do the same on iOS: Home Screen web app capable, a black-translucent status bar, the apple-touch-icon, and a viewport that covers the whole screen with the content kept inside the safe areas.
  - The app icon is designed in this repository's `design.pen` and exported at 180, 192 and 512 px.
- **A network-first service worker** keeps a copy of the page (ADR 0004). When the Home answers, every open loads the page it serves now. When it doesn't, the saved copy opens and shows Sem conexão, so the Web Remote never falls into Safari's error page. The protocol version in the hello still makes an outdated page reload once.
- It keeps the Paired Phone's credential in the Home Screen app's own storage. On iOS that storage is separate from Safari's, which is why pairing happens after "Adicionar à Tela de Início".
- Each release here publishes the built page as a versioned zip on GitHub. free-my-tv pins the version and its checksum and unpacks it into the APK's assets at build time (ADR 0002).

**The protocol between page and bridge.**
- **Pairing** is HTTP: start Pairing with the Pairing Code and a phone name, which answers with a credential or a reason for refusal (wrong code, Pairing not open, too many tries).
- **Everything else is one WebSocket per open Web Remote**, authenticated with the credential:
  - It opens with a hello that carries the protocol version. A page whose version the bridge doesn't speak is told to reload, and reloads once.
  - The bridge reports its state: ready, not linked, or revoked.
  - The page sends keys as intentions, not raw key codes: move up/down/left/right, OK, Voltar, Home, play/pause, volume up/down, mute, power. Each key comes as a press, a hold start or a hold end.
  - The bridge acknowledges each key.
  - "Pressing Home twice" is two Home presses, and the Home recognises it as with the Remote. The page adds no meaning of its own: the Home decides what a gesture does, whichever remote it came from.
  - Keys are not queued while disconnected: a key sent without a live connection is dropped, never replayed later.
- The messages are defined in this repository, with JSON examples of every message that both projects' tests read.

**The bridge, in the Home.**
- It runs for as long as the Home is alive, on a fixed port distinct from APK Drop's, and serves the page and the protocol above.
- It counts against the Home's memory budget (free-my-tv ADR 0004): nothing kept per key, and nothing running when no Web Remote is connected beyond a listening socket.
- It passes keys to the TV Remote Service at `127.0.0.1` as that service's own protocol expects, with the credential Linking produced.
- The TV Remote Service connection sits behind `TvPlatform`, like every other part of Android: link, report whether linked, send a key with a direction (press, hold start, hold end).

**Linking, in the Home.** Settings → FMTV Controller starts Linking. The Home connects to the TV Remote Service, Android shows its code on the TV, and the Owner types it into a Home dialog with the Remote. The resulting credential is kept by the Home. Linking is lost on Restore.

**Pairing, in the Home.**
- "Parear aparelho" opens a Pairing session that lives only while the screen is open. It shows the address as a QR code and a short Pairing Code, which changes after a few wrong tries.
- A successful Pairing stores a Paired Phone: the name the Household Member gave it, a credential, and when it was paired.
- Revoking deletes it and closes that phone's open WebSocket.

**Setup, in free-my-tv.** The TV Remote Service's package joins the packages Setup refuses to disable. The Home's Setup status gains a check that the service is present and enabled.

**Turning the TV on.** It is best-effort: the "Sem conexão" screen sends a power key to the TV's last address in case the bridge is still reachable. Nothing beyond that, such as Wake-on-LAN, is in this release.

**The TV's address.** The QR code holds the TV's IP and the bridge's port. The Home Screen icon and the Paired Phone's credential are tied to that address, so the Owner should reserve the TV's IP in the router; the FMTV Controller screen says so. If the address changes anyway, Household Members scan the QR code and pair again.

## Testing Decisions

A good test drives a whole side through its outermost boundary and checks only what someone outside could see: what the page sends and shows, or what the Home sends to the TV Remote Service and shows on its screens. No test looks at components, internal state or private functions.

- **The page, against a fake bridge.** The tests render the real page and connect it to a fake bridge that speaks the protocol. They check that:
  - each gesture and button sends the right key and direction;
  - a tap isn't a swipe, and holding is a hold start followed by a hold end;
  - Pairing's refusals are told to the Household Member;
  - "Sem conexão", "not linked" and "revoked" each show their screen;
  - keys aren't replayed after a reconnect;
  - a version mismatch reloads once;
  - opened while the bridge can't be reached, the saved page shows Sem conexão, and once the bridge answers, the next open loads the page it serves.
  
  This repository has no prior art yet. These tests set it.
- **The Home, against `FakeTvPlatform`.** In free-my-tv, the tests drive the bridge, Pairing and Linking on the JVM. They check:
  - Pairing sessions only exist while the screen is open;
  - wrong codes, and the code changing after them;
  - Paired Phones listed and revoked, and a revoked phone's connection closed;
  - a key from a Paired Phone reaches the fake TV Remote Service with its direction, and one from an unpaired phone doesn't;
  - "not linked" is reported to the page;
  - Setup's protected list includes the TV Remote Service.
  
  The prior art is `ApkDropTest`, for a session that lives while a screen is open and its code rules, plus the existing Setup planning tests.
- **The protocol, from both sides.** Both test suites read the same JSON examples of every message: the page's tests check it produces and understands them, and the Home's tests check the bridge does. A change on one side breaks the other's tests.
- **The real TV Remote Service** can only be checked on the TV. The prototype and the "apply to the TV" ticket check it there by hand.

## Out of Scope

- **The companion features**, each in a later spec, in this order:
  1. typing text into the field focused on the TV;
  2. opening any installed app;
  3. switching Inputs;
  4. the App Switcher's Open Apps on the phone;
  5. the Owner's Shortcut Buttons;
  6. resuming from the Up Next Tray;
  7. finding a Title from Explorar and opening it on the TV.
- **Turning the TV on reliably**, such as with Wake-on-LAN.
- **Any TV other than the one running the Home**, and any phone other than an iPhone being designed for, although the page should work in other browsers.
- **HTTPS, accounts, or reaching the TV from outside the home network.**
- **Levels of permission among Household Members.**
- **A D-pad mode for the Touchpad**, until the Touchpad proves imprecise.
- **A switch to turn the Web Remote off.** With no Paired Phones it accepts nothing but Pairing, which needs the Pair a Phone screen open.
- **Finding the TV by name** (`.local`) instead of by IP.

## Further Notes

- **Prototype first.** The first ticket is a prototype on the real TV. It must confirm that the TCL's TV Remote Service accepts a connection from the Home at `127.0.0.1`, that Linking works, and that a key sent this way reaches another app such as Netflix or YouTube. It should also note whether the Android TV emulator has the service, which decides how much can be tried before touching the TV. If the TV refuses, ADR 0001 is reopened before anything else is built.
- **iOS storage.** Whether a Home Screen web app keeps its storage separate from Safari's has changed across iOS versions. Check it on the iPhone 17 Pro, since it decides when Pairing is asked.
- **The haptic.** The haptic relies on Safari's switch control producing a tick, which no standard guarantees. Treat it as decoration.
- **Design.** The page's screens are designed in a `design.pen` in this repository before they are built: controls, Pairing, Sem conexão, not linked, revoked, and the app icon. The FMTV Controller section of Settings, Parear aparelho and Linking are designed in free-my-tv's `design.pen`, in the style of APK Drop.
