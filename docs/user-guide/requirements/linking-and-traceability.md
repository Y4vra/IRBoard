# Linking and Traceability

IR-Board tracks relationships between requirements, stakeholders, and documents explicitly, so you can answer questions like "why does this requirement exist" or "what depends on this document" without digging through external notes.

## Linking a requirement to other entities

From a requirement's detail view, open the linking dialog to connect it to:

- One or more **stakeholders** in the same project (see [Stakeholders](../stakeholders.md)).
- One or more **documents** in the same project (see [Documents](../documents.md)).
- One or more **other requirements**, including requirements in different functionalities — this is how horizontal, cross-cutting relationships between requirements are expressed, independent of the parent/child nesting described in [Functional Requirements](functional-requirements.md).

Once linked, each associated element appears as a clickable entry on the requirement's detail view. Selecting it navigates directly to that element's own detail page, making it quick to move between related requirements, stakeholders, and documents without returning to a list view each time.

## Removing a link

The delete/unlink action only appears on the **requirement's** side of a relationship. A stakeholder or document doesn't offer its own option to remove the link — it can only be removed from the requirement that references it.

## Finding something by its identity slug

Every traceable entity (requirements, stakeholders, documents, functionalities) carries a stable **identity slug** — a unique, internal identifier distinct from the human-readable dynamic identifier used for functional requirements.

To jump directly to an entity:

1. Open the navigation bar's search field.
2. Enter the full identity slug.
3. IR-Board performs an exact lexical match and, if you have access to the matched entity, takes you straight to its detail view.

If no entity matches, or you don't have access to the one that does, you'll see a "no results" message rather than any indication that a restricted entity exists — this is deliberate, so the search can't be used to probe for entities you shouldn't know about.

!!! tip
    The identity slug is shown next to the entity's name on its detail view. If you're not sure what a slug looks like, open any requirement's detail page and look just below the title.

## Why this matters

Linking and slug-based lookup are what make traceability practical rather than theoretical: a requirement's detail view becomes a hub you can navigate outward from, in any direction, rather than a dead-end record you have to search around separately.