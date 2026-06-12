"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { CategoriaRow } from "@/lib/types";

function tabela(tipo: "contas" | "movimento") {
  return tipo === "contas" ? "categorias_contas" : "categorias_movimento";
}

export async function listarCategorias(
  tipo: "contas" | "movimento"
): Promise<CategoriaRow[]> {
  return db
    .prepare(`SELECT id, nome FROM ${tabela(tipo)} ORDER BY nome`)
    .all() as CategoriaRow[];
}

export async function criarCategoria(
  tipo: "contas" | "movimento",
  nome: string
) {
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) return;
  db.prepare(`INSERT OR IGNORE INTO ${tabela(tipo)} (nome) VALUES (?)`).run(
    nomeLimpo
  );
  revalidatePath("/configuracoes");
}

export async function renomearCategoria(
  tipo: "contas" | "movimento",
  id: number,
  nome: string
) {
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) return;
  db.prepare(`UPDATE ${tabela(tipo)} SET nome = ? WHERE id = ?`).run(
    nomeLimpo,
    id
  );
  revalidatePath("/configuracoes");
}

export async function excluirCategoria(
  tipo: "contas" | "movimento",
  id: number
) {
  db.prepare(`DELETE FROM ${tabela(tipo)} WHERE id = ?`).run(id);
  revalidatePath("/configuracoes");
}
