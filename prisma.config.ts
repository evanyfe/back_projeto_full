import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: "postgresql://projeto_integrador_d0gy_user:nirsKXAiketJqQ5zNx5h2DaQRmmXx7YD@dpg-d3va0kur433s73cnscqg-a.oregon-postgres.render.com:5432/projeto_integrador_d0gy",
  },
});
