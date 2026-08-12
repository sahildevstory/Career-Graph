export type GraphNodeKind =
  | "Person"
  | "Skill"
  | "Technology"
  | "Role"
  | "Company"
  | "Project"
  | "Industry";

export interface GraphProjectionConfig {
  nodeId: string;
  maxDepth?: number;
  includeRelationships?: GraphNodeKind[];
}

export const graphProjectionDefaults: Required<Pick<GraphProjectionConfig, "maxDepth" | "includeRelationships">> = {
  maxDepth: 2,
  includeRelationships: ["Skill", "Technology", "Role", "Company", "Project", "Industry"],
};
