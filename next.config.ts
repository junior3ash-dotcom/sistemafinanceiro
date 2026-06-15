import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
  // Permite acessar o app via IP da rede local (ex: outro computador/celular)
  // e via Tailscale Funnel (acesso pela internet)
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "celio.tail6adbbf.ts.net"],
};

export default nextConfig;
