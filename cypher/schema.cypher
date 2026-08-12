// CareerGraph schema for CognoDB / openCypher compatibility
// Keep this intentionally simple and safe for supported Cypher features.

CREATE CONSTRAINT person_id IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT skill_id IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE;
CREATE CONSTRAINT technology_id IF NOT EXISTS FOR (t:Technology) REQUIRE t.id IS UNIQUE;
CREATE CONSTRAINT role_id IF NOT EXISTS FOR (r:Role) REQUIRE r.id IS UNIQUE;
CREATE CONSTRAINT company_id IF NOT EXISTS FOR (c:Company) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT project_id IF NOT EXISTS FOR (p:Project) REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT industry_id IF NOT EXISTS FOR (i:Industry) REQUIRE i.id IS UNIQUE;

CREATE INDEX person_name IF NOT EXISTS FOR (p:Person) ON (p.name);
CREATE INDEX skill_name IF NOT EXISTS FOR (s:Skill) ON (s.name);
CREATE INDEX technology_name IF NOT EXISTS FOR (t:Technology) ON (t.name);
CREATE INDEX role_name IF NOT EXISTS FOR (r:Role) ON (r.name);
CREATE INDEX company_name IF NOT EXISTS FOR (c:Company) ON (c.name);
CREATE INDEX project_name IF NOT EXISTS FOR (p:Project) ON (p.name);
CREATE INDEX industry_name IF NOT EXISTS FOR (i:Industry) ON (i.name);

// Core domain relationships:
// Person -[:HAS_SKILL]-> Skill
// Person -[:WORKED_ON]-> Project
// Project -[:USES]-> Technology
// Project -[:DEMONSTRATES]-> Skill
// Role -[:REQUIRES]-> Skill
// Role -[:USES]-> Technology
// Role -[:AVAILABLE_AT]-> Company
// Company -[:IN_INDUSTRY]-> Industry
// Skill -[:RELATED_TO]-> Skill
// Technology -[:RELATED_TO]-> Technology
// Skill -[:LEADS_TO]-> Role
// Technology -[:LEADS_TO]-> Role
