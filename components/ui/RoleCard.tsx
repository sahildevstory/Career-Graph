import Link from "next/link";
import { ChevronRight } from "lucide-react";
import MatchScore from "./MatchScore";

interface RoleCardProps {
  id: string;
  name: string;
  level?: string | null;
  matchPercentage?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  technologies?: string[];
  description?: string | null;
}

export default function RoleCard({
  id,
  name,
  level,
  matchPercentage,
  matchedSkills = [],
  missingSkills = [],
  technologies = [],
  description,
}: RoleCardProps) {
  return (
    <Link href={`/roles/${id}`}>
      <div className="group bg-white rounded-lg border border-slate-100 p-6 hover:border-slate-300 hover:shadow-lg transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
              {name}
            </h3>
            {level && <p className="text-sm text-slate-600 mt-1">{level}</p>}
          </div>
          {matchPercentage !== undefined && (
            <div className="flex-shrink-0 ml-4">
              <MatchScore percentage={matchPercentage} size="md" showLabel={true} />
            </div>
          )}
        </div>

        {description && (
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">{description}</p>
        )}

        {(matchedSkills.length > 0 || missingSkills.length > 0) && (
          <div className="mb-4">
            {matchedSkills.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-slate-600 font-medium mb-1">Matched:</p>
                <div className="flex flex-wrap gap-1">
                  {matchedSkills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs rounded"
                    >
                      {skill}
                    </span>
                  ))}
                  {matchedSkills.length > 3 && (
                    <span className="text-xs text-slate-500">
                      +{matchedSkills.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
            {missingSkills.length > 0 && (
              <div>
                <p className="text-xs text-slate-600 font-medium mb-1">Missing:</p>
                <div className="flex flex-wrap gap-1">
                  {missingSkills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="inline-block px-2 py-1 bg-slate-50 text-slate-700 text-xs rounded"
                    >
                      {skill}
                    </span>
                  ))}
                  {missingSkills.length > 3 && (
                    <span className="text-xs text-slate-500">
                      +{missingSkills.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {technologies.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-slate-600 font-medium mb-2">Technologies:</p>
            <div className="flex flex-wrap gap-1">
              {technologies.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="inline-block px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded"
                >
                  {tech}
                </span>
              ))}
              {technologies.length > 4 && (
                <span className="text-xs text-slate-500">
                  +{technologies.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center text-slate-600 group-hover:text-slate-900 transition-colors">
          <span className="text-sm font-medium">View Details</span>
          <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
