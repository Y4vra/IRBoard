import { Trash2 } from "lucide-react";

export function RemoveButton({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={loading}
      className="shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
      title="Remove"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}