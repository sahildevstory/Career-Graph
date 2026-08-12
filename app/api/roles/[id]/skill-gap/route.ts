import { executeRead } from "@/lib/cognodb";
import { jsonFailure, jsonSuccess, safeErrorMessage, toJsonSafe, validateId } from "@/lib/api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const roleId = validateId(id, "id");
    const { searchParams } = new URL(request.url);
    const personId = validateId(searchParams.get("personId"), "personId");

    const rows = await executeRead<{
      personId: string;
      personName: string;
      roleId: string;
      roleName: string;
      currentSkills: string[];
      requiredSkills: string[];
      missingSkills: string[];
    }>(
      `
      MATCH (p:Person {id: $personId})-[:HAS_SKILL]->(current:Skill)
      MATCH (r:Role {id: $roleId})-[:REQUIRES]->(required:Skill)
      WITH p, r, collect(DISTINCT current.id) AS currentSkillIds, collect(DISTINCT required.id) AS requiredSkillIds
      RETURN
        p.id AS personId,
        p.name AS personName,
        r.id AS roleId,
        r.name AS roleName,
        currentSkillIds AS currentSkills,
        requiredSkillIds AS requiredSkills,
        [skillId IN requiredSkillIds WHERE NOT skillId IN currentSkillIds] AS missingSkills
      `,
      { personId, roleId }
    );

    if (!rows[0]) {
      return jsonFailure("NOT_FOUND", "No skill gap analysis was found for the supplied person and role.", 404);
    }

    return jsonSuccess(toJsonSafe(rows[0]));
  } catch (error) {
    const { code, message } = safeErrorMessage(error);
    const status = code === "INVALID_REQUEST" ? 400 : code === "NOT_FOUND" ? 404 : code === "DB_UNAVAILABLE" ? 503 : 500;
    return jsonFailure(code, message, status);
  }
}
