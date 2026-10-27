# Physical iPhone report — 2026-10-27

Source: the owner tested the standalone prototype and pasted this report into the chat.

```text
FMTV · Protótipo de retorno tátil v1
iOS: 26.6.2
Switch nativo: disponível
Toque: Vibrou
Arraste nativo: Durante o arraste
Pad / wait: Um pulso por passo
Pad / immediate: Um pulso por passo
Pad / reverse: Um pulso por passo
Pad / fast: Um pulso por passo
Contadores atuais: {"steps":54,"requests":41,"early":13,"merged":0}
Direções recentes: Cima, Cima, Direita, Direita, Baixo, Baixo, Esquerda, Esquerda, Cima, Cima, Baixo, Baixo, Baixo, Baixo, Baixo, Baixo, Baixo, Baixo, Baixo, Baixo, Baixo, Baixo, Direita, Direita, Cima, Cima, Cima, Cima, Baixo, Baixo, Baixo, Baixo, Baixo, Baixo, Baixo, Baixo, Baixo, Baixo, Direita, Direita, Direita, Esquerda, Esquerda, Esquerda, Cima, Cima, Cima, Baixo, Baixo, Baixo, Baixo, Baixo, Baixo, Baixo
Observação: nenhuma
Contadores registram tentativas. Vibração física foi avaliada pela pessoa, não pelo navegador.
```

This establishes that the native-drag mechanism produces perceived haptics during movement on this phone, including vertical and reverse movement. It does not establish exactly 54 physical pulses: 13 steps occurred before the candidate's 240ms phase, and the browser cannot count physical haptic output. The production Touchpad's OK, hold and cancellation behavior must be checked separately after integration.

## Integrated production component

The owner then tested the real production Touchpad served by the integration harness at `http://192.168.100.227:8767/?integrado=1` and answered **"Sim, os três funcionam"** to this checklist:

- The pad still vibrates while swiping.
- One tap shows only `ok · press`.
- Holding and releasing shows `hold-start` and `hold-end`.

This validates the physical feedback and core gesture behavior of the integrated component on this iPhone. No release or TV installation was performed as part of that local check.
