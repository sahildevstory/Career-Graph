"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";

interface SkillDetail {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  relatedSkills: Array<{ id: string; name: string; category: string | null }>;
  leadingRoles: Array<{ id: string; name: string; level: string | null }>;
}

export default function SkillDetailPage() {
  const params = useParams();
  const skillId = params.id as string;

  const [skill, setSkill] = useState<SkillDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkill = async () => {
      try {
        const response = await fetch(`/api/skills/${skillId}`);
        if (!response.ok) throw new Error("Failed to fetch skill");
        const data = await response.json();
        setSkill(data.data);
      } catch (err) {
        console.error("Error fetching skill:", err);
        setError("Failed to load skill details");
      } finally {
        setLoading(false);
      }
    };

    fetchSkill();
  }, [skillId]);

  if (loading) {
    return <LoadingState title="Loading skill details..." />;
  }

  if (error || !skill) {
    return <ErrorState title="Skill not found" message={error || "Unable to load skill details"} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-slate-100 py-12 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{skill.name}</h1>
          {skill.category && (
            <p className="text-lg text-slate-600 mb-6">{skill.category}</p>
          )}

          {skill.description && (
            <p className="text-lg text-slate-700 max-w-3xl">{skill.description}</p>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Related Skills */}
            {skill.relatedSkills.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Skills</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {skill.relatedSkills.map((relSkill) => (
                    <Link
                      key={relSkill.id}
                      href={`/skills/${relSkill.id}`}
                      className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all group"
                    >
                      <p className="font-semibold text-slate-900 group-hover:text-slate-700">
                        {relSkill.name}
                      </p>
                      {relSkill.category && (
                        <p className="text-sm text-slate-600 mt-1">{relSkill.category}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Career Roles */}
            {skill.leadingRoles.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Roles That Value This Skill</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {skill.leadingRoles.map((role) => (
                    <Link
                      key={role.id}
                      href={`/roles/${role.id}`}
                      className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all group"
                    >
                      <p className="font-semibold text-slate-900 group-hover:text-slate-700">
                        {role.name}
                      </p>
                      {role.level && (
                        <p className="text-sm text-slate-600 mt-1">{role.level}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Learning Resources Section */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">How to Learn {skill.name}</h2>
              <div className="space-y-4">
                <div className="p-6 border border-slate-200 rounded-lg bg-slate-50">
                  <h3 className="font-semibold text-slate-900 mb-2">Getting Started</h3>
                  <p className="text-slate-700">
                    Start with the fundamentals. Look for beginner-friendly resources, tutorials, and documentation to build a strong foundation.
                  </p>
                </div>

                <div className="p-6 border border-slate-200 rounded-lg bg-slate-50">
                  <h3 className="font-semibold text-slate-900 mb-2">Practice</h3>
                  <p className="text-slate-700">
                    Build projects to solidify your understanding. Contributing to open source projects is an excellent way to gain real-world experience.
                  </p>
                </div>

                <div className="p-6 border border-slate-200 rounded-lg bg-slate-50">
                  <h3 className="font-semibold text-slate-900 mb-2">Mastery</h3>
                  <p className="text-slate-700">
                    Deepen your expertise through advanced courses, certifications, and mentorship. Stay updated with the latest developments in the field.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="border border-slate-200 rounded-lg p-6 bg-slate-50">
              <h3 className="font-semibold text-slate-900 mb-4">At a Glance</h3>
              <div className="space-y-4">
                {skill.category && (
                  <div>
                    <p className="text-xs text-slate-600 uppercase font-semibold mb-1">
                      Category
                    </p>
                    <p className="font-semibold text-slate-900">{skill.category}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-600 uppercase font-semibold mb-1">
                    Related Skills
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {skill.relatedSkills.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase font-semibold mb-1">
                    Career Roles
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {skill.leadingRoles.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <Link
                href={`/roles?skill=${skillId}`}
                className="block w-full px-4 py-3 text-center bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
              >
                Find Roles
              </Link>
              <Link
                href="/explore"
                className="block w-full px-4 py-3 text-center border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Explore Graph
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
