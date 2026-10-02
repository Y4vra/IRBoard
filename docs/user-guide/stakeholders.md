# Stakeholders

A **stakeholder** represents a person, group, or organization with an interest in a project — an end user, sponsor, department, or anyone else whose needs shape what the system must do. Tracking stakeholders alongside requirements is what makes traceability between "who asked for this" and "what was built" possible.

## Viewing stakeholders

Anyone linked to a project can view its stakeholders from the project's **Stakeholders** view (reachable from the project-scoped navigation bar). The list shows:

- The stakeholder's identifier and name
- Part of the description
- Whether the stakeholder is flagged as **pending review** (raised automatically when something it's linked to changes)

Selecting a stakeholder opens its detail view, showing every attribute and every requirement it's linked to.

By default, deactivated stakeholders are hidden from the main list. Use the filter toggle at the top of the view to show them. Removed stakeholders are only visible to project managers.

## Adding a stakeholder

Project managers and requirement engineers can add a stakeholder to a project they're linked to.

1. Open the **Add stakeholder** dialog from the Stakeholders view.
2. Enter a **name** and **description** — both are required.
3. Confirm.

IR-Board generates a unique identifier for the stakeholder automatically.

## Linking a stakeholder to requirements

From a requirement's detail view, open the linking dialog to associate it with one or more stakeholders in the same project. Once linked, the stakeholder appears as a clickable entry on the requirement's detail view — selecting it navigates straight to the stakeholder's own detail page, and the reverse works too: from a stakeholder's detail view you can see every requirement it's linked to.

To remove a link, use the delete icon next to the linked stakeholder on the **requirement's** side of the relationship. A stakeholder's own detail view doesn't offer a way to remove the link — it can only be done from the requirement that references it.

Linking or modifying a stakeholder flags every requirement observing it as **pending review**, so nothing gets silently out of sync.

## Modifying, deactivating, and removing

Project managers and requirement engineers linked to the project can:

- **Modify** a stakeholder that isn't deactivated or removed. Saving changes flags linked requirements as pending review.
- **Deactivate** a stakeholder, putting it in read-only mode and flagging linked entities as pending review.
- **Enable** a previously deactivated stakeholder — this also flags linked entities as pending review, since the underlying stakeholder may have changed while inactive.

Only a project manager can:

- **Remove** a deactivated stakeholder (unlinking it from any requirements it was still connected to).
- **Permanently delete** a removed stakeholder.

Removal and deletion are separate, deliberate steps — a removed stakeholder is archived, not gone, until it's explicitly deleted.