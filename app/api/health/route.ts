import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "CareerGraph",
    architecture: "Next.js -> Route Handlers -> neo4j-driver -> Bolt -> CognoDB",
  });
}
