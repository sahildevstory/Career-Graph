import { executeRead } from "@/lib/cognodb";
import { jsonFailure, jsonSuccess, safeErrorMessage, toJsonSafe } from "@/lib/api";

export async function GET() {
  try {
    const rows = await executeRead<{
      id: string;
      name: string;
      level: string | null;
      description: string | null;
    }>(
      `
      MATCH (r:Role)
      RETURN r.id AS id, r.name AS name, r.level AS level, r.description AS description
      ORDER BY r.name
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
