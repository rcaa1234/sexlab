import { NextRequest, NextResponse } from "next/server";
import { searchPosts } from "@/lib/db";

// GET /api/posts/search?q=keyword
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perPage") || "10");

  if (!query.trim()) {
    return NextResponse.json({ posts: [], total: 0, totalPages: 0, page: 1 });
  }

  const result = await searchPosts(query, page, perPage);
  return NextResponse.json(result);
}
