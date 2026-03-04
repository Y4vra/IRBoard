import { Namespace, SubjectSet, Context } from "@ory/keto-namespace-types"

class System implements Namespace {
  related: {
    admins: User[]
  }

  permits = {
    manageProjects: (ctx: Context) => this.related.admins.includes(ctx.subject),
    inviteUsers: (ctx: Context) => this.related.admins.includes(ctx.subject),
  }
}

class Project implements Namespace {
  related: {
    managers: User[]
    parent_system: System[]
  }

  permits = {
    edit: (ctx: Context) =>
      this.related.managers.includes(ctx.subject) ||
      this.related.parent_system.traverse((s) => s.permits.manageProjects(ctx)),
    
    linkUsers: (ctx: Context) => this.related.managers.includes(ctx.subject),
    
    viewDashboard: (ctx: Context) => 
      this.related.managers.includes(ctx.subject) ||
      this.related.parent_system.traverse((s) => s.permits.manageProjects(ctx))
  }
}

class Functionality implements Namespace {
  related: {
    project: Project[]
    engineers: User[]
    stakeholders: User[]
  }

  permits = {
    editRequirements: (ctx: Context) =>
      this.related.engineers.includes(ctx.subject) ||
      this.related.project.traverse((p) => p.related.managers.includes(ctx.subject)),

    viewRequirements: (ctx: Context) =>
      this.related.stakeholders.includes(ctx.subject) ||
      this.permits.editRequirements(ctx),

    approveElements: (ctx: Context) =>
      this.related.project.traverse((p) => p.related.managers.includes(ctx.subject))
  }
}

class User implements Namespace {}