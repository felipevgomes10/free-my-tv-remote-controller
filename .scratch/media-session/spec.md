# FMTV Controller: mídia da TV na tela bloqueada do iPhone

> **DESCARTADO em 2026-10-27.** Usuário: “Tem muitas limitações nisso, reverter essa feature”. Integração removida dos dois projetos e APK anterior restaurado na TV. O conteúdo abaixo é histórico do experimento; não é plano ativo nem recurso disponível.

Status: wontfix
Data: 2026-10-27
Escopo liberado inicialmente: protótipo isolado; integração condicionada às etapas abaixo.

Andamento em 2026-10-27: tickets 01 e 03–06 concluídos para o recorte experimental YouTube/Netflix. Candidato integrado instalado na TV e 07 pronto para validação humana. Uso básico do simulador confirmado nos modos normal e standalone em silêncio/keep. O usuário pediu seguir sem esperar o teste de 15 minutos e limitou a medição a YouTube/Netflix. Duração, interrupções e demais cenários permanecem pendentes; não há aprovação de estabilidade nem release. [Entrega e pendências](../../../free-my-tv/.scratch/media-session/paired-device-results.md).

## Problema e resultado esperado

O Morador quer consultar o que está sendo reproduzido na TV e pausar/retomar pela tela bloqueada do iPhone, sem abrir o FMTV Controller a cada comando. O vídeo e seu áudio continuam na TV.

A [pesquisa](viability.md) encontrou uma alternativa experimental: usar a Media Session API associada à reprodução de um arquivo de silêncio no telefone. Suporte à API, `play()` resolvido e cartão visível não comprovam funcionamento dos comandos nem continuidade da conexão. Os [testes físicos do simulador](browser-validation.md) aprovaram uso básico; a aceitação do candidato integrado é separada.

Esta é a spec da página. A [spec do Home](../../../free-my-tv/.scratch/media-session/spec.md) cobre as sessões e os comandos na TV. Os tickets são numerados entre os dois repositórios.

## Etapas e decisão de continuidade

| Etapa | Entrega | Condição para avançar |
| --- | --- | --- |
| A — navegador | Protótipo com servidor simulado e relatório físico | Safari e página adicionada à Tela de Início passam pelo ticket 02 |
| B — TV | Matriz real de sessões, metadados e comandos; medição liberada pelo usuário antes de concluir A | Ticket 03 identifica ao menos um app com play/pause explícitos confiáveis e registra todos os apps alvo |
| C — integração | Contrato compartilhado, Home e Controller | Tickets 04–06 respeitam as capacidades medidas e mantêm o recurso experimental desligado por padrão |
| D — aceitação | Fluxo completo no iPhone e na TV | Ticket 07 confirma a experiência integrada, incluindo limitações por app |

Somente 01 podia começar imediatamente no plano inicial. Em 2026-10-27, o usuário liberou 03 em paralelo a 02 para não esperar os testes prolongados; esta exceção não aprova os testes pendentes nem libera automaticamente 04–07. As dependências restantes são condições de execução. A conclusão de um teste com resultado negativo não libera sua etapa seguinte. Tickets condicionais ficam `needs-triage` até haver evidência suficiente; depois passam ao responsável adequado. Conclusões e evidências são registradas nos tickets, sem transformar `Status` em prova de sucesso.

**Recorte posterior do usuário:** Netflix e YouTube bastam para continuar; outros apps serão testados depois. O [resultado de 03](../../../free-my-tv/.scratch/media-session/tv-session-results.md) libera o contrato e o desenvolvimento experimental para esses dois apps. Os testes não executados de 02 permanecem pendentes na validação do candidato, antes de afirmar estabilidade. Não interpretar a continuação como aprovação física desses cenários.

Se A falhar em uma das duas formas de abertura, interromper a integração e registrar o resultado. Se B não encontrar nenhum app controlável, encerrar o esforço. Se D falhar nos cenários obrigatórios, corrigir e repetir o cenário afetado ou retirar a integração experimental. Preservar os relatórios e marcar o trabalho descartado como `wontfix`, com o motivo. Um eventual recorte de plataformas exige revisar estas specs antes de liberar novos tickets.

## Protótipo do navegador

- Página isolada e identidade de instalação própria, sem importar credenciais, dados ou armazenamento do Controller real. Servir somente a pasta do protótipo e usar HTTP na rede local, como o Controller atual.
- Comparar metadados/handlers sem áudio com arquivo de silêncio em loop iniciado por toque, sem `muted` e sem `volume=0`. Um áudio audível curto pode servir de referência, iniciado explicitamente e identificado como teste.
- Simular TV tocando/pausada, troca de título e posição com um servidor que continua operando enquanto a página está oculta. Comandos recebem confirmação e horário do servidor; não basta contar callbacks no telefone.
- Comparar pausar o áudio auxiliar junto com a TV e mantê-lo tocando durante a pausa. Registrar qual alternativa preserva retomada e estado correto. A técnica vencedora depende da medição, não está decidida aqui.
- Relatório exportável com modelo/iOS informados pela pessoa, user agent, URL/origem, `isSecureContext`, modo de abertura/standalone, API e ações disponíveis, erros, eventos de visibilidade/áudio/conexão, comandos e confirmações. Não incluir credenciais reais.
- Campos de observação física começam como `Não avaliado`. O relatório distingue estado simulado, comando recebido pelo servidor e ação observada na TV; a etapa A só mede os dois primeiros.

