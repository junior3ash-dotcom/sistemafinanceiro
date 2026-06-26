"use server";

import { revalidatePath } from "next/cache";
import { dbAll, dbGet, dbRun } from "@/lib/db";
import { Entidade, MovimentoCaixa, TipoMovimento } from "@/lib/types";
import { marcarContaComoPaga, marcarContaComoPendente } from "./contasPagar";
import { getSaldoCaixaGeral } from "./contasBancarias";

export interface MovimentoInput {
  data: string;
  descricao: string;
  categoria: string;
  subcategoria: string | null;
  entidade: Entidade;
  tipo: TipoMovimento;
  valor: number;
  forma_pagamento: string | null;
  observacao: string | null;
  conta_pagar_id: number | null;
  conta_bancaria_id: number | null;
}

const SELECT_BASE = `
  SELECT id, data, descricao, categoria, subcategoria, entidade, tipo, valor,
         forma_pagamento, observacao, conta_pagar_id, conta_bancaria_id, criado_em
  FROM movimento_caixa
`;

export interface FiltrosMovimento {
  inicio?: string;
  fim?: string;
}

export async function listarMovimentos(filtros: FiltrosMovimento = {}): Promise<MovimentoCaixa[]> {
  const cond: string[] = [];
  const params: string[] = [];
  if (filtros.inicio) { cond.push("data >= ?"); params.push(filtros.inicio); }
  if (filtros.fim) { cond.push("data <= ?"); params.push(filtros.fim); }
  const where = cond.length ? `WHERE ${cond.join(" AND ")}` : "";
  return dbAll<MovimentoCaixa>(`${SELECT_BASE} ${where} ORDER BY data ASC, id ASC`, params);
}

export interface MovimentoComSaldo extends MovimentoCaixa {
  saldo: number;
}

export async function listarMovimentosComSaldo(): Promise<MovimentoComSaldo[]> {
  const movimentos = await listarMovimentos();
  const totalMovimentado = movimentos.reduce(
    (acc, m) => acc + (m.tipo === "Entrada" ? m.valor : -m.valor),
    0
  );
  const saldoAtual = await getSaldoCaixaGeral();
  let saldo = saldoAtual - totalMovimentado;
  return movimentos
    .map((m) => {
      saldo += m.tipo === "Entrada" ? m.valor : -m.valor;
      return { ...m, saldo };
    })
    .reverse();
}

export async function getSaldoAtual(): Promise<number> {
  return getSaldoCaixaGeral();
}

export async function getMovimento(id: number): Promise<MovimentoCaixa | null> {
  return dbGet<MovimentoCaixa>(`${SELECT_BASE} WHERE id = ?`, [id]);
}

export async function criarMovimento(input: MovimentoInput) {
  await dbRun(
    `INSERT INTO movimento_caixa (
      data, descricao, categoria, subcategoria, entidade, tipo, valor,
      forma_pagamento, observacao, conta_pagar_id, conta_bancaria_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.data, input.descricao, input.categoria, input.subcategoria,
      input.entidade, input.tipo, input.valor,
      input.forma_pagamento, input.observacao, input.conta_pagar_id,
      input.conta_bancaria_id,
    ]
  );
  if (input.tipo === "Saida" && input.conta_pagar_id)
    await marcarContaComoPaga(input.conta_pagar_id, input.data);

  revalidatePath("/caixa");
  revalidatePath("/contas");
  revalidatePath("/");
}

export async function atualizarMovimento(id: number, input: MovimentoInput) {
  const anterior = await getMovimento(id);

  await dbRun(
    `UPDATE movimento_caixa SET
      data = ?, descricao = ?, categoria = ?, subcategoria = ?, entidade = ?, tipo = ?,
      valor = ?, forma_pagamento = ?, observacao = ?, conta_pagar_id = ?, conta_bancaria_id = ?
    WHERE id = ?`,
    [
      input.data, input.descricao, input.categoria, input.subcategoria,
      input.entidade, input.tipo, input.valor,
      input.forma_pagamento, input.observacao, input.conta_pagar_id,
      input.conta_bancaria_id, id,
    ]
  );

  if (anterior?.conta_pagar_id && anterior.conta_pagar_id !== input.conta_pagar_id)
    await marcarContaComoPendente(anterior.conta_pagar_id);

  if (input.tipo === "Saida" && input.conta_pagar_id)
    await marcarContaComoPaga(input.conta_pagar_id, input.data);

  revalidatePath("/caixa");
  revalidatePath("/contas");
  revalidatePath("/");
}

export async function excluirMovimento(id: number) {
  const movimento = await getMovimento(id);
  await dbRun("DELETE FROM movimento_caixa WHERE id = ?", [id]);
  if (movimento?.conta_pagar_id)
    await marcarContaComoPendente(movimento.conta_pagar_id);

  revalidatePath("/caixa");
  revalidatePath("/contas");
  revalidatePath("/");
}

export async function excluirMovimentosEmLote(ids: number[]) {
  for (const id of ids) {
    const movimento = await getMovimento(id);
    await dbRun("DELETE FROM movimento_caixa WHERE id = ?", [id]);
    if (movimento?.conta_pagar_id)
      await marcarContaComoPendente(movimento.conta_pagar_id);
  }
  revalidatePath("/caixa");
  revalidatePath("/contas");
  revalidatePath("/");
}

export async function listarContasParaVinculo() {
  return dbAll<{ id: number; descricao: string; categoria: string; valor: number; vencimento: string }>(
    `SELECT id, descricao, categoria, valor, vencimento
     FROM contas_pagar WHERE status = 'Pendente' ORDER BY vencimento ASC`
  );
}
