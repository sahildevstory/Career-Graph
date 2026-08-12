interface MatchScoreProps {
  percentage: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function MatchScore({
  percentage,
  size = "md",
  showLabel = true,
}: MatchScoreProps) {
  const radius = size === "sm" ? 20 : size === "lg" ? 30 : 25;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const sizeClass =
    size === "sm"
      ? "w-12 h-12 text-xs"
      : size === "lg"
        ? "w-16 h-16 text-lg"
        : "w-14 h-14 text-sm";

  const getColor = (pct: number) => {
    if (pct >= 90) return "#10b981"; // green
    if (pct >= 75) return "#3b82f6"; // blue
    if (pct >= 50) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  return (
    <div className={`flex items-center justify-center ${sizeClass}`}>
      <div className="relative">
        <svg width={radius * 2 + 8} height={radius * 2 + 8} className="transform -rotate-90">
          <circle
            cx={radius + 4}
            cy={radius + 4}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="2"
          />
          <circle
            cx={radius + 4}
            cy={radius + 4}
            r={radius}
            fill="none"
            stroke={getColor(percentage)}
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300"
          />
        </svg>
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center font-semibold text-slate-900">
            {percentage}%
          </div>
        )}
      </div>
    </div>
  );
}
