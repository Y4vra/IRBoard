import { useState } from "react";
import {
  Search,
  Folder,
  Users,
  LogOut,
  User,
  LayoutList,
  UsersRound,
  ShieldAlert,
  FileText,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export function NavBar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const projectMatch = pathname.match(/^(\/project\/[^/]+)/);
  const isProjectView = !!projectMatch;
  const projectBasePath = projectMatch?.[1] ?? "";

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="flex flex-col gap-2 w-68 p-3 rounded-2xl border border-slate-200 bg-slate-50 shadow-lg"
    >
      {/* User card — always visible */}
      <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200">
            <User className="h-4 w-4 text-slate-500" />
          </div>
          {open && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800 leading-tight">{user.name}</p>
              <p className="truncate text-xs text-slate-400 mt-0.5">{user.email}</p>
            </div>
          )}
        </div>
        {open && (
          <Link
            to="/logout"
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors shrink-0"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </Link>
        )}
      </div>

      {open && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              placeholder="Search anything..."
              className="w-full pl-9 pr-3 h-10 rounded-xl border border-slate-200 bg-white text-sm placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
            />
          </div>

          <NavItem icon={<Folder className="h-4 w-4" />} label="Projects" to="/projects" active={isProjectView} />

          {isProjectView && (
            <div className="flex flex-col gap-1 pl-2 ml-3 border-l-2 border-indigo-100">
              <NavItem icon={<LayoutList className="h-4 w-4" />} label="Functionalities of the project" to={`${projectBasePath}/functionalities`} />
              <NavItem icon={<UsersRound className="h-4 w-4" />} label="Stakeholders of the project" to={`${projectBasePath}/stakeholders`} />
              <NavItem icon={<ShieldAlert className="h-4 w-4" />} label="Non-Functional requirements" to={`${projectBasePath}/non-functional-requirements`} />
              <NavItem icon={<FileText className="h-4 w-4" />} label="Documents of the project" to={`${projectBasePath}/documents`} />
            </div>
          )}

          {isProjectView && <hr className="border-slate-100 my-0.5" />}

          {user.isAdmin && (
            <NavItem icon={<Users className="h-4 w-4" />} label="User management" to="/admin/users" />
          )}
        </>
      )}
    </div>
  );
}

function NavItem({
  icon,
  label,
  to,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
        active
          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
          : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
      )}
    >
      <span className={cn("shrink-0 transition-colors", active ? "text-indigo-500" : "text-slate-400 group-hover:text-indigo-400")}>
        {icon}
      </span>
      <span className="truncate">{label}</span>
      <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-50 transition-opacity" />
    </Link>
  );
}