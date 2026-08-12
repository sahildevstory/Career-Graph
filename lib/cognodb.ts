import neo4j, { Driver, Session } from "neo4j-driver";

const isServer = typeof window === "undefined";

const globalForCognoDb = globalThis as typeof globalThis & {
  __cognodbDriver?: Driver;
};

export type CognoDbConfig = {
  uri?: string;
  username?: string;
  password?: string;
  isConfigured: boolean;
  missing: string[];
};

export function getCognoDbConfig(): CognoDbConfig {
  const uri = process.env.COGNODB_URI?.trim();
  const username = process.env.COGNODB_USERNAME?.trim();
  const password = process.env.COGNODB_PASSWORD?.trim();

  const missing: string[] = [];

  if (!uri) missing.push("COGNODB_URI");
  if (!username) missing.push("COGNODB_USERNAME");
  if (!password) missing.push("COGNODB_PASSWORD");

  return {
    uri,
    username,
    password,
    isConfigured: missing.length === 0,
    missing,
  };
}

export function createDriver(): Driver | undefined {
  if (!isServer) {
    throw new Error("CognoDB driver initialization is restricted to server-side code.");
  }

  const { uri, username, password, isConfigured } = getCognoDbConfig();

  if (!isConfigured || !uri || !username || !password) {
    return undefined;
  }

  return neo4j.driver(uri, neo4j.auth.basic(username, password));
}

export const cognodbDriver =
  isServer
    ? (globalForCognoDb.__cognodbDriver ??= createDriver())
    : undefined;

export function getSession(): Session {
  if (!isServer) {
    throw new Error("Database sessions are available only on the server.");
  }

  if (!cognodbDriver) {
    const { missing } = getCognoDbConfig();
    const message =
      missing.length > 0
        ? `CognoDB is not configured. Missing environment variables: ${missing.join(", ")}.`
        : "CognoDB driver initialization failed.";

    throw new Error(message);
  }

  return cognodbDriver.session();
}

export async function verifyConnection(): Promise<
  | { ok: true; address: string }
  | { ok: false; message: string; missing: string[] }
> {
  const config = getCognoDbConfig();

  if (!config.isConfigured) {
    return {
      ok: false,
      message:
        "CognoDB environment variables are not configured yet. Provide COGNODB_URI, COGNODB_USERNAME, and COGNODB_PASSWORD.",
      missing: config.missing,
    };
  }

  if (!cognodbDriver) {
    return {
      ok: false,
      message: "The CognoDB driver was not initialized.",
      missing: [],
    };
  }

  try {
    const info = await cognodbDriver.getServerInfo();
    return {
      ok: true,
      address: info.address ?? "unknown-address",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown connection error.";

    return {
      ok: false,
      message: `CognoDB connection failed: ${message}`,
      missing: [],
    };
  }
}

export async function executeRead<T = Record<string, unknown>>(
  cypher: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const session = getSession();

  try {
    const result = await session.executeRead((tx) => tx.run(cypher, params));
    return result.records.map((record) => record.toObject() as T);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error while reading from CognoDB.";
    throw new Error(`CognoDB read query failed: ${message}`);
  } finally {
    await session.close();
  }
}

export async function executeWrite<T = Record<string, unknown>>(
  cypher: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const session = getSession();

  try {
    const result = await session.executeWrite((tx) => tx.run(cypher, params));
    return result.records.map((record) => record.toObject() as T);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error while writing to CognoDB.";
    throw new Error(`CognoDB write query failed: ${message}`);
  } finally {
    await session.close();
  }
}
