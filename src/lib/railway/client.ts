import { getAccessToken } from "@/lib/railway-auth";

const API_URL =
  process.env.RAILWAY_API_URL || "https://backboard.railway.com/graphql/v2";

export async function railwayGraphql<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 0 },
  });

  const json = await res.json();

  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message || "GraphQL error");
  }

  return json.data as T;
}
