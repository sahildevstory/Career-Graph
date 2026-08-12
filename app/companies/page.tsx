"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { CardGridSkeleton } from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";

interface Company {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  description: string | null;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch("/api/companies");
        if (!response.ok) throw new Error("Failed to fetch companies");
        const data = await response.json();
        setCompanies(data.data || []);
      } catch (err) {
        console.error("Error fetching companies:", err);
        setError("Failed to load companies");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <section className="border-b border-slate-100 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-3">Companies</h1>
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
            <h1 className="text-4xl font-bold text-slate-900 mb-3">Companies</h1>
          </div>
        </section>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ErrorState title="Failed to load companies" onRetry={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Discover Companies</h1>
          <p className="text-lg text-slate-600">
            Explore companies and the roles they&apos;re hiring for.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {companies.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <Link key={company.id} href={`/companies/${company.id}`}>
                <div className="group bg-white rounded-lg border border-slate-100 p-6 hover:border-slate-300 hover:shadow-lg transition-all h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                        {company.name}
                      </h3>
                      {company.industry && (
                        <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                          <Briefcase size={14} />
                          {company.industry}
                        </p>
                      )}
                    </div>
                  </div>

                  {company.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                      {company.description}
                    </p>
                  )}

                  {company.size && (
                    <p className="text-xs text-slate-500 mb-4">Size: {company.size}</p>
                  )}

                  <div className="flex items-center text-slate-600 group-hover:text-slate-900 transition-colors text-sm font-medium">
                    View Details →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No companies found"
            description="Unable to load company data at this time."
          />
        )}
      </div>
    </div>
  );
}
