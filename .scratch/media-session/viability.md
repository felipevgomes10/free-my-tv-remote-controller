# Media Session API na tela bloqueada do iPhone

> **Histórico de experimento descartado.** Recurso revertido em 2026-10-27 a pedido do usuário. Resultados abaixo não descrevem a versão atual.

Data da pesquisa: 2026-10-27.

## Conclusão

**Viável para um experimento com áudio silencioso; não validado como recurso confiável do FMTV Controller.** Apenas definir título, capa, estado e handlers não oferece um mecanismo garantido para uma página que controla a TV assumir os controles de mídia do iPhone. A alternativa web a testar é reproduzir um arquivo de silêncio no próprio telefone e usar a sessão dessa reprodução para encaminhar comandos à TV.

Esta conclusão combina documentação, especificação, código do WebKit e inspeção do projeto. **Não houve teste de Media Session em iPhone físico nesta pesquisa.** O código `main` do WebKit consultado pode diferir do Safari instalado no aparelho. A versão iOS 26.6.2 aparece em [outro teste físico do projeto](../haptic-pad/iphone-26.6.2-report.md); esse registro valida retorno tátil, não Media Session nem a versão atualmente instalada.

## Evidências primárias

### A API existe, mas a página não escolhe a sessão ativa

O WebKit documenta suporte à MediaSession API no Safari 15. Isso permite apresentar metadados e tratar comandos, mas não comprova suporte a qualquer uso como controle de um aparelho externo. [WebKit: Safari 15](https://webkit.org/blog/11989/new-webkit-features-in-safari-15/#media).

A especificação deixa ao navegador escolher no máximo uma sessão ativa. `playbackState` não pode determinar essa escolha; é uma indicação de estado para a sessão já selecionada. Os metadados e comandos apresentados pelo sistema dependem dessa seleção. Assim, `navigator.mediaSession.playbackState = "playing"` não é uma autorização para aparecer na tela bloqueada. [W3C: routing](https://www.w3.org/TR/mediasession/#routing).

### O caminho do WebKit depende da elegibilidade da reprodução

Na implementação consultada, `MediaSession` não sobrescreve `isNowPlayingEligible()` nem fornece `nowPlayingInfo()` próprio; herda os retornos padrão falso/vazio. Também informa que não recebe comandos de plataforma diretamente e não sobrepõe a restrição de reprodução em segundo plano. Seus handlers são utilizados pelas sessões de reprodução que a referenciam. Mesmo o registro de uma sessão de plataforma feito pelo setter de estado não equivale a publicar uma sessão Now Playing elegível. [MediaSession.h](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/Modules/mediasession/MediaSession.h), [PlatformMediaSessionInterface.h](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/platform/audio/PlatformMediaSessionInterface.h), [MediaSession.cpp](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/Modules/mediasession/MediaSession.cpp).

`MediaElementSession::canShowControlsManager()` rejeita elemento suspenso e elemento `muted`; considera fonte válida, duração, áudio e histórico/permissão de reprodução. `hasNowPlayingInfo()` passa por esse filtro. Portanto, um `<audio muted>` não deve ser tratado como equivalente a um arquivo com amostras de silêncio reproduzido sem `muted`. A inspeção aponta uma dependência real da sessão de reprodução, não só da presença do objeto JavaScript. [MediaElementSession.cpp](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/html/MediaElementSession.cpp).

### O arquivo de silêncio é uma hipótese concreta

Há um relato no rastreador oficial do WebKit de que reproduzir um arquivo silencioso em segundo plano faz os controles aparecerem na tela bloqueada. É evidência histórica de viabilidade da técnica, não um contrato de funcionamento no iOS atual nem uma recomendação da Apple para controles de TV. [WebKit bug 237322, comentário 5](https://bugs.webkit.org/show_bug.cgi?id=237322#c5).

O experimento deve começar por um toque explícito que inicia um `<audio>` com arquivo de silêncio e `loop`, sem `muted` e sem zerar `volume`. Não se deve presumir que autoplay de áudio será permitido. [WebKit: políticas de reprodução no iOS](https://webkit.org/blog/6784/new-video-policies-for-ios/).

### A API não concede execução contínua em segundo plano

No WebKit, a suspensão do objeto WebSocket suspende seu canal; a retomada o reativa. Logo, ter um socket aberto não constitui uma garantia de que a página processará metadados ou enviará comandos enquanto estiver suspensa. A fonte comprova o comportamento de suspensão, não um prazo fixo após bloquear o iPhone. [WebSocket.cpp, suspend/resume](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/Modules/websockets/WebSocket.cpp).

Se o áudio auxiliar for pausado junto com a TV, é necessário provar que o botão de retomar continuará funcionando depois de uma pausa longa. Se o áudio auxiliar continuar tocando, é necessário provar que os controles representam corretamente a TV pausada e que não provocam conflitos com mídia do próprio telefone. Esses são riscos a medir, não falhas já reproduzidas.

### HTTP não é um bloqueio demonstrado

O IDL normativo expõe MediaSession em `Window` sem o atributo `SecureContext`; o IDL do WebKit consultado também não o exige. Não há base nessas fontes para afirmar que a API depende obrigatoriamente de HTTPS. A presença efetiva da API no endereço HTTP da TV ainda precisa ser medida no iPhone. Essa observação não estende a mesma conclusão a service workers ou outras APIs. [W3C: interface](https://www.w3.org/TR/mediasession/#mediasession-interface), [WebKit MediaSession.idl](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/Modules/mediasession/MediaSession.idl).

## O que falta no projeto

- O transporte é HTTP/`ws` na rede local por decisão explícita do [ADR 0003](../../docs/adr/0003-plain-http-on-the-home-network.md).
- [src/protocol.ts](../../src/protocol.ts) define `play-pause` como alternância; não define comandos explícitos de reproduzir/pausar/seek nem uma assinatura de reprodução atual. Para evitar que um comando de pausa acabe retomando a TV após divergência de estado, a integração final precisa de comandos explícitos ou outro contrato de sincronização verificado.
- [src/connection.ts](../../src/connection.ts) mantém a conexão na página e tenta reconectar quando ela volta a ficar visível. Isso recupera o controle ao retornar, mas não comprova controle enquanto bloqueado.
- Os dados de reprodução e as capacidades dos apps na TV precisam chegar ao Controller; listas de Continuar assistindo não substituem uma sessão atual com estado e comandos disponíveis.

## Critério para decidir depois do protótipo

Testar no Safari e no Controller adicionado à Tela de Início, no endereço HTTP real da TV. Registrar modelo/iOS, existência da API, erros e confirmação dos comandos do lado da TV. Comparar:

1. Metadados e handlers sem áudio, para verificar a premissa de ativação.
2. Arquivo de silêncio em loop iniciado por toque, com metadados da TV e play/pause.
3. Bloqueio por 1, 5 e 15 minutos; comandos durante o bloqueio; pausa prolongada seguida de retomada; avanço e mudança de título disparados pelo Controle físico.
4. Pausa e encerramento do áudio auxiliar versus mantê-lo tocando; perda/retorno do Wi-Fi; troca de app; chamada; início de música/podcast no iPhone.

Aceitar somente se os comandos forem confirmados na TV, os metadados não ficarem desatualizados e o controle sobreviver ao ciclo pausar/esperar/retomar sem abrir a página. Um cartão visível ou `play()` resolvido, isoladamente, não comprova o fluxo.

**Recomendação:** realizar esse protótipo isolado antes de integrar ou prometer o recurso. Se passar, tratar inicialmente como experimental e limitar os botões às capacidades realmente suportadas por cada app da TV.
