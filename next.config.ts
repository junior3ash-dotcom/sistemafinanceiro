import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  // Permite acessar o app via IP da rede local (ex: outro computador/celular)
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
};

export default nextConfig;
