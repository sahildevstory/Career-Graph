import { executeRead } from "@/lib/cognodb";
import { jsonFailure, jsonSuccess, safeErrorMessage, toJsonSafe, validateId } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const technologyId = validateId(id, "id");

    const rows = await executeRead<{
      id: string;
      name: string;
      category: string | null;
      description: string | null;
      relatedTechnologies: Array<{ id: string; name: string; category: string | null }>;
      relevantRoles: Array<{ id: string; name: string; level: string | null }>;
    }>(
      `
      MATCH (t:Technology {id: $technologyId})
      OPTIONAL MATCH (related:Technology)<-[:RELATED_TO*1..3]-(t)
      OPTIONAL MATCH (r:Role)-[:USES]->(t)
      RETURN
        t.id AS id,
        t.name AS name,
        t.category AS category,
        t.description AS description,
        collect(DISTINCT { id: related.id, name: related.name, category: related.category }) AS relatedTechnologies,
        collect(DISTINCT { id: r.id, name: r.name, level: r.level }) AS relevantRoles
      `,
      { technologyId }
    );

    if (!rows[0]) {
      return jsonFailure("NOT_FOUND", "The requested technology was not found.", 404);
    }

    return jsonSuccess(toJsonSafe(rows[0]));
  } catch (error) {
    const { code, message } = safeErrorMessage(error);
    const status = code === "INVALID_REQUEST" ? 400 : code === "NOT_FOUND" ? 404 : code === "DB_UNAVAILABLE" ? 503 : 500;
    return jsonFailure(code, message, status);
  }
}
