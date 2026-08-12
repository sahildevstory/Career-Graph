"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/LoadingState";

interface Role {
  id: string;
  name: string;
  level?: string | null;
}

export default function PopularRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch("/api/roles");
        if (!response.ok) throw new Error("Failed to fetch roles");
        const data = await response.json();
        setRoles((data.data || []).slice(0, 4));
      } catch (err) {
        console.error("Error fetching roles:", err);
        // Fall back to popular roles
        setRoles([
          { id: "role-frontend-engineer", name: "Frontend Engineer", level: "Mid-level" },
          {
            id: "role-full-stack-developer",
            name: "Full Stack Developer",
            level: "Senior",
          },
          { id: "role-software-engineer", name: "Software Engineer", level: "Mid-level" },
          { id: "role-backend-engineer", name: "Backend Engineer", level: "Senior" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-slate-50 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Popular Roles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Popular Roles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((role) => (
            <Link
              key={role.id}
              href={`/roles/${role.id}`}
              className="group p-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all"
            >
              <p className="font-semibold text-slate-900 group-hover:text-slate-700 mb-2">
                {role.name}
              </p>
              {role.level && (
                <p className="text-sm text-slate-600 group-hover:text-slate-700">
                  {role.level}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
