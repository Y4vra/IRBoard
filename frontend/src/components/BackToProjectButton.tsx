import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

export function BackToProjectButton({ className, projectId }: { className?:string, projectId: string }) {
  return (
    <Button className={className} asChild variant="ghost" size="sm">
      <Link data-testid="back_to_project" to={`/project/${projectId}`}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Project
      </Link>
    </Button>
  );
}