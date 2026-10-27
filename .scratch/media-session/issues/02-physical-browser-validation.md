# 02: Validar ativação e continuidade na tela bloqueada do iPhone

> **DESCARTADO em 2026-10-27.** Usuário: “Tem muitas limitações nisso, reverter essa feature”. Integração removida dos dois projetos e APK anterior restaurado na TV. O conteúdo abaixo é histórico do experimento; não é plano ativo nem recurso disponível.

Status: wontfix
Type: prototype
Blocked by: nenhum; recurso descartado pelo usuário.

## Pergunta

O iPhone consegue mostrar estado correto e enviar comandos ao servidor simulado, após bloqueio e pausa longa, nas duas formas de abertura? Seguir a [spec](../spec.md). A pessoa opera o aparelho; o agente pode preparar o servidor e analisar o relatório.

## Aceitação e evidências

- [ ] Registrar modelo/iOS real, Safari ou outro navegador usado para adicionar o ícone, URL HTTP e modo standalone efetivamente detectado.
- [ ] Comparar ausência de áudio com silêncio em loop; registrar separadamente presença do cartão, título/capa/estado corretos e comandos confirmados no servidor.
- [ ] No Safari e na Tela de Início, bloquear por 1, 5 e 15 minutos e enviar play/pause sem abrir a página; confirmação em até 5 segundos.
- [ ] Pausar por 15 minutos e retomar pela tela bloqueada; comparar pausar o áudio auxiliar e mantê-lo tocando, registrando política aprovada.
- [ ] Mudança de título e estado disparada pelo servidor aparece em até 5 segundos; posição não avança na pausa.
- [ ] Testar Wi-Fi perdido/recuperado, troca de app, chamada, música/podcast no iPhone e desativação; nenhum comando antigo é repetido nem há disputa automática pelos controles.
- [ ] Exportar relatórios e escrever `browser-validation.md` ao lado da spec, com matriz por modo/cenário: `passou`, `falhou`, `não avaliado`, evidência e limitações.

## Decisão obrigatória

Ambos os modos precisam passar os cenários obrigatórios da spec para liberar 03. Um campo não avaliado não é aprovação. Se falhar, registrar o motivo e encerrar/revisar o escopo antes de liberar integração; preservar o teste e marcar trabalho descartado como `wontfix`. Não apresentar resultado do servidor simulado como comando observado na TV real.

## Comments

**2026-10-27 — Preparado para teste.** [Instruções e roteiro](../prototype/README.md); [validação desktop](../prototype-validation.md). Na sessão de implementação, o servidor foi iniciado em `http://192.168.100.227:8768/`, com operador em `http://192.168.100.227:8768/?operator=1`. O endereço é do Mac nesta rede; confirmar a saída do servidor ao reiniciar. Nenhum cenário deste ticket foi aprovado fisicamente. Exportar resumo e JSON após cada combinação de modo/política/forma de abertura.

**2026-10-27 — Primeiro resumo recebido.** [Ensaio run-mvr1q5am-g6zm6v1jqm4](../browser-validation.md): silêncio/keep, `standalone=false`, API disponível em contexto não seguro, 1 callback de mídia e 1 confirmação do simulador. Modelo/iOS e abertura não informados; todos os campos físicos continuam `Não avaliado`. Solicitada confirmação de cartão e comando pela tela bloqueada; nenhuma etapa posterior foi liberada.

**2026-10-27 — Uso básico confirmado pela pessoa.** O usuário respondeu “Sim, o cartão apareceu e o comando funcionou” à pergunta sobre cartão na tela bloqueada e play/pause com efeito confirmado no operador. Aprovação parcial do ensaio acima: presença do cartão e ao menos um comando pela tela bloqueada. Duração, latência, campos do cartão, retomada prolongada, interrupções e Tela de Início continuam pendentes; o ticket não está resolvido. Próximo teste prioritário: pausa de 15 minutos e retomada pelo cartão, registrando modelo/iOS e o resultado.

**2026-10-27 — Segundo resumo, teste prolongado ainda não feito.** O ensaio `run-mvr217l4-m13yqa1xx7p` registrou zero callbacks e confirmações, na mesma configuração silêncio/keep e fora de standalone. A pessoa confirmou “Ainda não fiz esse teste” sobre pausar por 15 minutos e tentar retomar pela tela bloqueada. [Relatório preservado](../browser-validation.md). Não classificar as contagens como falha de retomada; manter a aprovação básica anterior e os cenários restantes pendentes.

**2026-10-27 — Uso básico standalone confirmado.** Ensaio `run-mvr23gdo-8z3uo4w44co`: silêncio/keep, `standalone=true`, 3 callbacks e 3 confirmações do simulador. O usuário confirmou “Funcionou na tela bloqueada, mas ainda não esperei 15 minutos”. Uso básico agora confirmado em modo normal e standalone; retomada prolongada e demais critérios continuam pendentes. [Resumo e confirmação preservados](../browser-validation.md). Não liberar a etapa B ainda.

**2026-10-27 — Replanejamento pedido pelo usuário.** “Esse vai demorar muito, passa pro proximo passo” autoriza iniciar 03 em paralelo, substituindo a dependência anterior para a sondagem. Os critérios não executados deste ticket permanecem pendentes. Este pedido não equivale a confirmar duração, interrupções ou liberação da integração final.

## Encerramento — 2026-10-27

Revertido a pedido explícito do usuário após limitações de metadados/controles, dependência do áudio auxiliar e falha de ativação ao tentar ocultar o tempo. Nenhuma investigação adicional ou publicação será feita. Documentação e evidências preservadas como histórico. Ver `rollback.md` ao lado da spec.
