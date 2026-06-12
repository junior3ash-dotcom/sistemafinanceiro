import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "financeiro.db");

declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined;
}

function createConnection() {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  return db;
}

export const db = globalThis.__db ?? createConnection();
if (process.env.NODE_ENV !== "production") {
  globalThis.__db = db;
}

db.exec(`
  CREATE TABLE IF NOT EXISTS categorias_contas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS categorias_movimento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS contas_pagar (
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
  );

  CREATE TABLE IF NOT EXISTS movimento_caixa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL,
    descricao TEXT NOT NULL,
    categoria TEXT NOT NULL,
    entidade TEXT NOT NULL,
    tipo TEXT NOT NULL,
    valor REAL NOT NULL,
    forma_pagamento TEXT,
    observacao TEXT,
    conta_pagar_id INTEGER,
    criado_em TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (conta_pagar_id) REFERENCES contas_pagar(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS configuracoes (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL
  );
`);

import { seedIfEmpty } from "./seed";
seedIfEmpty();

export default db;
