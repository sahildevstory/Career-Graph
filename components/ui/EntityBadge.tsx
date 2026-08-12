interface EntityBadgeProps {
  type: "skill" | "technology" | "role" | "company" | "project" | "industry";
  label: string;
}

const typeConfig = {
  skill: { bg: "bg-blue-100", text: "text-blue-900", label: "Skill" },
  technology: { bg: "bg-purple-100", text: "text-purple-900", label: "Tech" },
  role: { bg: "bg-green-100", text: "text-green-900", label: "Role" },
  company: { bg: "bg-slate-100", text: "text-slate-900", label: "Company" },
  project: { bg: "bg-amber-100", text: "text-amber-900", label: "Project" },
  industry: { bg: "bg-rose-100", text: "text-rose-900", label: "Industry" },
};

export default function EntityBadge({ type, label }: EntityBadgeProps) {
  const config = typeConfig[type];
  return (
    <span
      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${config.bg} ${config.text}`}
    >
      {label || config.label}
    </span>
  );
}
