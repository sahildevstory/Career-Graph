import { executeRead } from "@/lib/cognodb";
import { jsonFailure, jsonSuccess, safeErrorMessage, toJsonSafe, validateId } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const personId = validateId(searchParams.get("personId"), "personId");

    const rows = await executeRead<{
      roleId: string;
      roleName: string;
      matchedSkills: string[];
      missingSkills: string[];
      totalRequiredSkills: number;
      matchPercentage: number;
    }>(
      `
      MATCH (p:Person {id: $personId})-[:HAS_SKILL]->(personSkill:Skill)
      MATCH (role:Role)-[:REQUIRES]->(requiredSkill:Skill)
      WITH p, role, collect(DISTINCT personSkill.id) AS currentSkillIds, collect(DISTINCT requiredSkill.id) AS requiredSkillIds
      WITH p, role, currentSkillIds, requiredSkillIds,
           [skillId IN requiredSkillIds WHERE skillId IN currentSkillIds] AS matchedSkills,
           [skillId IN requiredSkillIds WHERE NOT skillId IN currentSkillIds] AS missingSkills
      WITH p, role, matchedSkills, missingSkills, size(requiredSkillIds) AS totalRequiredSkills,
           size([skillId IN requiredSkillIds WHERE skillId IN currentSkillIds]) AS matchedCount
      WHERE totalRequiredSkills > 0
      RETURN role.id AS roleId,
             role.name AS roleName,
             matchedSkills,
             missingSkills,
             totalRequiredSkills,
             toFloat((matchedCount * 100.0) / totalRequiredSkills) AS matchPercentage
      ORDER BY matchPercentage DESC, role.name ASC
      LIMIT 10
      `,
      { personId }
    );

    if (!rows.length) {
      return jsonFailure("NOT_FOUND", "No role recommendations were found for the supplied person.", 404);
    }

    return jsonSuccess(toJsonSafe(rows));
  } catch (error) {
    const { code, message } = safeErrorMessage(error);
    const status = code === "INVALID_REQUEST" ? 400 : code === "NOT_FOUND" ? 404 : code === "DB_UNAVAILABLE" ? 503 : 500;
    return jsonFailure(code, message, status);
  }
}
