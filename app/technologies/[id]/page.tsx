"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";

interface TechnologyDetail {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  relatedTechnologies: Array<{ id: string; name: string; category: string | null }>;
  relevantRoles: Array<{ id: string; name: string; level: string | null }>;
}

export default function TechnologyDetailPage() {
  const params = useParams();
  const techId = params.id as string;

  const [technology, setTechnology] = useState<TechnologyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTechnology = async () => {
      try {
        const response = await fetch(`/api/technologies/${techId}`);
        if (!response.ok) throw new Error("Failed to fetch technology");
        const data = await response.json();
        setTechnology(data.data);
      } catch (err) {
        console.error("Error fetching technology:", err);
        setError("Failed to load technology details");
      } finally {
        setLoading(false);
      }
    };

    fetchTechnology();
  }, [techId]);

  if (loading) {
    return <LoadingState title="Loading technology details..." />;
  }

  if (error || !technology) {
    return <ErrorState title="Technology not found" message={error || "Unable to load technology details"} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-slate-100 py-12 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{technology.name}</h1>
          {technology.category && (
            <p className="text-lg text-slate-600">{technology.category}</p>
          )}

          {technology.description && (
            <p className="text-lg text-slate-700 mt-6 max-w-3xl">{technology.description}</p>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Related Technologies */}
            {technology.relatedTechnologies.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Technologies</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {technology.relatedTechnologies.map((tech) => (
                    <Link
                      key={tech.id}
                      href={`/technologies/${tech.id}`}
                      className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all group"
                    >
                      <p className="font-semibold text-slate-900 group-hover:text-slate-700">
                        {tech.name}
                      </p>
                      {tech.category && (
                        <p className="text-sm text-slate-600 mt-1">{tech.category}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Relevant Roles */}
            {technology.relevantRoles.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Relevant Roles</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {technology.relevantRoles.map((role) => (
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="border border-slate-200 rounded-lg p-6 bg-slate-50">
              <h3 className="font-semibold text-slate-900 mb-4">At a Glance</h3>
              <div className="space-y-4">
                {technology.category && (
                  <div>
                    <p className="text-xs text-slate-600 uppercase font-semibold mb-1">
                      Category
                    </p>
                    <p className="font-semibold text-slate-900">{technology.category}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-600 uppercase font-semibold mb-1">
                    Related Tech
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {technology.relatedTechnologies.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase font-semibold mb-1">
                    Roles Using This
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {technology.relevantRoles.length}
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
