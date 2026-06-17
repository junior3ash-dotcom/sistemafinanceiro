"use server";

import { revalidatePath } from "next/cache";
import { dbAll, dbRun } from "@/lib/db";
import { CategoriaMovimentoRow, CategoriaRow, SubcategoriaRow, TipoMovimento } from "@/lib/types";

function tabela(tipo: "contas" | "movimento") {
  return tipo === "contas" ? "categorias_contas" : "categorias_movimento";
}

export async function listarCategorias(tipo: "contas" | "movimento"): Promise<CategoriaRow[]> {
  return dbAll<CategoriaRow>(`SELECT id, nome FROM ${tabela(tipo)} ORDER BY nome`);
}

export async function criarCategoria(tipo: "contas" | "movimento", nome: string) {
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) return;
  await dbRun(`INSERT OR IGNORE INTO ${tabela(tipo)} (nome) VALUES (?)`, [nomeLimpo]);
  revalidatePath("/configuracoes");
}

export async function renomearCategoria(
  tipo: "contas" | "movimento",
  id: number,
  nome: string
) {
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) return;
  await dbRun(`UPDATE ${tabela(tipo)} SET nome = ? WHERE id = ?`, [nomeLimpo, id]);
  revalidatePath("/configuracoes");
}

export async function excluirCategoria(tipo: "contas" | "movimento", id: number) {
  await dbRun(`DELETE FROM ${tabela(tipo)} WHERE id = ?`, [id]);
  revalidatePath("/configuracoes");
}

// --- Categorias de Movimento (Entrada/Saída + subcategorias) ---

export async function listarCategoriasMovimento(
  tipoFiltro?: TipoMovimento
): Promise<CategoriaMovimentoRow[]> {
  const categorias = await dbAll<{ id: number; nome: string; tipo: TipoMovimento }>(
    tipoFiltro
      ? "SELECT id, nome, tipo FROM categorias_movimento WHERE tipo = ? ORDER BY nome"
      : "SELECT id, nome, tipo FROM categorias_movimento ORDER BY nome",
    tipoFiltro ? [tipoFiltro] : []
  );

  const allSubs = await dbAll<{ id: number; nome: string; categoria_id: number }>(
    "SELECT id, nome, categoria_id FROM categorias_movimento_sub ORDER BY nome"
  );

  return categorias.map((c) => ({
    ...c,
    subcategorias: allSubs
      .filter((s) => Number(s.categoria_id) === c.id)
      .map((s): SubcategoriaRow => ({ id: s.id, nome: s.nome })),
  }));
}

export async function criarCategoriaMovimento(nome: string, tipo: TipoMovimento) {
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) return;
  await dbRun("INSERT OR IGNORE INTO categorias_movimento (nome, tipo) VALUES (?, ?)", [
    nomeLimpo, tipo,
  ]);
  revalidatePath("/configuracoes");
}

export async function renomearCategoriaMovimento(id: number, nome: string, tipo: TipoMovimento) {
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) return;
  await dbRun("UPDATE categorias_movimento SET nome = ?, tipo = ? WHERE id = ?", [
    nomeLimpo, tipo, id,
  ]);
  revalidatePath("/configuracoes");
}

export async function excluirCategoriaMovimento(id: number) {
  await dbRun("DELETE FROM categorias_movimento WHERE id = ?", [id]);
  revalidatePath("/configuracoes");
}

export async function criarSubcategoria(categoriaId: number, nome: string) {
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) return;
  await dbRun(
    "INSERT OR IGNORE INTO categorias_movimento_sub (categoria_id, nome) VALUES (?, ?)",
    [categoriaId, nomeLimpo]
  );
  revalidatePath("/configuracoes");
}

export async function renomearSubcategoria(id: number, nome: string) {
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) return;
  await dbRun("UPDATE categorias_movimento_sub SET nome = ? WHERE id = ?", [nomeLimpo, id]);
  revalidatePath("/configuracoes");
}

export async function excluirSubcategoria(id: number) {
  await dbRun("DELETE FROM categorias_movimento_sub WHERE id = ?", [id]);
  revalidatePath("/configuracoes");
}
