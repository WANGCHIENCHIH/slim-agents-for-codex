---
name: slim-goal-loop
description: Coordinate a goal through Council advice, Orchestrator execution, and Root acceptance checks. Use when the user wants these roles to keep working together until a defined goal is verified, including follow-up passes after partial success.
---

# Slim Goal Loop

Run this workflow as the general Root agent. Keep final decisions and acceptance at Root.

## Establish the goal

1. Read the applicable project instructions and existing task state. Capture the goal, observable acceptance criteria, scope, exclusions, and existing authorization. Infer settled details from evidence; ask only about material unresolved choices and continue independent authorized work.
2. Check that the current role permits both coordinators and that their tools and Skills are available. Read [slim-council](../slim-council/SKILL.md) and [slim-orchestration](../slim-orchestration/SKILL.md) before using their workflows. If host permissions or missing capabilities prevent coordination, report the limitation and the available entry point; preserve those restrictions and distinguish unavailable work from completed work.
3. Reuse the project's task record and any existing Orchestrator `.slim/deepwork/<task-slug>.md` ledger. Keep acceptance evidence, decisions, agent IDs, failed attempts, and the next action current; do not create a duplicate tracking system.

## Coordinate each pass

1. Use Council only when material uncertainty or risk needs independent advice. Root supplies the bounded question, evidence, constraints, and eligible read-only expert roster approved under the Council workflow. Council advises; Root decides within existing authorization or obtains the missing user decision. Do not repeat deliberation without new evidence or an unresolved decision.
2. Send the settled, authorized work to Orchestrator with the acceptance criteria, relevant Council outcome, file ownership, dependencies, and required checks. Keep Council and Orchestrator as peer children of Root; neither calls the other. Orchestrator follows its existing five-specialist workflow. Respect host depth and concurrency limits, scheduling sequentially when needed.
3. For new delegations use `fork_turns="none"` and a self-contained assignment. Reuse existing agents with the host's continuation tool (`followup_task` when available); `send_message` alone may not start a new turn. Observe completion before redispatch, and follow the existing orchestration lifecycle instead of spawning duplicate workers or polling repeatedly.
4. Reconcile each returned artifact and check against every acceptance criterion. Inspect the actual user entry point when applicable; task checkboxes and a passing subset of tests are not proof of completion. If a gap remains and authorized work can proceed, send the concrete gap and evidence to Orchestrator for the next pass. Return to Council only for a new material decision.

## Continue or stop

- A batch boundary, status question, or partial success does not end the goal. Continue the next unblocked authorized action and give concise progress updates while working. Preserve scope and unfinished work through context compaction, using any host-required checkpoint format.
- Diagnose failures before retrying. After three failed attempts at the same issue, stop that approach, identify the doubtful assumption and attempted fixes, and report the concrete blocker or decision needed. Continue independent work when possible; do not loop on unchanged evidence.
- Respect explicit pause/cancel requests and host limits. For missing authorization, a material user decision, or a blocker that cannot be resolved autonomously, record what is complete, what remains, and the smallest input or resume action needed. Do not mark blocked or unverified work complete.
- Finish only when all acceptance criteria have supporting evidence, or report the precise stopping condition with a resumable handoff. State the result, checks, and material limitations without implying broader validation.

This Skill adds no permission to commit, push, publish, deploy, or perform other external actions. It guides the current host session; it does not provide a daemon, scheduler, unlimited retries, or automatic wake-up after the host stops.
