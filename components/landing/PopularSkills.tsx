"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import EntityBadge from "@/components/ui/EntityBadge";
import { Skeleton } from "@/components/ui/LoadingState";

interface Skill {
  id: string;
  name: string;
  category?: string | null;
}

export default function PopularSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch("/api/search?q=skill");
        if (!response.ok) throw new Error("Failed to fetch skills");
        const data = await response.json();
        // Get first 5 skills that are actually skills
        const populars = (data.data || [])
          .filter((item: Record<string, unknown>) => (item.label as string[])?.includes("Skill"))
          .slice(0, 5);
        setSkills(populars);
      } catch (err) {
        console.error("Error fetching skills:", err);
        // Fall back to popular skills
        setSkills([
          { id: "skill-react", name: "React" },
          { id: "skill-typescript", name: "TypeScript" },
          { id: "skill-python", name: "Python" },
          { id: "skill-aws", name: "AWS" },
          { id: "skill-nodejs", name: "Node.js" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Popular Skills</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Popular Skills</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {skills.map((skill) => (
            <Link
              key={skill.id}
              href={`/skills/${skill.id}`}
              className="group p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              <p className="font-semibold text-slate-900 group-hover:text-slate-700 mb-2">
                {skill.name}
              </p>
              {skill.category && (
                <EntityBadge type="skill" label={skill.category} />
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
