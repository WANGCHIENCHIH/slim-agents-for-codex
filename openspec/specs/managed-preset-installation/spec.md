# managed-preset-installation Specification

## Purpose

Defines how managed preset installation and preset switching commit validated state, recover from caught failures, preserve user-owned files, and report whether rollback completed.

## Requirements

### Requirement: Preview drift prevents mutation

The installer SHALL revalidate the previewed config and package-managed agent and Skill state immediately before the first live mutation. If that state has changed, the installer SHALL fail without creating or changing config, agent, Skill, backup, archive, or temporary installation paths.

#### Scenario: Config changes after preview

- **WHEN** config content differs from the content observed during preview before installation begins
- **THEN** installation fails before the first mutation and all installation paths remain unchanged

#### Scenario: Managed path changes after preview

- **WHEN** a package-managed agent or Skill path differs from the state observed during preview before installation begins
- **THEN** installation fails before the first mutation and all installation paths remain unchanged

### Requirement: Successful installation is validated

The installer SHALL treat install and preset switch as committed only after the resulting managed config, agents, and Skills pass the same installed-preset validation used by the public validate command.

#### Scenario: Install passes validation

- **WHEN** every live mutation completes and the resulting managed installation passes validation
- **THEN** the CLI reports installation success and returns exit code 0

#### Scenario: Preset switch passes validation

- **WHEN** a preset switch completes and the resulting managed installation passes validation
- **THEN** the CLI reports the resolved Preset ID as installed and returns exit code 0

#### Scenario: Post-apply validation fails

- **WHEN** live mutations complete but installed-preset validation fails
- **THEN** the failure remains inside the rollback window and the installer attempts scoped restoration

### Requirement: Caught failures trigger scoped restoration

For a filesystem or validation failure caught by the running install process, the installer SHALL restore the exact pre-apply config bytes or remove a config newly created by the failed attempt. It SHALL restore or remove only package-managed agent files and package-managed Skill directories, and SHALL preserve unrelated agents, Skills, and sibling files.

#### Scenario: Failure after agents and Skills change

- **WHEN** a caught failure occurs after managed agents and Skills have been changed
- **THEN** the installer restores the prior managed config, agent, and Skill state and preserves unrelated entries

#### Scenario: Failed fresh install created managed paths

- **WHEN** a caught failure occurs during a fresh install with no prior managed config, agent, or Skill path
- **THEN** the installer removes the managed live paths created by the failed attempt without removing unrelated paths

#### Scenario: Rollback completes

- **WHEN** every required restoration and restoration verification succeeds
- **THEN** the installer reports rollback complete and does not report installation success

### Requirement: Rollback attempts every independent restoration

The installer SHALL continue attempting independent config, agent, Skill, and temporary-file restoration after any one restoration fails. It SHALL retain the original install failure and every rollback failure, and SHALL NOT claim that the prior managed state was restored when any required restoration or verification fails.

#### Scenario: One agent restoration fails

- **WHEN** restoring one managed agent fails and other managed paths remain independently restorable
- **THEN** the installer attempts all other restorations and reports rollback incomplete with both the original failure and the failed restoration category

#### Scenario: Multiple restorations fail

- **WHEN** more than one independent restoration or verification fails
- **THEN** every failure is retained in the rollback-incomplete result

### Requirement: Recovery evidence is retained

The installer SHALL retain backup and archive artifacts created for a failed attempt whether rollback completes or remains incomplete. It SHALL attempt to remove temporary commit files, and a temporary-file cleanup failure SHALL make rollback incomplete.

#### Scenario: Rollback completes with recovery artifacts

- **WHEN** a failed installation is fully restored and verified
- **THEN** existing backup and archive artifacts remain available and temporary commit files are absent

#### Scenario: Temporary cleanup fails

- **WHEN** a temporary commit file cannot be removed during rollback
- **THEN** the CLI reports rollback incomplete and identifies temporary state as unresolved

### Requirement: CLI distinguishes rollback outcomes

A failed install or preset switch SHALL return exit code 1 and report either rollback complete or rollback incomplete. The failure output SHALL include a controlled failure reason and only recovery artifact paths that exist. Rollback-incomplete output SHALL identify unresolved package-managed categories. Neither outcome SHALL print the normal installation success line or expose unrelated filesystem paths.

#### Scenario: Complete rollback is reported

- **WHEN** installation fails and scoped restoration is verified
- **THEN** the CLI reports rollback complete, the controlled failure reason, and available recovery artifacts with exit code 1

#### Scenario: Incomplete rollback is reported

- **WHEN** installation fails and any required restoration or verification fails
- **THEN** the CLI reports rollback incomplete, unresolved managed categories, the controlled original and rollback failures, and available recovery artifacts with exit code 1

### Requirement: Rollback guarantee has a single-writer process scope

The automatic rollback guarantee SHALL apply to caught failures within one running install or preset-switch process under a single-writer contract. The installer SHALL NOT claim crash, power-loss, forced-termination, or concurrent-writer recovery.

#### Scenario: Process catches a filesystem failure

- **WHEN** the running process catches an installation filesystem failure and no concurrent writer changes the managed state
- **THEN** the installer applies the scoped rollback contract

#### Scenario: Unsupported failure model

- **WHEN** the process is terminated, power is lost, or another writer changes managed state during mutation
- **THEN** the CLI does not claim the automatic rollback guarantee covers that event
