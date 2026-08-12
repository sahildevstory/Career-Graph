export type NodeLabel =
  | "Person"
  | "Skill"
  | "Technology"
  | "Role"
  | "Company"
  | "Project"
  | "Industry";

export type RelationshipType =
  | "HAS_SKILL"
  | "WORKED_ON"
  | "USES"
  | "DEMONSTRATES"
  | "REQUIRES"
  | "AVAILABLE_AT"
  | "IN_INDUSTRY"
  | "RELATED_TO"
  | "LEADS_TO";

export interface PersonNode {
  id: string;
  name: string;
  headline?: string;
  location?: string;
  bio?: string;
}

export interface SkillNode {
  id: string;
  name: string;
  category?: string;
  description?: string;
}

export interface TechnologyNode {
  id: string;
  name: string;
  category?: string;
  description?: string;
}

export interface RoleNode {
  id: string;
  name: string;
  level?: string;
  description?: string;
}

export interface CompanyNode {
  id: string;
  name: string;
  industry?: string;
  size?: string;
  description?: string;
}

export interface ProjectNode {
  id: string;
  name: string;
  description?: string;
  difficulty?: string;
}

export interface IndustryNode {
  id: string;
  name: string;
  description?: string;
}

export interface GraphNode<T extends NodeLabel = NodeLabel> {
  id: string;
  label: T;
  properties: Record<string, unknown>;
}

export interface GraphRelationship {
  id?: string;
  type: RelationshipType;
  source: string;
  target: string;
  properties?: Record<string, unknown>;
}

export interface GraphDataResponse {
  nodes: GraphNode[];
  edges: GraphRelationship[];
}

export interface CareerPathSuggestion {
  personId: string;
  targetRoleId: string;
  matchPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  skillsToAcquire: string[];
  technologiesToLearn: string[];
  recommendedProjects: string[];
}
