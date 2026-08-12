import { executeRead } from "@/lib/cognodb";
import { jsonFailure, jsonSuccess, safeErrorMessage, toJsonSafe, validateId } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const companyId = validateId(id, "id");

    const rows = await executeRead<{
      id: string;
      name: string;
      industry: string | null;
      size: string | null;
      description: string | null;
      roles: Array<{ id: string; name: string; level: string | null }>;
      technologies: Array<{ id: string; name: string; category: string | null }>;
      requiredSkills: Array<{ id: string; name: string; category: string | null }>;
    }>(
      `
      MATCH (c:Company {id: $companyId})
      OPTIONAL MATCH (c)-[:IN_INDUSTRY]->(i:Industry)
      OPTIONAL MATCH (r:Role)-[:AVAILABLE_AT]->(c)
      OPTIONAL MATCH (r)-[:USES]->(t:Technology)
      OPTIONAL MATCH (r)-[:REQUIRES]->(s:Skill)
      RETURN
        c.id AS id,
        c.name AS name,
        i.name AS industry,
        c.size AS size,
        c.description AS description,
        collect(DISTINCT { id: r.id, name: r.name, level: r.level }) AS roles,
        collect(DISTINCT { id: t.id, name: t.name, category: t.category }) AS technologies,
        collect(DISTINCT { id: s.id, name: s.name, category: s.category }) AS requiredSkills
      `,
      { companyId }
    );

    if (!rows[0]) {
      return jsonFailure("NOT_FOUND", "The requested company was not found.", 404);
    }

    return jsonSuccess(toJsonSafe(rows[0]));
  } catch (error) {
    const { code, message } = safeErrorMessage(error);
    const status = code === "INVALID_REQUEST" ? 400 : code === "NOT_FOUND" ? 404 : code === "DB_UNAVAILABLE" ? 503 : 500;
    return jsonFailure(code, message, status);
  }
}