## Comportamento da integração, se aprovada

1. Na aba Controle, oferecer **Ativar controles na tela bloqueada · Experimental** e ação de desativar. Seguir os componentes e a linguagem visual existentes; esta tarefa não altera `design.pen`.
2. Ativação exige toque explícito, conexão `ready`, API disponível e sessão atual controlável. Não iniciar áudio auxiliar ao abrir a página nem tentar manter o recurso ativo após desativação explícita.
3. Exibir título/capa do app quando fornecidos pela sessão atual. Sem título, usar `Reproduzindo em <app>` ou `Pausado em <app>`; sem capa, usar arte do app ou imagem neutra. Não reutilizar a obra anterior nem deduzir a reprodução pela lista Continuar assistindo.
4. Estado e progresso representam a TV. O áudio auxiliar não define se a TV está tocando. Sem duração/posição válidas, omitir a barra de progresso; pausar a extrapolação quando a sessão da TV estiver pausada.
5. Registrar somente ações publicadas e comprovadas para a sessão. Play/pause explícitos são o mínimo. Avanço/retorno, próxima/anterior e seek só entram se o ticket 03 os validar; volume da TV não é prometido pela Media Session web.
6. Um comando sempre identifica a sessão/obra esperada. Repetir play enquanto já toca ou pause enquanto já está pausado não inverte o estado. Nunca usar `play-pause` global como fallback silencioso.
7. Durante uma solicitação, evitar duplicações. Em falha, não apresentar sucesso nem manter estado otimista como verdade. O Home confirma o estado observado; o prazo de resposta é de até 5 segundos, como nas solicitações atuais.
8. Ao perder `ready`, revogar o pareamento, encerrar a sessão ou desativar o recurso: cancelar requisições, remover handlers/metadados/progresso, parar e liberar áudio e imagens. Reconexão busca um retrato novo; não reenvia comandos pendentes. Ativação após interrupção respeita a política de áudio medida no ticket 02, sem ciclos automáticos de retomada que disputem a mídia do telefone.
9. Cada retrato traz revisão, identidade e instante de observação. O Home envia mudanças e um retrato pelo menos a cada 5 segundos enquanto houver assinatura; após 15 segundos sem atualização, a página em execução considera os dados vencidos e desativa a sessão. Se a suspensão do iOS impedir essa limpeza, registrar o cartão obsoleto como falha de aceitação, sem afirmar que um timer contorna a suspensão.
10. Sem API ou com Home antigo/ação indisponível, mostrar indisponibilidade no Controller e manter os controles atuais. Não ativar uma sessão fictícia sem fonte de reprodução válida.

## Contrato entre projetos

O [ticket 04](issues/04-shared-playback-contract.md) fixou os nomes, JSON e erros no [protocolo](../../protocol/README.md), com exemplos `playback*`. Requisitos:

- Reutilizar o WebSocket autenticado e a regra `ready`; assinatura recebe retrato inicial e mudanças, sem expor dados a telefone não pareado. Encerrar assinatura ao desconectar/desativar.
- Retrato contém sessão atual ou ausência explícita, identidade da sessão e da obra quando identificável, revisão, app, título/subtítulo opcionais, imagem opcional, estado, posição/duração opcionais, velocidade, horário de observação e capacidades. Não fabricar precisão quando o app não identifica a obra.
- Play, pause e ações opcionais são intenções explícitas dirigidas à sessão, com IDs no contador existente. Mudança de alvo, ação sem suporte, perda de acesso e timeout geram falha definida, sem atingir outra sessão.
- Imagens seguem o fluxo autenticado existente, com IDs opacos e credencial no header; validar a compatibilidade do blob carregado com a arte da tela bloqueada. Credenciais nunca vão na URL da capa.
- Manter protocolo 2 de forma aditiva se compatível com os dois lados; documentar detecção de Home antigo/`unknown-request`, sem declarar suporte só por receber `ready`. Se os resultados exigirem quebra, revisar o contrato e a negociação antes de implementar.
- Exemplos executáveis pertencem a `protocol/examples/`, consumidos por ambos os projetos pelo bundle como hoje. O contrato está implementado no candidato, ainda sem aceitação física integrada concluída.

## Aceitação física obrigatória

