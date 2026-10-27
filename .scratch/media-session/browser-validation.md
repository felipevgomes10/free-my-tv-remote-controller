# Media Session: resultados do teste no iPhone

> **Histórico de experimento descartado.** Recurso revertido em 2026-10-27 a pedido do usuário. Resultados abaixo não descrevem a versão atual.

Data: 2026-10-27. Ticket [02](issues/02-physical-browser-validation.md) ainda em avaliação.

## Ensaio run-mvr1q5am-g6zm6v1jqm4

Fonte: resumo exportado pelo protótipo e enviado pelo usuário na conversa. JSON completo não recebido; sem horários individuais ou detalhes da ação neste resumo.

| Item | Resultado registrado |
| --- | --- |
| Modelo / iOS / navegador | Não informados |
| Forma de abertura | Não informada; `standalone=false` |
| Configuração | `silence`, política `keep`, ativação realizada |
| API / contexto | Media Session disponível; contexto seguro falso |
| Eventos | 1 callback de mídia; 1 comando confirmado pelo simulador |
| Descartes | Cliente 0; servidor 0 |
| Observações físicas no formulário original | Todos os cenários marcados `Não avaliado` |
| Confirmação posterior na conversa | Cartão presente na tela bloqueada e comando funcionando no simulador |

**Interpretação limitada:** o resumo registra exposição da API em contexto não seguro, ativação e um callback de mídia, além de uma confirmação do servidor simulado. Não permite determinar qual ação originou o callback, se veio de um toque na tela bloqueada ou de uma interrupção, nem correlacionar callback e confirmação individualmente. Não informa presença/correção do cartão, duração do bloqueio, latência, pausa prolongada ou comportamento pelo ícone da Tela de Início. Nenhum desses cenários foi aprovado ou reprovado a partir das contagens.

## Confirmação física posterior

À pergunta “Nesse ensaio, o cartão apareceu na tela bloqueada e você tocou em play/pause ali, com mudança confirmada na página do operador?”, o usuário respondeu: **“Sim, o cartão apareceu e o comando funcionou”**.

Isso aprova o uso básico de cartão e comando pela tela bloqueada para a configuração deste ensaio (`silence`/`keep`, `standalone=false`). A ação específica, o tempo bloqueado e a latência não foram informados; também não houve confirmação separada de título, capa e progresso. Não inferir que ambos os comandos play e pause, a pausa prolongada, as interrupções ou o modo pela Tela de Início passaram. O resumo original permanece preservado abaixo, sem alterar os campos que a pessoa exportou.

O próximo teste prioritário é pausar pelo cartão, manter o iPhone bloqueado por 15 minutos e retomar pelo próprio cartão, confirmando o estado no operador. Modelo/iOS e cenários restantes continuam pendentes. Tickets 03–07 permanecem condicionais à conclusão dos critérios de 02.

## Resumo original

```text
FMTV · Teste de Media Session v1 · TV SIMULADA
Ensaio: run-mvr1q5am-g6zm6v1jqm4
iPhone: não informado · iOS: não informado
Abertura: Não informado · standalone: false
Modo: silence · pausa auxiliar: keep · ativou: true
Media Session: true · contexto seguro: false
Cartão com título, capa e estado corretos: Não avaliado
Play/pause após 1 minuto bloqueado · até 5 s: Não avaliado
Play/pause após 5 minutos bloqueado · até 5 s: Não avaliado
Play/pause após 15 minutos bloqueado · até 5 s: Não avaliado
Retomar após 15 minutos pausado · até 5 s: Não avaliado
Mudança de título/estado pelo operador · até 5 s: Não avaliado
Progresso correto e parado durante pausa: Não avaliado
Perda e retorno de Wi-Fi sem comandos antigos: Não avaliado
Troca de app no iPhone: Não avaliado
Chamada sem comando involuntário na TV simulada: Não avaliado
Música/podcast sem disputa automática por controles: Não avaliado
Desativar remove sessão e não pausa a TV simulada: Não avaliado
Callbacks de mídia: 1 · comandos confirmados no servidor: 1
Descartes: cliente=0, servidor=0
Servidor: 2026-10-27T18:48:57.301Z
Observações: nenhuma
O JSON completo inclui horários e eventos; contagens não comprovam controles na tela bloqueada nem ação na TV real.
```

## Ensaio run-mvr217l4-m13yqa1xx7p

Fonte: segundo resumo enviado pelo usuário, mesma configuração `silence`/`keep` e `standalone=false`. API disponível, contexto seguro falso, ativação realizada, zero callbacks de mídia e zero confirmações do servidor. Modelo/iOS e forma de abertura não informados; todos os cenários físicos do formulário permanecem `Não avaliado`. JSON completo não recebido.

