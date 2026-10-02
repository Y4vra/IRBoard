# Documents

Documents are files attached to a project — specifications, diagrams, meeting notes, contracts, or anything else that supports a requirement's traceability. Linking a document to a requirement makes it possible to point at the exact piece of supporting material a requirement is based on.

## Viewing documents

Anyone linked to a project can view its non-removed documents from the project's **Documents** view. Each entry shows the file name and the requirements it's linked to. Removed documents are visible to project managers only.

## Uploading a document

Project managers and requirement engineers linked to the project can upload a document:

1. Select **Upload document** from the Documents view.
2. Choose a file from your device.
3. Confirm the upload.

IR-Board stores the file name and MIME type alongside the file content, and the new document appears in the project's document list.

## Linking documents to requirements

Documents are linked to requirements the same way stakeholders are: from a requirement's detail view, open the linking dialog and select one or more documents from the same project. Linked documents appear as clickable entries on the requirement's detail view, and navigating from a document's own detail view shows every requirement referencing it.

As with stakeholders, the delete/unlink action for a document–requirement relationship only appears on the **requirement's** side.

## Updating, disabling, and removing

Project managers and requirement engineers can:

- **Update** a document (for example, replacing it with a newer version). This flags any linked requirements as pending review, since the material they reference has changed.
- **Disable** a document, flagging linked requirements as pending review.
- **Enable** a previously disabled document, also flagging linked requirements as pending review.
- **Remove** a disabled document — this unlinks it from any requirements still connected to it and flags them as pending review.

Only a project manager can **permanently delete** a removed document.

!!! note "Current implementation detail"
    Document uploads and downloads are currently routed through the backend service rather than transferred directly between the browser and the object storage backend via presigned URLs. This works correctly today but adds avoidable load to the backend for large files — see [Architecture › Backend](../architecture/backend.md) for more on this and other known trade-offs.