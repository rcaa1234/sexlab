import { NextRequest, NextResponse } from "next/server";
import { buildGoogleAuthUrl, getPublicOrigin } from "@/lib/google-oauth";

export async function GET(request: NextRequest) {
  // 產生 CSRF state
  const state = crypto.randomUUID();

  const origin = getPublicOrigin(request);
  const url = buildGoogleAuthUrl(state, origin);

  const response = NextResponse.redirect(url);

  // 設定 state cookie（5 分鐘內有效）
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 300,
  });

  return response;
}
