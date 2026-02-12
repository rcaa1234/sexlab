/**
 * 管理員帳號建立腳本
 *
 * 使用方式:
 *   設定 .env 中的 ADMIN_EMAIL 和 ADMIN_PASSWORD 後執行:
 *   npm run db:seed-admin
 *
 *   或直接指定:
 *   ADMIN_EMAIL=admin@sexlab.com.tw ADMIN_PASSWORD=your-password npx tsx scripts/seed-admin.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "管理員";
  const role = process.env.ADMIN_ROLE || "admin";

  if (!email || !password) {
    console.error("❌ 請設定 ADMIN_EMAIL 和 ADMIN_PASSWORD 環境變數");
    console.error("");
    console.error("範例:");
    console.error(
      '  ADMIN_EMAIL=admin@sexlab.com.tw ADMIN_PASSWORD="MyPassword123" npm run db:seed-admin'
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("❌ 密碼長度至少需要 8 個字元");
    process.exit(1);
  }

  console.log("正在建立管理員帳號...");

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: { passwordHash, name, role },
    create: { email, passwordHash, name, role },
  });

  console.log("");
  console.log("✅ 管理員帳號建立完成！");
  console.log(`   Email: ${admin.email}`);
  console.log(`   Name:  ${admin.name}`);
  console.log(`   Role:  ${admin.role}`);
  console.log(`   ID:    ${admin.id}`);

  await prisma.$disconnect();
}

seedAdmin().catch((err) => {
  console.error("❌ 建立失敗:", err.message);
  prisma.$disconnect();
  process.exit(1);
});
