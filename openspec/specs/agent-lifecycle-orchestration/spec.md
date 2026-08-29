# Agent Lifecycle Orchestration Specification

## Purpose

Defines how a Slim Codex orchestrator supervises specialist agents without duplicating work, fabricating acknowledgement, losing partial edits, or silently dropping required review and validation.

## Requirements

### Requirement: Orchestrator inspects and waits without starting duplicate work
The Orchestrator SHALL use Codex's read-only agent status and event-driven wait capabilities to supervise required specialist lanes. A non-terminal, uncertain, or terminal-but-unreconciled observation MUST NOT be treated as permission to dispatch the same objective again, and the Orchestrator MUST NOT repeatedly poll when it can wait for an agent update.

#### Scenario: Required specialist is still running
- **WHEN** a required specialist lane has not produced a terminal result
- **THEN** the Orchestrator inspects it with `list_agents` or waits with `wait_agent` without starting a duplicate specialist turn

#### Scenario: Status is uncertain
- **WHEN** the available status does not prove that a required specialist is terminal
- **THEN** the Orchestrator keeps the lane unresolved and does not claim completion

#### Scenario: Terminal result has not been reconciled
- **WHEN** a specialist has reached a terminal state but its result, findings, or shared-worktree effects have not been reconciled
- **THEN** the Orchestrator keeps that objective unresolved and does not dispatch the same work again

#### Scenario: Reconciled result leaves approved work unresolved
- **WHEN** the Orchestrator has reconciled the terminal result and the approved objective still requires work
- **THEN** the Orchestrator MAY continue the retained specialist or dispatch a clearly scoped replacement according to the existing lifecycle controls

### Requirement: Live messages use conservative acknowledgement semantics
The Orchestrator SHALL use `send_message` for a concise, non-triggering communication to an existing specialist when the current objective remains valid. Successful delivery SHALL mean only that the message was accepted for delivery; it MUST NOT be reported as proof that the specialist read, acknowledged, or acted on it.

#### Scenario: Additive guidance is sent to a running specialist
- **WHEN** a running specialist needs concise guidance that does not replace its current objective
- **THEN** the Orchestrator sends the guidance with `send_message` and reports only that the message was sent

### Requirement: Interruption is bounded and does not imply rollback
The Orchestrator SHALL use `interrupt_agent` only when the user requests interruption or when the active lane is obsolete, wrong, or conflicts with a safer replacement. After interruption, the Orchestrator MUST inspect and reconcile any partial artifact or worktree changes before resuming the agent or launching replacement work.

#### Scenario: Writer lane becomes obsolete
- **WHEN** a running writer's objective is replaced and continuing it would conflict with the accepted direction
- **THEN** the Orchestrator interrupts that lane and reconciles its partial changes before any replacement writer starts

#### Scenario: User requests interruption
- **WHEN** the user explicitly asks to stop a running specialist
- **THEN** the Orchestrator interrupts it without claiming that its partial changes were rolled back

### Requirement: Existing specialist context is resumed deliberately
The Orchestrator SHALL use `followup_task` when an existing idle or interrupted specialist should continue with retained context. It MUST NOT treat a follow-up dispatch as completion, and it SHALL create a replacement specialist only when the retained specialist is unsuitable or unavailable.

#### Scenario: Interrupted specialist should continue
- **WHEN** an interrupted specialist retains useful context and the accepted objective can continue safely
- **THEN** the Orchestrator resumes that specialist with a bounded `followup_task` instead of creating a duplicate lane

### Requirement: Required review and validation survive cancellation
Interrupting or replacing a specialist generation MUST NOT remove any review, validation, or acceptance obligation attached to its lane. The Orchestrator SHALL resume the obligation with the retained specialist or assign it to a clearly scoped replacement before closing the subtree.

#### Scenario: Review specialist is interrupted
- **WHEN** a required review lane is interrupted before producing an acceptable result
- **THEN** the Orchestrator resumes or replaces the review lane and keeps the review obligation unresolved until a terminal result is reconciled

### Requirement: All required lanes are reconciled before completion
The Orchestrator SHALL wait for every required specialist lane to become terminal, reconcile writer changes and specialist findings, and report failures or skipped work accurately before declaring its assigned subtree complete.

#### Scenario: One required lane remains unresolved
- **WHEN** at least one required specialist lane is still running, uncertain, interrupted without replacement, or otherwise unreconciled
- **THEN** the Orchestrator does not declare its assigned subtree complete
