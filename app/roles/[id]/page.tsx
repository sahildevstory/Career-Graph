"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";

interface RoleDetail {
  id: string;
  name: string;
  level: string | null;
  description: string | null;
  requiredSkills: Array<{ id: string; name: string; category: string | null }>;
  technologies: Array<{ id: string; name: string; category: string | null }>;
  companies: Array<{ id: string; name: string; industry: string | null }>;
}

interface SkillGap {
  personId: string;
  personName: string;
  roleId: string;
  roleName: string;
  currentSkills: string[];
  requiredSkills: string[];
  missingSkills: string[];
}

export default function RoleDetailPage() {
  const params = useParams();
  const roleId = params.id as string;

  const [role, setRole] = useState<RoleDetail | null>(null);
  const [skillGap, setSkillGap] = useState<SkillGap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await fetch(`/api/roles/${roleId}`);
        if (!response.ok) throw new Error("Failed to fetch role");
        const data = await response.json();
        setRole(data.data);
      } catch (err) {
        console.error("Error fetching role:", err);
        setError("Failed to load role details");
      } finally {
        setLoading(false);
      }
    };

    const fetchSkillGap = async () => {
      try {
        const personId = "person-alice"; // Example person
        const response = await fetch(`/api/roles/${roleId}/skill-gap?personId=${personId}`);
        if (response.ok) {
          const data = await response.json();
          setSkillGap(data.data);
        }
      } catch (err) {
        console.error("Error fetching skill gap:", err);
      }
    };

    fetchRole();
    fetchSkillGap();
  }, [roleId]);

  if (loading) {
    return <LoadingState title="Loading role details..." />;
  }

  if (error || !role) {
    return <ErrorState title="Role not found" message={error || "Unable to load role details"} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-slate-100 py-12 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">{role.name}</h1>
              {role.level && (
                <p className="text-lg text-slate-600 mb-4">{role.level}</p>
              )}
            </div>
          </div>

          {role.description && (
            <p className="text-lg text-slate-700 max-w-3xl">{role.description}</p>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Career Match */}
            {skillGap && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Career Match</h2>
                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-600 uppercase mb-2">
                        Matched Skills
                      </p>
                      <p className="text-3xl font-bold text-green-600 mb-2">
                        {skillGap.currentSkills.length}
                      </p>
                      <div className="space-y-1">
                        {skillGap.currentSkills.slice(0, 5).map((skill) => (
                          <p key={skill} className="text-sm text-green-700">
                            ✓ {skill}
                          </p>
                        ))}
                        {skillGap.currentSkills.length > 5 && (
                          <p className="text-sm text-slate-600">
                            +{skillGap.currentSkills.length - 5} more
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-600 uppercase mb-2">
                        Missing Skills
                      </p>
                      <p className="text-3xl font-bold text-amber-600 mb-2">
                        {skillGap.missingSkills.length}
                      </p>
                      <div className="space-y-1">
                        {skillGap.missingSkills.slice(0, 5).map((skill) => (
                          <p key={skill} className="text-sm text-amber-700">
                            ○ {skill}
                          </p>
                        ))}
                        {skillGap.missingSkills.length > 5 && (
                          <p className="text-sm text-slate-600">
                            +{skillGap.missingSkills.length - 5} more
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Required Skills */}
            {role.requiredSkills.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Required Skills</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {role.requiredSkills.map((skill) => (
                    <Link
                      key={skill.id}
                      href={`/skills/${skill.id}`}
                      className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                      <p className="font-semibold text-slate-900 group-hover:text-slate-700">
                        {skill.name}
                      </p>
                      {skill.category && (
                        <p className="text-sm text-slate-600 mt-1">{skill.category}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Technologies */}
            {role.technologies.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Technologies</h2>
                <div className="flex flex-wrap gap-3">
                  {role.technologies.map((tech) => (
                    <Link
                      key={tech.id}
                      href={`/technologies/${tech.id}`}
                      className="px-4 py-2 rounded-full border border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-900"
                    >
                      {tech.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Learning Path */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">How you get there</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-900">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Master Core Skills</p>
                    <p className="text-sm text-slate-600">
                      Focus on the fundamentals: React, TypeScript, and modern web development patterns.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center text-slate-400">
                  <ArrowRight className="rotate-90" size={20} />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-purple-900">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Learn Production Technologies</p>
                    <p className="text-sm text-slate-600">
                      Deepen your knowledge: Next.js, state management, and testing frameworks.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center text-slate-400">
                  <ArrowRight className="rotate-90" size={20} />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-green-900">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Land the Role</p>
                    <p className="text-sm text-slate-600">
                      Build projects, contribute to open source, and apply to {role.name} positions.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="border border-slate-200 rounded-lg p-6 bg-slate-50">
              <h3 className="font-semibold text-slate-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-600 uppercase font-semibold mb-1">
                    Required Skills
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {role.requiredSkills.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase font-semibold mb-1">
                    Technologies
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {role.technologies.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase font-semibold mb-1">
                    Companies
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {role.companies.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Companies Hiring */}
            {role.companies.length > 0 && (
              <div className="border border-slate-200 rounded-lg p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Companies Hiring</h3>
                <div className="space-y-3">
                  {role.companies.slice(0, 5).map((company) => (
                    <Link
                      key={company.id}
                      href={`/companies/${company.id}`}
                      className="block p-3 border border-slate-200 rounded hover:bg-slate-50 transition-colors group"
                    >
                      <p className="font-medium text-slate-900 group-hover:text-slate-700">
                        {company.name}
                      </p>
                      {company.industry && (
                        <p className="text-xs text-slate-600 mt-1">{company.industry}</p>
                      )}
                    </Link>
                  ))}
                  {role.companies.length > 5 && (
                    <p className="text-sm text-slate-600 text-center py-2">
                      +{role.companies.length - 5} more
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
