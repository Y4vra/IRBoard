import { useState, useEffect, useRef } from "react";
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
  MoreHorizontal,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export function NavBar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [finishedOpening, setFinishedOpening] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let openingTimeout: ReturnType<typeof setTimeout>;
    
    if (open) {
      openingTimeout = setTimeout(() => setFinishedOpening(true), 300);
    } 
    
    return () => {
      clearTimeout(openingTimeout);
    };
  }, [open]);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
      setFinishedOpening(false);
    }, 200);
  };

  if (!user) return null;

  const projectMatch = pathname.match(/^(\/project\/[^/]+)/);
  const isProjectView = !!projectMatch;
  const projectBasePath = projectMatch?.[1] ?? "";

  return (
    <div
      className="fixed top-4 left-4 z-50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={cn(
          "flex flex-col border border-slate-200 bg-slate-50/90 backdrop-blur-sm shadow-xl transition-all duration-300 ease-in-out overflow-hidden",
          open 
            ? "w-72 h-auto p-3 rounded-2xl gap-2" 
            : "w-16 h-16 p-0 rounded-xl justify-center items-center gap-0"
        )}
      >
        <div className={cn(
          "flex items-center transition-all duration-300 relative",
          open 
            ? "w-full p-1 justify-between rounded-xl border border-slate-200 bg-white" 
            : "w-full justify-center border-none bg-transparent"
        )}>
          <Link
            to={finishedOpening ? "/profile" : "#"}
            className={cn(
              "flex items-center gap-2 min-w-0 transition-all duration-300 flex-1 rounded-lg p-1.5",
              !open && "w-full justify-center",
              open && "hover:bg-slate-50 active:bg-slate-100"
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200">
              {open ? <User className="h-4 w-4 text-slate-500" /> : <MoreHorizontal className="h-5 w-5 text-slate-400" />}
            </div>
            
            {open && (
              <div className="min-w-0 animate-in fade-in slide-in-from-left-2 duration-500">
                <p className="truncate text-sm font-semibold text-slate-800 leading-tight">{user.name}</p>
                <p className="truncate text-xs text-slate-400 mt-0.5">{user.email}</p>
              </div>
            )}
          </Link>

          <button
            onClick={(e) => {
              e.preventDefault();
              logout();
            }}
            className={cn(
                "flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 shrink-0 transition-all duration-500 ease-in-out mr-1",
                open && finishedOpening 
                  ? "opacity-100 translate-x-0 visible" 
                  : "opacity-0 -translate-x-4 invisible pointer-events-none absolute right-3"
            )}
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </button>
        </div>

        <div className={cn(
          "grid transition-all duration-500 ease-in-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}>
          <div className={cn(
            "flex flex-col gap-2 overflow-hidden transition-all duration-500",
            open ? "translate-y-0" : "-translate-y-4"
          )}>
            <div className="relative mt-1 px-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                placeholder="Search anything..."
                disabled={!finishedOpening}
                className="w-full pl-10 pr-3 h-10 rounded-xl border border-slate-200 bg-white text-sm placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
              />
            </div>

            <div className="px-1 flex flex-col gap-2">
              <NavItem icon={<Folder className="h-4 w-4" />} label="Projects" to="/home" active={isProjectView} disabled={!finishedOpening} />

              {isProjectView && (
                <div className="flex flex-col gap-1 pl-2 ml-3 border-l-2 border-indigo-100">
                  <NavItem icon={<LayoutList className="h-4 w-4" />} label="Dashboard" to={`${projectBasePath}`} disabled={!finishedOpening} />
                  <NavItem icon={<UsersRound className="h-4 w-4" />} label="Stakeholders" to={`${projectBasePath}/stakeholders`} disabled={!finishedOpening} />
                  <NavItem icon={<ShieldAlert className="h-4 w-4" />} label="Non-Functional" to={`${projectBasePath}/non-functional-requirements`} disabled={!finishedOpening} />
                  <NavItem icon={<FileText className="h-4 w-4" />} label="Documents" to={`${projectBasePath}/documents`} disabled={!finishedOpening} />
                </div>
              )}

              {isProjectView && <hr className="border-slate-100 my-0.5" />}

              {user.isAdmin && (
                <NavItem icon={<Users className="h-4 w-4" />} label="User management" to="/admin/users" disabled={!finishedOpening} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, to, active, disabled }: { icon: React.ReactNode; label: string; to: string; active?: boolean; disabled?: boolean }) {
  return (
    <Link
      to={disabled ? "#" : to}
      onClick={(e) => disabled && e.preventDefault()}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
        active
          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
          : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700",
        disabled && "cursor-default opacity-50"
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