// CareerGraph Cypher queries
// All values are parameterized in application code; this file is for readability and review.

// 1) Search across graph entities
MATCH (n)
WHERE (
  n:Skill OR n:Technology OR n:Role OR n:Company OR n:Project
)
AND (
  toLower(coalesce(n.name, '')) CONTAINS toLower($searchTerm)
  OR toLower(coalesce(n.description, '')) CONTAINS toLower($searchTerm)
)
RETURN labels(n) AS label, n.id AS id, n.name AS name, coalesce(n.description, '') AS description
ORDER BY n.name
LIMIT 25;

// 2) Get a node and its direct neighbors
MATCH (n {id: $nodeId})
OPTIONAL MATCH (n)-[r]-(m)
RETURN n, collect({relationshipType: type(r), neighbor: m}) AS neighbors;

// 3) Multi-hop traversal from a Skill to reachable Roles
// This uses a variable-length traversal to find adjacent Roles within a small graph radius.
MATCH (s:Skill {id: $skillId})
MATCH path = (s)-[:RELATED_TO|LEADS_TO*1..4]-(r:Role)
RETURN DISTINCT r.id AS roleId,
       r.name AS role,
       length(path) AS hopCount,
       [node IN nodes(path) WHERE node:Skill | node.name] AS skillsOnPath
ORDER BY hopCount ASC, r.name ASC;

// 4) Career matching for a Person based on current skills
MATCH (p:Person {id: $personId})-[:HAS_SKILL]->(personSkill:Skill)
MATCH (role:Role)-[:REQUIRES]->(requiredSkill:Skill)
WITH p, role, collect(DISTINCT personSkill.id) AS currentSkillIds,
     collect(DISTINCT requiredSkill.id) AS requiredSkillIds
WITH p, role,
     currentSkillIds,
     requiredSkillIds,
     [skillId IN requiredSkillIds WHERE skillId IN currentSkillIds] AS matchedSkills,
     [skillId IN requiredSkillIds WHERE NOT skillId IN currentSkillIds] AS missingSkills
WITH p, role,
     matchedSkills,
     missingSkills,
     size(requiredSkillIds) AS totalRequiredSkills,
     size(matchedSkills) AS matchedCount
RETURN role.id AS roleId,
       role.name AS role,
       matchedSkills,
       missingSkills,
       totalRequiredSkills,
       toFloat((matchedCount * 100.0) / totalRequiredSkills) AS matchPercentage
ORDER BY matchPercentage DESC;

// 5) Skill gap analysis for a person and a role
MATCH (p:Person {id: $personId})-[:HAS_SKILL]->(current:Skill)
MATCH (r:Role {id: $roleId})-[:REQUIRES]->(required:Skill)
WITH p, r, collect(DISTINCT current.id) AS currentSkillIds,
     collect(DISTINCT required.id) AS requiredSkillIds
RETURN p.id AS personId,
       p.name AS personName,
       r.id AS roleId,
       r.name AS roleName,
       currentSkillIds AS currentSkills,
       requiredSkillIds AS requiredSkills,
       [skillId IN requiredSkillIds WHERE NOT skillId IN currentSkillIds] AS missingSkills;

// 6) Technology exploration
MATCH (t:Technology {id: $technologyId})
OPTIONAL MATCH (related:Technology)<-[:RELATED_TO*1..3]-(t)
OPTIONAL MATCH (r:Role)-[:USES]->(t)
OPTIONAL MATCH (r2:Role)-[:USES]->(related)
RETURN DISTINCT t.id AS technologyId,
                t.name AS technologyName,
                collect(DISTINCT related.name) AS connectedTechnologies,
                collect(DISTINCT r.name) AS relevantRoles
LIMIT 50;

// 7) Company exploration
MATCH (c:Company {id: $companyId})
OPTIONAL MATCH (c)<-[:AVAILABLE_AT]-(r:Role)
OPTIONAL MATCH (r)-[:REQUIRES]->(requiredSkill:Skill)
OPTIONAL MATCH (r)-[:USES]->(technology:Technology)
OPTIONAL MATCH (c)-[:IN_INDUSTRY]->(industry:Industry)
RETURN c.id AS companyId,
       c.name AS companyName,
       collect(DISTINCT r.name) AS roles,
       collect(DISTINCT technology.name) AS technologies,
       collect(DISTINCT requiredSkill.name) AS requiredSkills,
       industry.name AS industry
LIMIT 50;
