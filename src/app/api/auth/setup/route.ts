import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import {
  hashPassword,
  createSession,
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
} from "@/lib/auth";

// 用 raw SQL 建立 admins 資料表（如果不存在）
async function ensureAdminsTable() {
  if (!prisma) return;
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS \`admins\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`email\` VARCHAR(255) NOT NULL,
      \`name\` VARCHAR(100) NOT NULL,
      \`passwordHash\` VARCHAR(255) NOT NULL,
      \`role\` VARCHAR(20) NOT NULL DEFAULT 'editor',
      \`isActive\` BOOLEAN NOT NULL DEFAULT true,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      UNIQUE INDEX \`admins_email_key\`(\`email\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `;
}

// 用 raw SQL 建立 api_keys 資料表（如果不存在）
async function ensureApiKeysTable() {
  if (!prisma) return;
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS \`api_keys\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`name\` VARCHAR(100) NOT NULL,
      \`prefix\` VARCHAR(10) NOT NULL,
      \`createdById\` INT NOT NULL,
      \`isActive\` BOOLEAN NOT NULL DEFAULT true,
      \`lastUsedAt\` DATETIME(3) NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `;
}

// GET - 檢查是否需要初始設定
export async function GET() {
  if (!prisma) {
    return NextResponse.json({ needSetup: true });
  }

  try {
    await ensureAdminsTable();
    await ensureApiKeysTable();
    const count = await prisma.admin.count();
    return NextResponse.json({ needSetup: count === 0 });
  } catch {
    return NextResponse.json({ needSetup: true });
  }
}

// POST - 建立第一個管理員帳號
export async function POST(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json(
      { error: "資料庫無法連線" },
      { status: 503 }
    );
  }

  try {
    // 確保資料表存在
    await ensureAdminsTable();
    await ensureApiKeysTable();

    // 如果已有管理員，拒絕建立
    const count = await prisma.admin.count();
    if (count > 0) {
      return NextResponse.json(
        { error: "已完成初始設定，無法再次使用此功能" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "請填寫 Email 和密碼" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "密碼長度至少需要 8 個字元" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const admin = await prisma.admin.create({
      data: {
        email,
        passwordHash,
        name: name || "管理員",
        role: "admin",
        isActive: true,
      },
    });

    // 建立後自動登入
    const token = await createSession(admin.id, admin.role);

    const response = NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());

    return response;
  } catch (error) {
    const message =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? "資料庫操作失敗"
        : "伺服器錯誤";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
