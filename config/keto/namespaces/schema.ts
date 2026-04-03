import { Namespace, SubjectSet, Context } from "@ory/keto-namespace-types"

class User implements Namespace {}

class System implements Namespace {
  related: {
    admins: User[]
  }

  permits = {
    manageProjects: (ctx: Context) => this.related.admins.includes(ctx.subject),
    inviteUsers: (ctx: Context) => this.related.admins.includes(ctx.subject),
    viewAll: (ctx: Context) => this.related.admins.includes(ctx.subject),
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
    
    view: (ctx: Context) => 
      this.related.managers.includes(ctx.subject) ||
      this.related.parent_system.traverse((s) => s.permits.viewAll(ctx)),
    
    linkManagers: (ctx: Context) => 
      this.related.parent_system.traverse((s) => s.permits.manageProjects(ctx)),

    linkProjectUsers: (ctx: Context) => this.related.managers.includes(ctx.subject)
      
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
      this.related.engineers.includes(ctx.subject) ||
      this.related.project.traverse((p) => p.related.managers.includes(ctx.subject)),

    approveAll: (ctx: Context) =>
      this.related.project.traverse((p) => p.related.managers.includes(ctx.subject))
  }
}
