import { executeRead } from "@/lib/cognodb";
import { jsonFailure, jsonSuccess, safeErrorMessage, toJsonSafe } from "@/lib/api";

export async function GET() {
  try {
    const rows = await executeRead<{
      id: string;
      name: string;
      industry: string | null;
      size: string | null;
      description: string | null;
    }>(
      `
      MATCH (c:Company)
      OPTIONAL MATCH (c)-[:IN_INDUSTRY]->(i:Industry)
      RETURN c.id AS id, c.name AS name, i.name AS industry, c.size AS size, c.description AS description
      ORDER BY c.name
      LIMIT 100
      `
    );

    return jsonSuccess(toJsonSafe(rows));
  } catch (error) {
    const { code, message } = safeErrorMessage(error);
    const status = code === "DB_UNAVAILABLE" ? 503 : 500;
    return jsonFailure(code, message, status);
  }
}
