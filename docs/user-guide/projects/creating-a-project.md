# Creating a Project

Project creation is an admin-level action — see [Access Control](../access-control.md) for who can do what.

## Steps

1. From the home page, select **New Project**.
2. Enter a **name** and a **description** — both are required.
3. Optionally, choose a **priority style** for the functional requirements that will be created in this project:
    - **Ternary** — High, Medium, Low (the default if none is selected).
    - **MOSCOW** — Must, Should, Could, Won't have.
4. Confirm.

The project is created in the **Active** state and appears on the home page. You're automatically linked to it as project manager, so you don't need a separate step to gain access to what you just created.

!!! note
    The priority style is set once at project creation and applies to every functional requirement created afterward — see [Requirements › Functional Requirements](../requirements/functional-requirements.md) for how it's used.

## The project dashboard

Selecting a project from the home page opens its dashboard. A newly created project starts empty; as functionalities, requirements, stakeholders, and documents are added, the dashboard's statistics section — toward the bottom of the page — fills in with a breakdown of requirement states across the project.

Deactivated or removed entities are excluded from these statistics.

## Linking other users

Only an admin can link additional users to a project as project manager, from the project view's user-linking dialog. A project manager, in turn, can link users to individual functionalities — see [Access Control](../access-control.md) for the full permission model.