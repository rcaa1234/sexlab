import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { exchangeCodeForTokens, getGoogleUserInfo, getPublicOrigin } from "@/lib/google-oauth";
import {
  createSession,
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const loginUrl = "/admin/login";

  // 取得公開 origin（reverse proxy 背後 request.url 可能是 localhost）
  const origin = getPublicOrigin(request);

  // 使用者在 Google 頁面拒絕授權
  if (error) {
    return NextResponse.redirect(`${origin}${loginUrl}?error=google_denied`);
  }

  // 驗證 state cookie（CSRF 防護）
  const storedState = request.cookies.get("google_oauth_state")?.value;
  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(`${origin}${loginUrl}?error=invalid_state`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}${loginUrl}?error=no_code`);
  }

  if (!prisma) {
    return NextResponse.redirect(`${origin}${loginUrl}?error=db_unavailable`);
  }

  try {
    // 交換 code 取得 access token
    const tokens = await exchangeCodeForTokens(code, origin);
    const googleUser = await getGoogleUserInfo(tokens.access_token);

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase();
    const isSuperAdmin =
      superAdminEmail && googleUser.email.toLowerCase() === superAdminEmail;

    // 查找現有用戶
    let admin = await prisma.admin.findUnique({
      where: { email: googleUser.email },
    });

    if (admin) {
      // 更新 googleId 和 avatar
      admin = await prisma.admin.update({
        where: { id: admin.id },
        data: {
          googleId: googleUser.id,
          avatar: googleUser.picture,
          name: admin.name || googleUser.name,
        },
      });
    } else {
      // 建立新用戶
      admin = await prisma.admin.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.id,
          avatar: googleUser.picture,
          role: isSuperAdmin ? "admin" : "editor",
          isActive: !!isSuperAdmin,
        },
      });
    }

    // 檢查是否啟用
    if (!admin.isActive) {
      const response = NextResponse.redirect(
        `${origin}${loginUrl}?error=pending_approval`
      );
      response.cookies.delete("google_oauth_state");
      return response;
    }

    // 建立 session
    const token = await createSession(admin.id, admin.role);

    const response = NextResponse.redirect(`${origin}/admin`);
    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
    response.cookies.delete("google_oauth_state");

    return response;
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(
      `${origin}${loginUrl}?error=oauth_failed`
    );
  }
}
