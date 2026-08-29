## MODIFIED Requirements

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
