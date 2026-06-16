import path from "node:path";
import { defineConfig } from "prisma/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://postgres.yhdgnwzttihiinhofgoy:Mielpogi12%21@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: DATABASE_URL,
  },
});
