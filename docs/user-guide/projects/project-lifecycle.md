# Project Lifecycle

A project moves through a small set of well-defined states. Unlike a requirement, a project is never considered permanently "done" — finishing a project doesn't represent an end state, since real projects tend to continue evolving.

| State | Meaning |
|---|---|
| **Active** | The project is currently in progress and fully editable by users linked to it. |
| **Finished** | The project has been implemented. This is not a terminal state — a finished project can still be revisited. |
| **Deactivated** | The project has been cancelled, postponed, or otherwise paused. It isn't finished, but it's not currently in active use either. |
| **Removed** | The project has been archived for removal — effectively a trash bin, kept in case it needs to be restored as a last resort. |

## Deactivating a project

An admin can deactivate an active project:

1. Select the deactivation option on the project.
2. Confirm the action when prompted.

Once deactivated, the project and everything inside it (functionalities, requirements, stakeholders, documents) is placed in **read-only mode**. Nothing is deleted — deactivation is reversible.

## Reactivating a project

An admin can reactivate a deactivated project, restoring normal read/write access to its contents.

## Removing a project

Moving a project to the **Removed** state archives it — it disappears from the default home page view but isn't deleted. This step exists specifically so a project can be recovered if removal turns out to be premature. Permanent deletion of a removed project is a separate, explicit action, reserved for cases where recovery is genuinely no longer needed.

## Why the extra steps

The deactivate → remove → delete progression is deliberate: IR-Board generally favors preserving history and traceability over fast deletion, on the assumption that recovering from an accidental removal is far cheaper than losing a project's requirement history outright. See [Objectives and Scope](../../about/objectives-and-scope.md) for the broader reasoning behind this design choice.