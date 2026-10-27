> **DESCARTADO.** Fontes históricas do experimento; servidor encerrado e integração removida em 2026-10-27.

# Protótipo: Media Session na tela bloqueada

TV e comandos são simulados. Este diretório não importa o app, não lê pareamento, não usa localStorage/cookies nem se conecta à TV real. Estado e eventos ficam em memória; baixe o relatório antes de recarregar ou encerrar o servidor.

## Executar

Na raiz de `free-my-tv-remote-controller`, com as dependências do projeto já instaladas:

```sh
node .scratch/media-session/prototype/server.mjs
```

O servidor imprime o endereço da LAN. Porta padrão: **8768**, diferente da TV e dos ensaios anteriores. Para trocar, use `MEDIA_SESSION_PORT=8769 node .scratch/media-session/prototype/server.mjs`. Encerre com Ctrl+C. O Mac deve continuar acordado e na mesma rede do iPhone durante o teste.

- **iPhone:** `http://<IP-do-Mac>:8768/`.
- **Computador, operador:** `http://<IP-do-Mac>:8768/?operator=1`.

Use o IP que o servidor imprime, não `localhost` no iPhone. O servidor aceita apenas hosts locais conhecidos e arquivos explicitamente permitidos; não serve o repositório, arquivos do servidor nem o Controller de produção. O WebSocket é `/lab`, restrito à mesma origem. Qualquer pessoa na LAN que abra o ensaio pode operar **o simulador**, sem qualquer efeito na TV real. A lista de endereços é capturada ao iniciar; reinicie se a rede do Mac mudar.

## Ensaio no iPhone

1. Abra no Safari. Informe modelo e iOS em **Registrar o que aconteceu no iPhone**. O próprio ensaio mostra API presente, contexto seguro e standalone; isso não é aprovação física.
2. Comece com **Somente metadados, sem áudio**. Toque **Ativar ensaio**, bloqueie a tela e observe se há cartão e comandos. Exporte o resultado, inclusive se nada aparecer.
3. Toque **Novo ensaio** e teste **Arquivo de silêncio em loop**, primeiro mantendo o auxiliar tocando. O WAV tem 12 segundos de amostras zero, `muted=false` e volume 1. Seu tempo não representa o progresso da TV simulada.
4. Repita em outro ensaio com **Pausar também o áudio auxiliar**. Compare principalmente pausa de 15 minutos e retomada pela tela bloqueada. A política fica fixa por ensaio para não misturar os resultados.
5. Se necessário, compare a **Referência audível**, um tom baixo de 12 segundos, sem loop. Ela produz som; não é a solução proposta. O fim natural do arquivo é registrado e não reiniciado automaticamente.
6. Para testar o ícone, adicione essa página à Tela de Início com o nome **Teste de mídia**. Abra pelo ícone, confira `Standalone: sim` e repita os ensaios. Anote o navegador usado para adicionar. Não substitua o ícone nem limpe os dados do FMTV Controller real. O protótipo não registra service worker nem promete instalação/offline em HTTP.

## Operador enquanto o telefone está bloqueado

Mantenha a página `?operator=1` aberta no computador. Ela controla a mesma TV simulada, mas nunca registra Media Session ou inicia áudio no computador. Todos os telefones/abas conectados compartilham o estado da TV simulada; teste um iPhone por vez.

- Envie **Pausar**, **Reproduzir**, **Próximo título**, mudança de posição, encerramento ou nova sessão.
- Para testar sem tocar no computador na hora, escolha **Executar após quantos segundos?** e envie: por exemplo, próximo título após 60 segundos. Bloqueie o iPhone antes do horário.
- **Cancelar agendamentos** cancela todos os comandos agendados do ensaio. Reiniciar o servidor também limpa estado, agendamentos e histórico.
- O servidor envia um retrato a cada 5 segundos. O progresso é calculado pelo relógio do servidor, continua com o iPhone oculto e para durante pausa. A obra simulada dura 45 minutos para não acabar antes do roteiro de bloqueio.

## Roteiro e decisão

Em cada forma de abertura, use os seletores de resultado após observar o cenário. O resultado inicial é **Não avaliado**.

- Bloquear por **1, 5 e 15 minutos**, usar play/pause na tela bloqueada e confirmar no operador a mudança em até 5 segundos.
- Deixar a TV simulada **pausada por 15 minutos** e retomar sem abrir a página. Comparar as duas políticas de áudio em ensaios separados.
- Pelo operador, trocar título/estado e observar a atualização em até 5 segundos; conferir capa e progresso, inclusive pausa.
- Testar perda/retorno de Wi-Fi, outro app no iPhone, chamada e música/podcast. Registrar comandos involuntários gerados por interrupções, falta de retomada e disputa pelos controles como falhas.
- Desativar deve retirar metadados/handlers e liberar o áudio **sem enviar pause ao simulador**. Encerrar a sessão no operador também desativa o ensaio; iniciar outra exige nova ativação por toque.

O protótipo não mapeia o evento `pause` do elemento de áudio para a TV. Ele registra callbacks `MediaSession` e os encaminha explicitamente; um callback do sistema durante uma chamada pode ainda parecer uma intenção da pessoa, por isso a medição de interrupções é obrigatória. Se a política de seguir a TV precisar reiniciar áudio, há uma tentativa por transição real, sem disputa contínua a cada heartbeat. Rejeição de `play()` fica no relatório.

Se a conexão fechar, o protótipo desativa a Media Session, descarta pedidos e reconecta sem reativação automática. Enquanto a página executa, 15 segundos sem retrato também a desativam. Isso **não** garante execução do timer quando o iOS suspende a página; um cartão obsoleto nessa situação deve ser registrado como falha.

## Exportar

Toque **Gerar relatório** depois de preencher os resultados. Copie o resumo e baixe o JSON completo pelo link. A exportação tenta obter o histórico do servidor; se estiver offline, ainda entrega os eventos locais e registra a ausência do histórico. Guarde o arquivo antes de Novo ensaio/recarregar.

O JSON separa observações humanas, eventos do navegador e comandos recebidos/aplicados pelo servidor, com horários e ID do ensaio. O resumo conta confirmações sem tratá-las como prova de tela bloqueada. As ações do operador são identificadas separadamente; não provam que o telefone enviou comandos. Latências cliente/servidor usam confirmação de ida e volta; relógios de máquinas diferentes não devem ser subtraídos para inventar latência de atualização.

Buffers são limitados a 1.500 eventos no cliente e 2.000 no servidor; descartes constam no relatório. Não inserir dados sensíveis nos campos livres. Nenhum relatório é salvo automaticamente no servidor.

Apenas o [ticket 02](../issues/02-physical-browser-validation.md) decide se o navegador passa. Mesmo um resultado positivo aqui não valida os apps nem os comandos na TV real.
