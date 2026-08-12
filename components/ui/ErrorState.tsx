import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = "Connection Error",
  message = "CareerGraph couldn't connect to the graph. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="min-h-96 flex flex-col items-center justify-center py-12 px-4">
      <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 max-w-md text-center mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
