import { X } from "lucide-react";

interface SkillChipProps {
  label: string;
  onRemove?: () => void;
  selected?: boolean;
  onClick?: () => void;
}

export default function SkillChip({
  label,
  onRemove,
  selected = false,
  onClick,
}: SkillChipProps) {
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${
        selected
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 cursor-pointer"
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-0 hover:opacity-70 transition-opacity"
          aria-label={`Remove ${label}`}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