À pergunta se esse relatório foi gerado após pausar por 15 minutos e tentar retomar pela tela bloqueada, o usuário respondeu: **“Ainda não fiz esse teste”**. Portanto, este ensaio não aprova nem reprova a retomada prolongada; zero eventos não é evidência de falha nesse cenário. Não altera a aprovação básica do ensaio anterior. O teste de 15 minutos continua pendente.

### Segundo resumo original

```text
FMTV · Teste de Media Session v1 · TV SIMULADA
Ensaio: run-mvr217l4-m13yqa1xx7p
iPhone: não informado · iOS: não informado
Abertura: Não informado · standalone: false
Modo: silence · pausa auxiliar: keep · ativou: true
Media Session: true · contexto seguro: false
Cartão com título, capa e estado corretos: Não avaliado
Play/pause após 1 minuto bloqueado · até 5 s: Não avaliado
Play/pause após 5 minutos bloqueado · até 5 s: Não avaliado
Play/pause após 15 minutos bloqueado · até 5 s: Não avaliado
Retomar após 15 minutos pausado · até 5 s: Não avaliado
Mudança de título/estado pelo operador · até 5 s: Não avaliado
Progresso correto e parado durante pausa: Não avaliado
Perda e retorno de Wi-Fi sem comandos antigos: Não avaliado
Troca de app no iPhone: Não avaliado
Chamada sem comando involuntário na TV simulada: Não avaliado
Música/podcast sem disputa automática por controles: Não avaliado
Desativar remove sessão e não pausa a TV simulada: Não avaliado
Callbacks de mídia: 0 · comandos confirmados no servidor: 0
Descartes: cliente=0, servidor=0
Servidor: 2026-10-27T18:48:57.301Z
Observações: nenhuma
O JSON completo inclui horários e eventos; contagens não comprovam controles na tela bloqueada nem ação na TV real.
```

## Ensaio run-mvr23gdo-8z3uo4w44co

Fonte: terceiro resumo enviado pelo usuário. Configuração `silence`/`keep`, `standalone=true`, API disponível em contexto não seguro, ativação realizada, 3 callbacks de mídia e 3 comandos confirmados pelo simulador; nenhum descarte. Modelo/iOS e navegador usado para adicionar o ícone não informados. JSON completo não recebido.

À pergunta sobre funcionamento pela Tela de Início e retomada após 15 minutos pausado, o usuário respondeu: **“Funcionou na tela bloqueada, mas ainda não esperei 15 minutos”**.

**Resultado:** uso básico pela tela bloqueada confirmado no modo standalone. Somado à confirmação do primeiro ensaio, há aprovação básica nos modos normal e standalone para silêncio/keep. As ações individuais, tempos de resposta e conteúdo exato do cartão não foram detalhados. Retomada após 15 minutos permanece não avaliada; os demais critérios de 02 e a política `follow` continuam pendentes. Não liberar 03–07 a partir deste resultado parcial.

### Terceiro resumo original

```text
FMTV · Teste de Media Session v1 · TV SIMULADA
Ensaio: run-mvr23gdo-8z3uo4w44co
iPhone: não informado · iOS: não informado
Abertura: Não informado · standalone: true
Modo: silence · pausa auxiliar: keep · ativou: true
Media Session: true · contexto seguro: false
Cartão com título, capa e estado corretos: Não avaliado
Play/pause após 1 minuto bloqueado · até 5 s: Não avaliado
Play/pause após 5 minutos bloqueado · até 5 s: Não avaliado
Play/pause após 15 minutos bloqueado · até 5 s: Não avaliado
Retomar após 15 minutos pausado · até 5 s: Não avaliado
Mudança de título/estado pelo operador · até 5 s: Não avaliado
Progresso correto e parado durante pausa: Não avaliado
Perda e retorno de Wi-Fi sem comandos antigos: Não avaliado
Troca de app no iPhone: Não avaliado
Chamada sem comando involuntário na TV simulada: Não avaliado
Música/podcast sem disputa automática por controles: Não avaliado
Desativar remove sessão e não pausa a TV simulada: Não avaliado
Callbacks de mídia: 3 · comandos confirmados no servidor: 3
Descartes: cliente=0, servidor=0
Servidor: 2026-10-27T18:48:57.301Z
Observações: nenhuma
O JSON completo inclui horários e eventos; contagens não comprovam controles na tela bloqueada nem ação na TV real.
```
