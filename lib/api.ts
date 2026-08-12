import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "INVALID_REQUEST"
  | "NOT_FOUND"
  | "DB_UNAVAILABLE"
  | "QUERY_FAILED"
  | "INTERNAL_SERVER_ERROR";

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasNeo4jNumberShape(value: unknown): value is { toNumber: () => number } {
  return isPlainObject(value) && "toNumber" in value && typeof value.toNumber === "function";
}

export function toJsonSafe<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string" || typeof value === "boolean" || typeof value === "number") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => toJsonSafe(entry)) as T;
  }

  if (hasNeo4jNumberShape(value)) {
    return Number(value.toNumber()) as T;
  }

  if (isPlainObject(value)) {
    const normalized = Object.entries(value).reduce<Record<string, unknown>>((acc, [key, entry]) => {
      acc[key] = toJsonSafe(entry);
      return acc;
    }, {});

    return normalized as T;
  }

  return value;
}

export function jsonSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function jsonFailure(code: ApiErrorCode, message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    { status }
  );
}

export function requireString(value: string | null | undefined, name: string) {
  if (value === null || value === undefined || value.trim().length === 0) {
    throw new Error(`${name} is required.`);
  }

  return value.trim();
}

export function validateId(value: string | null | undefined, name: string) {
  const candidate = requireString(value, name);

  if (!/^[A-Za-z0-9_.:-]+$/.test(candidate)) {
    throw new Error(`${name} is invalid.`);
  }

  return candidate;
}

export function safeErrorMessage(error: unknown) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("not configured") || message.includes("not initialized")) {
      return {
        code: "DB_UNAVAILABLE" as const,
        message: "The database is currently unavailable.",
      };
    }

    if (message.includes("connection") || message.includes("timeout") || message.includes("unauthorized")) {
      return {
        code: "DB_UNAVAILABLE" as const,
        message: "The database is currently unavailable.",
      };
    }

    if (message.includes("required") || message.includes("invalid")) {
      return {
        code: "INVALID_REQUEST" as const,
        message: error.message,
      };
    }

    if (message.includes("not found")) {
      return {
        code: "NOT_FOUND" as const,
        message: error.message,
      };
    }

    return {
      code: "QUERY_FAILED" as const,
      message: "The database query could not be completed.",
    };
  }

  return {
    code: "INTERNAL_SERVER_ERROR" as const,
    message: "An unexpected server error occurred.",
  };
}