Medir no Safari e pela identidade adicionada à Tela de Início, registrando navegador usado para adicioná-la, modelo e versão real do iOS. O registro anterior de iOS 26.6.2 em outro teste não substitui essa identificação.

- Após bloquear por 1, 5 e 15 minutos, play/pause continuam respondendo em até 5 segundos sem abrir a página. Repetir com pausa da TV por 15 minutos e retomada pela tela bloqueada.
- Mudança de título e play/pause pelo Controle físico chegam ao telefone em até 5 segundos após o Home observar a mudança. Posição acompanha a TV sem avançar durante pausa; título/capa antigos não ficam associados à nova reprodução.
- Desativação, fim da sessão, falta de rede e revogação não deixam um cartão operável com dados vencidos. Retorno do Wi-Fi e reconexão não executam ações antigas.
- Trocar de app no telefone, receber uma chamada e iniciar música/podcast não geram retomadas automáticas, disputa contínua por controles ou comandos enviados à TV por uma interrupção do sistema. O comportamento de interrupção deve ser registrado e repetido.
- Usar o botão **Desativar** não pausa a TV. Usar **Pause** na tela bloqueada pausa a TV uma vez. A sessão é encerrada ao desativar.
- Modo adicionado à Tela de Início tem validação própria; sucesso numa aba ou num teste desktop não o aprova.

## Tickets

| Nº | Repositório | Ticket | Status atual | Dependências |
| --- | --- | --- | --- | --- |
| 01 | Controller | [Protótipo isolado](issues/01-browser-prototype.md) | wontfix | Nenhuma |
| 02 | Controller | [Validar no iPhone](issues/02-physical-browser-validation.md) | wontfix | 01 |
| 03 | Home | [Medir sessões e comandos na TV](../../../free-my-tv/.scratch/media-session/issues/03-tv-session-probe.md) | wontfix | Recorte YouTube/Netflix aprovado pelo usuário |
| 04 | Controller | [Contrato compartilhado](issues/04-shared-playback-contract.md) | wontfix | Evidências de 03; pendências de 02 mantidas em 07 |
| 05 | Home | [Sessão atual e comandos no bridge](../../../free-my-tv/.scratch/media-session/issues/05-playback-over-the-bridge.md) | wontfix | 04 |
| 06 | Controller | [Integrar Media Session](issues/06-lock-screen-integration.md) | wontfix | 05 e exemplos de 04 |
| 07 | Home | [Aceitação integrada e decisão](../../../free-my-tv/.scratch/media-session/issues/07-paired-device-acceptance.md) | wontfix | Candidato instalado; testes físicos pendentes |

## Fora do escopo

App iOS nativo, Now Playing nativo, Live Activities, APNs/servidor público, mudança para HTTPS, transmissão do vídeo/áudio da TV para o telefone, suporte a HDMI/antena sem sessão Android, garantia de capa/título em todos os streamings e publicação de releases. O esforço inclui apenas o arquivo auxiliar de silêncio no telefone; não altera o escopo de reprodução de obras/trailers da spec de companion nem os ADRs de transporte existentes.

## Extensão de 2026-10-27: saltos de segundos

Após confirmar play/pause na tela bloqueada integrada, o usuário pediu saltos no vídeo. O Controller encaminha seekforward/seekbackward com padrão de 10 segundos (offset do sistema limitado a 30 s) ; o contrato aceita posição absoluta, mas o cartão mantém seekto desativado conforme o pedido abaixo. Home calcula saltos relativos usando posição atual da TV, valida alvo/parâmetros e observa o resultado. Seek é publicado para YouTube com capacidade anunciada e para Netflix somente durante reprodução. Netflix pausado não atingiu o alvo; repetido tocando confirmou avanço/retorno em 2046/1737 ms. Quando pausado, é preciso dar play antes do salto. Próxima/anterior da fila ficam fora. Validação final do cartão com o novo candidato permanece no ticket 07.

## Preferência posterior: ocultar tempo em todos os apps

Usuário pediu ocultar a barra no cartão “Em todos os apps, inclusive YouTube”. A página não publica duração/posição finitas na Media Session: declara duração infinita e desativa seekto. Mantém play/pause, capa/título e saltos relativos. Isso substitui os critérios anteriores de mostrar progresso no cartão; o retrato da TV continua contendo tempo real para calcular saltos. A aparência do cartão pertence ao iOS; o resultado pode ser barra oculta ou aparência de mídia ao vivo e requer confirmação física. Não declarar ocultação visual garantida pela API.

## Encerramento — 2026-10-27

Revertido a pedido explícito do usuário após limitações de metadados/controles, dependência do áudio auxiliar e falha de ativação ao tentar ocultar o tempo. Nenhuma investigação adicional ou publicação será feita. Documentação e evidências preservadas como histórico. Ver `rollback.md` ao lado da spec.
