"use client";

import { useState, useEffect } from "react";
import SkillChip from "@/components/ui/SkillChip";
import RoleCard from "@/components/ui/RoleCard";
import LoadingState, { CardGridSkeleton } from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { Search } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  category?: string | null;
}

interface Role {
  roleId: string;
  roleName: string;
  matchedSkills: string[];
  missingSkills: string[];
  totalRequiredSkills: number;
  matchPercentage: number;
}

export default function RolesPage() {
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<Role[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skillSearch, setSkillSearch] = useState("");

  // Fetch available skills
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch("/api/search?q=skill");
        if (!response.ok) throw new Error("Failed to fetch skills");
        const data = await response.json();
        const skills = (data.data || [])
          .filter((item: Record<string, unknown>) => (item.label as string[])?.includes("Skill"))
          .slice(0, 30);
        setAvailableSkills(skills);
      } catch (err) {
        console.error("Error fetching skills:", err);
        setError("Failed to load available skills");
      } finally {
        setLoadingSkills(false);
      }
    };

    fetchSkills();
  }, []);

  // Fetch recommendations when selected skills change
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoadingRecommendations(true);
      setError(null);
      try {
        // For now, we'll use a hardcoded personId - in a real app this would come from auth
        const personId = "person-alice"; // Example person
        const response = await fetch(
          `/api/roles/recommendations?personId=${encodeURIComponent(personId)}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setRecommendations([]);
            return;
          }
          throw new Error("Failed to fetch recommendations");
        }

        const data = await response.json();
        setRecommendations(data.data || []);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError("Failed to load role recommendations");
      } finally {
        setLoadingRecommendations(false);
      }
    };

    if (selectedSkills.length > 0) {
      fetchRecommendations();
    }
  }, [selectedSkills]);

  const filteredSkills = availableSkills.filter((skill) =>
    skill.name.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const handleSelectSkill = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Find your next role</h1>
          <p className="text-lg text-slate-600">
            Select your skills to see which roles are the best fit for your profile.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Skill Selector */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Select your skills</h2>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search skills..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            {/* Skill Grid */}
            {loadingSkills ? (
              <LoadingState title="Loading skills..." isInline />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredSkills.map((skill) => (
                  <SkillChip
                    key={skill.id}
                    label={skill.name}
                    selected={selectedSkills.includes(skill.id)}
                    onClick={() => handleSelectSkill(skill.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Selected Skills Display */}
          {selectedSkills.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Selected ({selectedSkills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map((skillId) => {
                  const skill = availableSkills.find((s) => s.id === skillId);
                  return (
                    <SkillChip
                      key={skillId}
                      label={skill?.name || skillId}
                      selected={true}
                      onRemove={() => handleSelectSkill(skillId)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Recommendations */}
        {selectedSkills.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-8">
              Recommended Roles
              {loadingRecommendations && <span className="text-sm text-slate-500 ml-2">(Loading...)</span>}
            </h2>

            {loadingRecommendations ? (
              <CardGridSkeleton count={6} />
            ) : recommendations.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((role) => (
                  <RoleCard
                    key={role.roleId}
                    id={role.roleId}
                    name={role.roleName}
                    matchPercentage={Math.round(role.matchPercentage)}
                    matchedSkills={role.matchedSkills}
                    missingSkills={role.missingSkills}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No recommendations found"
                description="Try selecting different skills to see role recommendations."
              />
            )}
          </div>
        )}

        {/* Empty State */}
        {selectedSkills.length === 0 && (
          <EmptyState
            title="Select skills to get started"
            description="Choose the skills you have to discover which roles are the best fit for your profile."
          />
        )}
      </div>
    </div>
  );
}
