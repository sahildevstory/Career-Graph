import { executeRead } from "@/lib/cognodb";
import { jsonFailure, jsonSuccess, requireString, safeErrorMessage, toJsonSafe } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = requireString(searchParams.get("q"), "q");

    if (q.length < 2) {
      return jsonFailure("INVALID_REQUEST", "The search term must be at least 2 characters.", 400);
    }

    const rows = await executeRead<{
      label: string[];
      id: string;
      name: string;
      description: string | null;
    }>(
      `
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
      LIMIT $limit
      `,
      { searchTerm: q, limit: 25 }
    );

    return jsonSuccess(toJsonSafe(rows));
  } catch (error) {
    const { code, message } = safeErrorMessage(error);
    const status = code === "INVALID_REQUEST" ? 400 : code === "NOT_FOUND" ? 404 : code === "DB_UNAVAILABLE" ? 503 : 500;
    return jsonFailure(code, message, status);
  }
}
