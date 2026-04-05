import { Loader2 } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      {/* El animate-spin es la clase de Tailwind que hace que gire */}
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      <span className="ml-2 text-lg font-medium">Cargando sesión...</span>
    </div>
  );
};

export default LoadingSpinner;