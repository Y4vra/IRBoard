import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { ShieldAlert, ServerCrash, AlertCircle, Home } from "lucide-react";

export default function ErrorPage() {
  const location = useLocation();
  const from = location.state?.from || "/home";
  const errorType = location.state?.errorType || "generic";

  const content = {
    permission: {
      icon: <ShieldAlert className="h-20 w-20" />,
      title: "Access Denied",
      description: "You do not have the necessary permissions to view this resource.",
      color: "text-red-500",
    },
    server: {
      icon: <ServerCrash className="h-20 w-20" />,
      title: "Service Unavailable",
      description: "Our servers are currently unreachable (503). Please try again later.",
      color: "text-orange-500",
    },
    route: {
      icon: <AlertCircle className="h-20 w-20" />,
      title: "Invalid route",
      description: "The page you were trying to reach does not exist (404).",
      color: "text-slate-400",
    },
    generic: {
      icon: <AlertCircle className="h-20 w-20" />,
      title: "Something went wrong",
      description: "An unexpected error occurred. Please try again.",
      color: "text-slate-400",
    },
  };

  const current = content[errorType as keyof typeof content] || content.generic;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className={`p-4 rounded-full bg-slate-50 mb-6 ${current.color}`}>
        {current.icon}
      </div>

      <h1 className="text-4xl font-extrabold text-slate-900 mb-3">
        {current.title}
      </h1>
      
      <p className="text-slate-500 max-w-md mb-8">
        {current.description}
      </p>

      <div className="flex gap-4">
        <Button variant="outline" asChild>
          <Link to={from}>Try Again</Link>
        </Button>
        <Button asChild>
          <Link to="/home" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Return Home
          </Link>
        </Button>
      </div>
    </div>
  );
}