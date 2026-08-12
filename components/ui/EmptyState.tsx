import { AlertCircle } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="min-h-96 flex flex-col items-center justify-center py-12">
      {icon ? (
        <div className="mb-4 text-slate-300">{icon}</div>
      ) : (
        <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
      )}
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 max-w-md text-center mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
