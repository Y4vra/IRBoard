import { Namespace, Context } from "@ory/keto-namespace-types"

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
    parent_system: System[]
    functionalities: Functionality[]

    managers: User[]
  }

  permits = {
    editProject: (ctx: Context) =>
      this.related.managers.includes(ctx.subject),
    viewProject: (ctx: Context) =>
      this.related.managers.includes(ctx.subject)||
      this.related.parent_system.traverse((s)=>s.permits.viewAll(ctx)),

    edit: (ctx: Context) =>
      this.related.managers.includes(ctx.subject)||
      this.related.functionalities.traverse((f) => f.permits.edit(ctx)),
    
    view: (ctx: Context) => 
      this.related.parent_system.traverse((s)=>s.permits.viewAll(ctx)) ||
      this.related.managers.includes(ctx.subject) ||
      this.related.functionalities.traverse((f) => f.permits.view(ctx)),
    
    linkManagers: (ctx: Context) => 
      this.related.parent_system.traverse((s)=>s.permits.manageProjects(ctx)),

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
    edit: (ctx: Context) =>
      this.related.engineers.includes(ctx.subject),
    view: (ctx: Context) =>
      this.related.engineers.includes(ctx.subject) || this.related.stakeholders.includes(ctx.subject),
    
    editRequirements: (ctx: Context) =>
      this.permits.edit(ctx) ||
      this.related.project.traverse((p)=>p.permits.editProject(ctx)),

    viewRequirements: (ctx: Context) =>
      this.permits.view(ctx) ||
      this.related.project.traverse((p)=>p.permits.viewProject(ctx)),

    approveAll: (ctx: Context) =>
      this.related.project.traverse((p)=>p.permits.editProject(ctx)),
  }
}
