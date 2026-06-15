"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { CategoriaMovimentoRow, CategoriaRow, SubcategoriaRow, TipoMovimento } from "@/lib/types";

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

// --- Categorias de Movimento (com tipo Entrada/Saída e subcategorias) ---

export async function listarCategoriasMovimento(
  tipoFiltro?: TipoMovimento
): Promise<CategoriaMovimentoRow[]> {
  const categorias = (
    tipoFiltro
      ? db
          .prepare(
            "SELECT id, nome, tipo FROM categorias_movimento WHERE tipo = ? ORDER BY nome"
          )
          .all(tipoFiltro)
      : db
          .prepare("SELECT id, nome, tipo FROM categorias_movimento ORDER BY nome")
          .all()
  ) as { id: number; nome: string; tipo: TipoMovimento }[];

  const subsStmt = db.prepare(
    "SELECT id, nome FROM categorias_movimento_sub WHERE categoria_id = ? ORDER BY nome"
  );

  return categorias.map((c) => ({
    ...c,
    subcategorias: subsStmt.all(c.id) as SubcategoriaRow[],
  }));
}

export async function criarCategoriaMovimento(nome: string, tipo: TipoMovimento) {
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) return;
  db.prepare(
    "INSERT OR IGNORE INTO categorias_movimento (nome, tipo) VALUES (?, ?)"
  ).run(nomeLimpo, tipo);
  revalidatePath("/configuracoes");
}

export async function renomearCategoriaMovimento(
  id: number,
  nome: string,
  tipo: TipoMovimento
) {
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) return;
  db.prepare("UPDATE categorias_movimento SET nome = ?, tipo = ? WHERE id = ?").run(
    nomeLimpo,
    tipo,
    id
  );
  revalidatePath("/configuracoes");
}

export async function excluirCategoriaMovimento(id: number) {
  db.prepare("DELETE FROM categorias_movimento WHERE id = ?").run(id);
  revalidatePath("/configuracoes");
}

export async function criarSubcategoria(categoriaId: number, nome: string) {
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) return;
  db.prepare(
    "INSERT OR IGNORE INTO categorias_movimento_sub (categoria_id, nome) VALUES (?, ?)"
  ).run(categoriaId, nomeLimpo);
  revalidatePath("/configuracoes");
}

export async function renomearSubcategoria(id: number, nome: string) {
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) return;
  db.prepare("UPDATE categorias_movimento_sub SET nome = ? WHERE id = ?").run(
    nomeLimpo,
    id
  );
  revalidatePath("/configuracoes");
}

export async function excluirSubcategoria(id: number) {
  db.prepare("DELETE FROM categorias_movimento_sub WHERE id = ?").run(id);
  revalidatePath("/configuracoes");
}
