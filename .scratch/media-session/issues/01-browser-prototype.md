# 01: Preparar protótipo isolado de Media Session no iPhone

> **DESCARTADO em 2026-10-27.** Usuário: “Tem muitas limitações nisso, reverter essa feature”. Integração removida dos dois projetos e APK anterior restaurado na TV. O conteúdo abaixo é histórico do experimento; não é plano ativo nem recurso disponível.

Status: wontfix
Type: prototype
Blocked by: nenhum; recurso descartado pelo usuário.

## Entrega

Criar um protótipo isolado em `.scratch/media-session/prototype/`, conforme a [spec](../spec.md), com servidor de TV simulada e instruções reproduzíveis em `README.md`. Não integrar à aplicação nem conectar à TV real. Sua identidade ao adicionar à Tela de Início deve ser distinta do FMTV Controller.

Comparar metadados sem áudio, arquivo de silêncio iniciado por toque e referência audível explicitamente identificada. Simular estado, título e posição do lado do servidor; registrar comando recebido e confirmação. Oferecer as duas políticas de pausa do áudio auxiliar e desativação completa.

## Aceitação

- [x] Página servida por HTTP na LAN, somente da pasta de teste; nenhum acesso às credenciais ou ao armazenamento do Controller real.
- [x] API e ações detectadas com tratamento de erro; sem áudio automático ao carregar.
- [x] Eventos de áudio, visibilidade, conexão, estado simulado, comandos e confirmação do servidor aparecem no relatório com horário.
- [x] Alterações do servidor podem ser disparadas sem trazer a página do iPhone para frente, inclusive por uma segunda página no computador.
- [x] Relatório exportável distingue observação humana de eventos JS e deixa verificações físicas como `Não avaliado`.
- [x] Instruções cobrem Safari e Tela de Início, as duas políticas de pausa e roteiro de 1/5/15 minutos do ticket 02.
- [x] Verificação local confirma carregamento, mudanças e confirmação de comandos; resultados desktop são identificados como instrumentação, sem declarar aprovação do iPhone.

## Limite e próximo passo

Concluir este ticket entrega a ferramenta. Somente o [ticket 02](02-physical-browser-validation.md) decide a viabilidade do navegador. Não criar fixtures definitivas do protocolo da TV nesta etapa.

## Comments

**2026-10-27 — Implementado e verificado localmente.** O [protótipo](../prototype/README.md) inclui página do telefone, operador independente, estado/relógio no servidor, agendamentos, silêncio PCM em loop, referência audível, políticas de pausa e relatório com eventos e confirmação. A [validação local](../prototype-validation.md) registra os checks e seu limite. O ticket 02 está pronto para a pessoa testar; 03–07 continuam condicionais. Nenhum módulo de produção, pareamento, protocolo ou release foi alterado.

## Encerramento — 2026-10-27

Revertido a pedido explícito do usuário após limitações de metadados/controles, dependência do áudio auxiliar e falha de ativação ao tentar ocultar o tempo. Nenhuma investigação adicional ou publicação será feita. Documentação e evidências preservadas como histórico. Ver `rollback.md` ao lado da spec.
