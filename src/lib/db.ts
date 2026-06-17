import { createClient, type Client, type InValue } from "@libsql/client";
import path from "path";
import fs from "fs";

export type { InValue };

function createDbClient(): Client {
  const url =
    process.env.TURSO_URL ??
    `file:${path.join(process.cwd(), "data/financeiro.db")}`;

  if (url.startsWith("file:")) {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  }

  return createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
}

declare global {
  // eslint-disable-next-line no-var
  var __db: Client | undefined;
}

export const client: Client = globalThis.__db ?? createDbClient();
if (process.env.NODE_ENV !== "production") globalThis.__db = client;

const SCHEMA_STMTS = [
  `CREATE TABLE IF NOT EXISTS categorias_contas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE
  )`,
  `CREATE TABLE IF NOT EXISTS categorias_movimento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    tipo TEXT NOT NULL DEFAULT 'Saida'
  )`,
  `CREATE TABLE IF NOT EXISTS categorias_movimento_sub (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    UNIQUE (categoria_id, nome),
    FOREIGN KEY (categoria_id) REFERENCES categorias_movimento(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS contas_pagar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT NOT NULL,
    categoria TEXT NOT NULL,
    entidade TEXT NOT NULL,
    valor REAL NOT NULL,
    vencimento TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pendente',
    recorrencia TEXT NOT NULL DEFAULT 'Unica',
    recorrencia_dias INTEGER,
    forma_pagamento TEXT,
    prioridade TEXT NOT NULL DEFAULT 'Importante',
    tipo TEXT NOT NULL DEFAULT 'Operacional',
    observacao TEXT,
    parcela_atual INTEGER,
    parcelas_total INTEGER,
    grupo_parcelamento_id TEXT,
    conta_origem_id INTEGER,
    data_pagamento TEXT,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS movimento_caixa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL,
    descricao TEXT NOT NULL,
    categoria TEXT NOT NULL,
    subcategoria TEXT,
    entidade TEXT NOT NULL,
    tipo TEXT NOT NULL,
    valor REAL NOT NULL,
    forma_pagamento TEXT,
    observacao TEXT,
    conta_pagar_id INTEGER,
    criado_em TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (conta_pagar_id) REFERENCES contas_pagar(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS configuracoes (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL
  )`,
];

import { seedIfEmpty } from "./seed";

export const ready: Promise<void> = (async () => {
  for (const sql of SCHEMA_STMTS) await client.execute(sql);
  await seedIfEmpty(client);
})();

export async function dbAll<T>(sql: string, args: InValue[] = []): Promise<T[]> {
  await ready;
  const r = await client.execute({ sql, args });
  return r.rows as unknown as T[];
}

export async function dbGet<T>(sql: string, args: InValue[] = []): Promise<T | null> {
  await ready;
  const r = await client.execute({ sql, args });
  return (r.rows[0] ?? null) as unknown as T | null;
}

export async function dbRun(
  sql: string,
  args: InValue[] = []
): Promise<{ lastInsertRowid: number }> {
  await ready;
  const r = await client.execute({ sql, args });
  return { lastInsertRowid: Number(r.lastInsertRowid ?? 0) };
}
