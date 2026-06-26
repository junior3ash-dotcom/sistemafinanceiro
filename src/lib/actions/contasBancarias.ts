"use server";

import { revalidatePath } from "next/cache";
import { dbAll, dbGet, dbRun } from "@/lib/db";

export interface ContaBancariaRow {
  id: number;
  nome: string;
  saldo_inicial: number;
  conta_pai_id: number | null;
}

export interface ContaBancariaComSaldo extends ContaBancariaRow {
  saldo: number;
  cofrinhos: ContaBancariaComSaldo[];
}

async function calcularSaldo(contaId: number, saldoInicial: number): Promise<number> {
  const row = await dbGet<{ entradas: number; saidas: number }>(
    `SELECT
      COALESCE(SUM(CASE WHEN tipo = 'Entrada' THEN valor ELSE 0 END), 0) AS entradas,
      COALESCE(SUM(CASE WHEN tipo = 'Saida' THEN valor ELSE 0 END), 0) AS saidas
     FROM movimento_caixa WHERE conta_bancaria_id = ?`,
    [contaId]
  );
  return saldoInicial + (row?.entradas ?? 0) - (row?.saidas ?? 0);
}

export async function listarContasBancariasComSaldo(): Promise<ContaBancariaComSaldo[]> {
  const todas = await dbAll<ContaBancariaRow>(
    "SELECT id, nome, saldo_inicial, conta_pai_id FROM contas_bancarias ORDER BY id ASC"
  );

  const comSaldo = await Promise.all(
    todas.map(async (c) => ({
      ...c,
      saldo: await calcularSaldo(c.id, c.saldo_inicial),
      cofrinhos: [] as ContaBancariaComSaldo[],
    }))
  );

  const principais = comSaldo.filter((c) => c.conta_pai_id === null);
  for (const principal of principais) {
    principal.cofrinhos = comSaldo.filter((c) => c.conta_pai_id === principal.id);
  }
  return principais;
}

export async function listarTodasContasBancariasFlat(): Promise<ContaBancariaComSaldo[]> {
  const principais = await listarContasBancariasComSaldo();
  const flat: ContaBancariaComSaldo[] = [];
  for (const p of principais) {
    flat.push(p);
    flat.push(...p.cofrinhos);
  }
  return flat;
}

export async function getSaldoCaixaGeral(): Promise<number> {
  const principais = await listarContasBancariasComSaldo();
  return principais.reduce((acc, c) => acc + c.saldo, 0);
}

export async function getSaldoReservas(): Promise<number> {
  const principais = await listarContasBancariasComSaldo();
  return principais.reduce(
    (acc, c) => acc + c.cofrinhos.reduce((sub, cof) => sub + cof.saldo, 0),
    0
  );
}

export async function criarContaBancaria(
  nome: string,
  saldoInicial: number,
  contaPaiId: number | null
) {
  await dbRun(
    "INSERT INTO contas_bancarias (nome, saldo_inicial, conta_pai_id) VALUES (?, ?, ?)",
    [nome, saldoInicial, contaPaiId]
  );
  revalidatePath("/configuracoes");
  revalidatePath("/caixa");
  revalidatePath("/contas");
  revalidatePath("/");
}

export async function atualizarContaBancaria(
  id: number,
  nome: string,
  saldoInicial: number
) {
  await dbRun(
    "UPDATE contas_bancarias SET nome = ?, saldo_inicial = ? WHERE id = ?",
    [nome, saldoInicial, id]
  );
  revalidatePath("/configuracoes");
  revalidatePath("/caixa");
  revalidatePath("/contas");
  revalidatePath("/");
}

export async function excluirContaBancaria(id: number) {
  const cofrinhos = await dbAll<{ id: number }>(
    "SELECT id FROM contas_bancarias WHERE conta_pai_id = ?",
    [id]
  );
  const idsParaExcluir = [id, ...cofrinhos.map((c) => c.id)];
  for (const idAlvo of idsParaExcluir) {
    await dbRun("UPDATE movimento_caixa SET conta_bancaria_id = NULL WHERE conta_bancaria_id = ?", [idAlvo]);
    await dbRun("DELETE FROM contas_bancarias WHERE id = ?", [idAlvo]);
  }
  revalidatePath("/configuracoes");
  revalidatePath("/caixa");
  revalidatePath("/contas");
  revalidatePath("/");
}
