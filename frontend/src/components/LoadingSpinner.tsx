import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner = ({text = "Loading..."}: LoadingSpinnerProps) => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      <span className="ml-2 text-lg font-medium">{text}</span>
    </div>
  );
};

export default LoadingSpinner;