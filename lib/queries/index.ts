export const queryCatalog = {
  personSkills: "MATCH (p:Person {id: $personId})-[:HAS_SKILL]->(s:Skill) RETURN p, collect(s) AS skills",
  adjacentCareerPaths:
    "MATCH (p:Person {id: $personId})-[:HAS_SKILL]->(:Skill)<-[:REQUIRES]-(r:Role) RETURN r, count(*) AS matchScore ORDER BY matchScore DESC",
  graphSubgraph:
    "MATCH (n)-[r]-(m) WHERE id(n) = $nodeId RETURN n, r, m LIMIT 25",
} as const;

export type QueryCatalogKey = keyof typeof queryCatalog;
