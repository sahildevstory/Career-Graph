"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Code2 } from "lucide-react";
import { CardGridSkeleton } from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";

interface Technology {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
}

export default function TechnologiesPage() {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTechnologies = async () => {
      try {
        const response = await fetch("/api/technologies");
        if (!response.ok) throw new Error("Failed to fetch technologies");
        const data = await response.json();
        setTechnologies(data.data || []);
      } catch (err) {
        console.error("Error fetching technologies:", err);
        setError("Failed to load technologies");
      } finally {
        setLoading(false);
      }
    };

    fetchTechnologies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <section className="border-b border-slate-100 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-3">Technologies</h1>
          </div>
        </section>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <CardGridSkeleton count={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <section className="border-b border-slate-100 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-3">Technologies</h1>
          </div>
        </section>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ErrorState title="Failed to load technologies" onRetry={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Technologies</h1>
          <p className="text-lg text-slate-600">
            Explore technologies and their role in career development.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {technologies.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {technologies.map((tech) => (
              <Link key={tech.id} href={`/technologies/${tech.id}`}>
                <div className="group bg-white rounded-lg border border-slate-100 p-6 hover:border-slate-300 hover:shadow-lg transition-all h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Code2 size={20} className="text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                        {tech.name}
                      </h3>
                      {tech.category && (
                        <p className="text-sm text-slate-600 mt-1">{tech.category}</p>
                      )}
                    </div>
                  </div>

                  {tech.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {tech.description}
                    </p>
                  )}

                  <div className="flex items-center text-slate-600 group-hover:text-slate-900 transition-colors text-sm font-medium">
                    Learn More →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No technologies found"
            description="Unable to load technology data at this time."
          />
        )}
      </div>
    </div>
  );
}
