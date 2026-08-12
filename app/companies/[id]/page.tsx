"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";

interface CompanyDetail {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  description: string | null;
  roles: Array<{ id: string; name: string; level: string | null }>;
  technologies: Array<{ id: string; name: string; category: string | null }>;
  requiredSkills: Array<{ id: string; name: string; category: string | null }>;
}

export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = params.id as string;

  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch(`/api/companies/${companyId}`);
        if (!response.ok) throw new Error("Failed to fetch company");
        const data = await response.json();
        setCompany(data.data);
      } catch (err) {
        console.error("Error fetching company:", err);
        setError("Failed to load company details");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId]);

  if (loading) {
    return <LoadingState title="Loading company details..." />;
  }

  if (error || !company) {
    return <ErrorState title="Company not found" message={error || "Unable to load company details"} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-slate-100 py-12 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{company.name}</h1>
          <div className="flex flex-wrap gap-4 mt-4">
            {company.industry && (
              <div>
                <p className="text-sm text-slate-600">Industry</p>
                <p className="font-semibold text-slate-900">{company.industry}</p>
              </div>
            )}
            {company.size && (
              <div>
                <p className="text-sm text-slate-600">Company Size</p>
                <p className="font-semibold text-slate-900">{company.size}</p>
              </div>
            )}
          </div>

          {company.description && (
            <p className="text-lg text-slate-700 mt-6 max-w-3xl">{company.description}</p>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Open Roles */}
            {company.roles.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Open Roles</h2>
                <div className="space-y-3">
                  {company.roles.map((role) => (
                    <Link
                      key={role.id}
                      href={`/roles/${role.id}`}
                      className="block p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all group"
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

            {/* Technologies */}
            {company.technologies.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Technologies Used</h2>
                <div className="flex flex-wrap gap-3">
                  {company.technologies.map((tech) => (
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

            {/* Required Skills */}
            {company.requiredSkills.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Key Skills</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {company.requiredSkills.slice(0, 10).map((skill) => (
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="border border-slate-200 rounded-lg p-6 bg-slate-50">
              <h3 className="font-semibold text-slate-900 mb-4">At a Glance</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-600 uppercase font-semibold mb-1">
                    Open Roles
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {company.roles.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase font-semibold mb-1">
                    Technologies
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {company.technologies.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase font-semibold mb-1">
                    Key Skills
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {company.requiredSkills.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
