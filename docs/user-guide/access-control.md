# Access Control

IR-Board uses a **relation-based** permission model rather than a fixed set of system-wide roles. What you can do depends on your relationship to a specific project or functionality — not on a single global label attached to your account.

For the underlying design, see [Architecture › Security](../architecture/security/index.md).

## System-level permissions

At the system level, a user is either an **admin** or a regular (**basic**) user.

| Level | Can do |
|---|---|
| **Admin** | Create and deactivate projects, purge removed projects, invite new users, and link users to a project as project manager. |
| **Basic** | Manage their own profile. Everything else depends on project-level relationships. |

Being an admin does **not** automatically grant access to a project's contents — under the platform's Zero-Trust model, even a project's creator needs an explicit project-level relationship (typically as project manager) to modify it.

## Project-level permissions

Within a project, access is granted per relationship:

| Role | Can do |
|---|---|
| **Project Manager** | Add, edit, and disable functionalities; manage requirements within those functionalities; manage documents; link other users to the project. |
| **Requirement Engineer** | Linked to a specific functionality. Can add, modify, and disable requirements within that functionality, and work with documents linked to the project. |
| **Stakeholder user** | Linked to a specific functionality. Read-only access to that functionality's requirements and to the project's documents. |

If a user holds more than one relationship to the same functionality (for example, both requirement engineer and stakeholder), the **higher-level permission applies**. Being both a requirement engineer and a stakeholder on the same functionality means you get full requirement-engineer access — the two roles don't limit each other.

## Inviting and managing users

Only administrators can invite new users. From **User Management**:

1. Select **Invite new user**.
2. Enter the new user's name, surname, and email address.
3. Confirm the invitation.

IR-Board generates a one-time signup code and emails it to the address provided. The new user follows the steps in [Getting Started](getting-started.md#signing-in) to activate their account and set a permanent password.

Administrators can also:

- View or modify a user's name and surname.
- View a user's current permissions.
- Regenerate an invite/signup code if the original wasn't delivered or has expired.
- Remove a user from the system — this also clears their access-control relationships.

## Linking users to a project

- An **admin** links a user to a project as **project manager**.
- A **project manager** links users to individual **functionalities** as requirement engineer or stakeholder — scoping their access to just that functionality rather than the whole project.

The person who creates a project is automatically linked to it as project manager, so you're never locked out of something you just created.

## What the frontend does with this

The interface doesn't infer what you can do from a role name — it reads explicit permission fields returned by the backend for each project and functionality, and shows or hides actions accordingly. If a button you expect to see is missing, it usually means the corresponding relationship hasn't been granted yet rather than a bug — check with your project manager or administrator.