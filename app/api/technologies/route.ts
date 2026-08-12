import { executeRead } from "@/lib/cognodb";
import { jsonFailure, jsonSuccess, safeErrorMessage, toJsonSafe } from "@/lib/api";

export async function GET() {
  try {
    const rows = await executeRead<{
      id: string;
      name: string;
      category: string | null;
      description: string | null;
    }>(
      `
      MATCH (t:Technology)
      RETURN t.id AS id, t.name AS name, t.category AS category, t.description AS description
      ORDER BY t.name
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
