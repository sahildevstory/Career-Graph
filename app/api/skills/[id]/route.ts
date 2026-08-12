import { executeRead } from "@/lib/cognodb";
import { jsonFailure, jsonSuccess, safeErrorMessage, toJsonSafe, validateId } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const skillId = validateId(id, "id");

    const rows = await executeRead<{
      id: string;
      name: string;
      category: string | null;
      description: string | null;
      relatedSkills: Array<{ id: string; name: string; category: string | null }>;
      leadingRoles: Array<{ id: string; name: string; level: string | null }>;
    }>(
      `
      MATCH (s:Skill {id: $skillId})
      OPTIONAL MATCH (s)-[:RELATED_TO]->(related:Skill)
      OPTIONAL MATCH (s)-[:LEADS_TO]->(role:Role)
      RETURN
        s.id AS id,
        s.name AS name,
        s.category AS category,
        s.description AS description,
        collect(DISTINCT { id: related.id, name: related.name, category: related.category }) AS relatedSkills,
        collect(DISTINCT { id: role.id, name: role.name, level: role.level }) AS leadingRoles
      `,
      { skillId }
    );

    if (!rows[0]) {
      return jsonFailure("NOT_FOUND", "The requested skill was not found.", 404);
    }

    return jsonSuccess(toJsonSafe(rows[0]));
  } catch (error) {
    const { code, message } = safeErrorMessage(error);
    const status = code === "INVALID_REQUEST" ? 400 : code === "NOT_FOUND" ? 404 : code === "DB_UNAVAILABLE" ? 503 : 500;
    return jsonFailure(code, message, status);
  }
}
