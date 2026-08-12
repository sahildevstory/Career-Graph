import { executeRead } from "@/lib/cognodb";
import { jsonFailure, jsonSuccess, safeErrorMessage, toJsonSafe, validateId } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const roleId = validateId(id, "id");

    const rows = await executeRead<{
      id: string;
      name: string;
      level: string | null;
      description: string | null;
      requiredSkills: Array<{ id: string; name: string; category: string | null }>;
      technologies: Array<{ id: string; name: string; category: string | null }>;
      companies: Array<{ id: string; name: string; industry: string | null }>;
    }>(
      `
      MATCH (r:Role {id: $roleId})
      OPTIONAL MATCH (r)-[:REQUIRES]->(s:Skill)
      OPTIONAL MATCH (r)-[:USES]->(t:Technology)
      OPTIONAL MATCH (r)-[:AVAILABLE_AT]->(c:Company)
      OPTIONAL MATCH (c)-[:IN_INDUSTRY]->(i:Industry)
      RETURN
        r.id AS id,
        r.name AS name,
        r.level AS level,
        r.description AS description,
        collect(DISTINCT { id: s.id, name: s.name, category: s.category }) AS requiredSkills,
        collect(DISTINCT { id: t.id, name: t.name, category: t.category }) AS technologies,
        collect(DISTINCT { id: c.id, name: c.name, industry: i.name }) AS companies
      `,
      { roleId }
    );

    if (!rows[0]) {
      return jsonFailure("NOT_FOUND", "The requested role was not found.", 404);
    }

    return jsonSuccess(toJsonSafe(rows[0]));
  } catch (error) {
    const { code, message } = safeErrorMessage(error);
    const status = code === "INVALID_REQUEST" ? 400 : code === "NOT_FOUND" ? 404 : code === "DB_UNAVAILABLE" ? 503 : 500;
    return jsonFailure(code, message, status);
  }
}
