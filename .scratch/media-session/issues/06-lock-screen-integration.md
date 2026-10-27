# 06: Integrar controles experimentais da tela bloqueada ao Controller

> **DESCARTADO em 2026-10-27.** Usuário: “Tem muitas limitações nisso, reverter essa feature”. Integração removida dos dois projetos e APK anterior restaurado na TV. O conteúdo abaixo é histórico do experimento; não é plano ativo nem recurso disponível.

Status: wontfix
Type: task
Blocked by: nenhum; recurso descartado pelo usuário.

## Entrega

Integrar o mecanismo aprovado no ticket 02 ao Controller real, conforme a [spec](../spec.md). Promover a `ready-for-agent` após as dependências. Recurso desligado por padrão, ativado explicitamente na aba Controle e identificado como experimental.

## Aceitação

- [ ] Ativar/desativar têm nomes acessíveis e aparência consistente; API ausente, Home antigo, conexão indisponível e sessão sem suporte apresentam estado útil.
- [ ] Toque inicia a política de áudio aprovada; estado, metadados e progresso refletem a TV. Fallback de app/arte não reutiliza obra anterior.
- [ ] Somente ações publicadas pela sessão são registradas; play/pause usam o contrato explícito, sem fallback de alternância.
- [ ] Requisição pendente/erro/timeout não vira sucesso otimista; mudanças recebidas substituem o estado e comandos não são reenviados na reconexão.
- [ ] Interrupção do áudio e chamada não são confundidas automaticamente com uma intenção de pausar a TV. Política segue o relatório de 02.
- [ ] Desativar, revogar, encerrar sessão ou perder dados válidos limpa áudio, handlers, progresso e URLs de imagem; retratos fora de ordem são ignorados. Desativar não pausa a TV.
- [ ] Dados vencem após 15 segundos sem retrato enquanto a página executa. Reconexão exige retrato novo; não presumir que o timer executa quando o iOS suspende a página.
- [ ] Testes contra fake bridge verificam intenções, capacidades, mudanças, erros e limpeza; `npm test` e `npm run build` passam. Não tratar mocks/desktop como validação da tela bloqueada.
- [ ] Preparar candidato completo para 07; manter Touchpad, Multitarefas, pareamento e abas existentes funcionando. Sem publicação de release.

## Comments

**2026-10-27 — Implementação concluída; aceitação física no ticket 07.** Hook mantido no Controller entre abas, ativação por toque na aba Controle, áudio auxiliar de silêncio/keep, metadados/progresso e play/pause explícitos dirigidos à sessão. Não há ativação persistida ou retomada automática após reconexão. API/Home indisponíveis apresentam mensagem; limpeza libera áudio, handlers, progresso e blob da capa. Reaplica os controles após o início do áudio no Safari. Identificado como experimental e desligado por padrão.

136 testes do Controller e build TypeScript/Vite passaram. Oito testes novos cobrem opt-in, comando explícito, Netflix sem duração, desativação sem pause, desconexão sem replay, revisão antiga, validade e Home antigo. Prévia desktop confirmou ativação com simulador; não equivale a tela bloqueada do iPhone. Ações `pause` que o sistema possa emitir por chamada/interrupção ainda requerem teste físico; não declarar esse critério aprovado. Candidato entregue à TV, sem release público.

## Encerramento — 2026-10-27

Revertido a pedido explícito do usuário após limitações de metadados/controles, dependência do áudio auxiliar e falha de ativação ao tentar ocultar o tempo. Nenhuma investigação adicional ou publicação será feita. Documentação e evidências preservadas como histórico. Ver `rollback.md` ao lado da spec.
