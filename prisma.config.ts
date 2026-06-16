import path from "node:path";
import { defineConfig } from "prisma/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://postgres.yhdgnwzttihiinhofgoy:MIelpogi12!@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres";

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: DATABASE_URL,
  },
});
