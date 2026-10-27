# 04: Fixar contrato de reprodução atual entre Controller e Home

> **DESCARTADO em 2026-10-27.** Usuário: “Tem muitas limitações nisso, reverter essa feature”. Integração removida dos dois projetos e APK anterior restaurado na TV. O conteúdo abaixo é histórico do experimento; não é plano ativo nem recurso disponível.

Status: wontfix
Type: task
Blocked by: nenhum; recurso descartado pelo usuário.

## Entrega

Definir nomes e JSON em `protocol/README.md` e `protocol/examples/`, atendendo às [specs](../spec.md). Atualizar as duas specs com o contrato final e a cobertura medida. Após as evidências, promover a `ready-for-agent`; não definir ações que o ticket 03 não comprovou.

## Aceitação

- [ ] Assinar/cancelar reprodução, receber retrato inicial, mudanças e ausência explícita; retrato renovado em até 5 segundos e validade de 15 segundos no Controller.
- [ ] Fixar identidade de sessão/obra, revisão, ordenação e relógio de referência; definir eleição da sessão e campos opcionais sem fabricar metadados.
- [ ] Play/pause explícitos e ações opcionais têm alvo, parâmetros, confirmação do efeito observado e prazo de até 5 segundos. Estados transitórios/buffering e sucesso já no estado desejado têm regra escrita.
- [ ] Erros cobrem ação não suportada, alvo alterado, parâmetros inválidos, acesso indisponível, timeout e falha inesperada. Nenhuma falha redireciona a ação para outro app.
- [ ] Exemplos cobrem sessão tocando/pausada, ausência, metadados incompletos, troca de obra, sucesso, comando repetido e falhas; ambos os projetos os consomem pelo fluxo de bundle existente.
- [ ] Definir autenticação e imagem, IDs compartilhados, limpeza de assinatura e ausência de replay após desconexão/revogação.
- [ ] Especificar compatibilidade com Home antigo e detecção de suporte. Preferir adição ao protocolo 2; se uma quebra for necessária, documentar revisão e negociação antes de 05/06.
- [ ] Registrar o contrato e a política de áudio escolhida sem declarar aceitação física integrada, ainda pendente do ticket 07.

## Comments

**2026-10-27 — Contrato implementado.** [Protocolo](../../../protocol/README.md) e oito exemplos `playback*` definem assinatura/cancelamento, retrato com revisão/instante, play/pause com alvo e item, ausência e metadados opcionais. Resposta de sucesso é retrato observado, não ACK de despacho. Capacidades são por estado (Netflix); ações opcionais ficam fora do escopo. Exemplos consumidos nos testes JVM pelo bundle local. Protocolo 2 aditivo; Home antigo falha com `unknown-request`. Silêncio/keep é a política experimental com uso básico confirmado nos dois modos; duração e interrupções seguem pendentes.

## Encerramento — 2026-10-27

Revertido a pedido explícito do usuário após limitações de metadados/controles, dependência do áudio auxiliar e falha de ativação ao tentar ocultar o tempo. Nenhuma investigação adicional ou publicação será feita. Documentação e evidências preservadas como histórico. Ver `rollback.md` ao lado da spec.
