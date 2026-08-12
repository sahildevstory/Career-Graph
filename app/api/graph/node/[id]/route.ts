import { executeRead } from "@/lib/cognodb";
import { jsonFailure, jsonSuccess, safeErrorMessage, toJsonSafe, validateId } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const nodeId = validateId(id, "id");

    const rows = await executeRead<{
      node: Record<string, unknown>;
      neighbors: Array<{ relationshipType: string; neighbor: Record<string, unknown> }>;
    }>(
      `
      MATCH (n {id: $nodeId})
      OPTIONAL MATCH (n)-[r]-(m)
      WITH n, collect({
        relationshipType: type(r),
        neighbor: {
          id: m.id,
          labels: labels(m),
          name: coalesce(m.name, ''),
          description: coalesce(m.description, '')
        }
      }) AS neighbors
      RETURN n, neighbors
      LIMIT 25
      `,
      { nodeId }
    );

    if (!rows[0]) {
      return jsonFailure("NOT_FOUND", "The requested graph node was not found.", 404);
    }

    return jsonSuccess(toJsonSafe(rows[0]));
  } catch (error) {
    const { code, message } = safeErrorMessage(error);
    const status = code === "INVALID_REQUEST" ? 400 : code === "NOT_FOUND" ? 404 : code === "DB_UNAVAILABLE" ? 503 : 500;
    return jsonFailure(code, message, status);
  }
}
