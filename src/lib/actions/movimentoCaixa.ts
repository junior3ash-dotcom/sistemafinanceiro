"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { Entidade, MovimentoCaixa, TipoMovimento } from "@/lib/types";
import {
  marcarContaComoPaga,
  marcarContaComoPendente,
} from "./contasPagar";
import { getSaldoInicial } from "./configuracoes";

export interface MovimentoInput {
  data: string;
  descricao: string;
  categoria: string;
  entidade: Entidade;
  tipo: TipoMovimento;
  valor: number;
  forma_pagamento: string | null;
  observacao: string | null;
  conta_pagar_id: number | null;
}

const SELECT_BASE = `
  SELECT id, data, descricao, categoria, entidade, tipo, valor,
         forma_pagamento, observacao, conta_pagar_id, criado_em
  FROM movimento_caixa
`;

export interface FiltrosMovimento {
  inicio?: string;
  fim?: string;
}

export async function listarMovimentos(
  filtros: FiltrosMovimento = {}
): Promise<MovimentoCaixa[]> {
  const condicoes: string[] = [];
  const params: string[] = [];

  if (filtros.inicio) {
    condicoes.push("data >= ?");
    params.push(filtros.inicio);
  }
  if (filtros.fim) {
    condicoes.push("data <= ?");
    params.push(filtros.fim);
  }

  const where = condicoes.length ? `WHERE ${condicoes.join(" AND ")}` : "";
  const sql = `${SELECT_BASE} ${where} ORDER BY data ASC, id ASC`;

  return db.prepare(sql).all(...params) as MovimentoCaixa[];
}

export interface MovimentoComSaldo extends MovimentoCaixa {
  saldo: number;
}

export async function listarMovimentosComSaldo(): Promise<
  MovimentoComSaldo[]
> {
  const saldoInicial = await getSaldoInicial();
  const movimentos = await listarMovimentos();

  let saldo = saldoInicial;
  const comSaldo: MovimentoComSaldo[] = movimentos.map((m) => {
    saldo += m.tipo === "Entrada" ? m.valor : -m.valor;
    return { ...m, saldo };
  });

  return comSaldo.reverse();
}

export async function getSaldoAtual(): Promise<number> {
  const saldoInicial = await getSaldoInicial();
  const row = db
    .prepare(
      `SELECT
        COALESCE(SUM(CASE WHEN tipo = 'Entrada' THEN valor ELSE 0 END), 0) AS entradas,
        COALESCE(SUM(CASE WHEN tipo = 'Saida' THEN valor ELSE 0 END), 0) AS saidas
      FROM movimento_caixa`
    )
    .get() as { entradas: number; saidas: number };

  return saldoInicial + row.entradas - row.saidas;
}

export async function getMovimento(id: number): Promise<MovimentoCaixa | null> {
  const row = db.prepare(`${SELECT_BASE} WHERE id = ?`).get(id) as
    | MovimentoCaixa
    | undefined;
  return row ?? null;
}

export async function criarMovimento(input: MovimentoInput) {
  db.prepare(
    `INSERT INTO movimento_caixa (
      data, descricao, categoria, entidade, tipo, valor, forma_pagamento,
      observacao, conta_pagar_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    input.data,
    input.descricao,
    input.categoria,
    input.entidade,
    input.tipo,
    input.valor,
    input.forma_pagamento,
    input.observacao,
    input.conta_pagar_id
  );

  if (input.tipo === "Saida" && input.conta_pagar_id) {
    await marcarContaComoPaga(input.conta_pagar_id, input.data);
  }

  revalidatePath("/caixa");
  revalidatePath("/contas");
  revalidatePath("/contas/proximos");
  revalidatePath("/");
}

export async function atualizarMovimento(id: number, input: MovimentoInput) {
  const anterior = await getMovimento(id);

  db.prepare(
    `UPDATE movimento_caixa SET
      data = ?, descricao = ?, categoria = ?, entidade = ?, tipo = ?, valor = ?,
      forma_pagamento = ?, observacao = ?, conta_pagar_id = ?
    WHERE id = ?`
  ).run(
    input.data,
    input.descricao,
    input.categoria,
    input.entidade,
    input.tipo,
    input.valor,
    input.forma_pagamento,
    input.observacao,
    input.conta_pagar_id,
    id
  );

  if (
    anterior?.conta_pagar_id &&
    anterior.conta_pagar_id !== input.conta_pagar_id
  ) {
    await marcarContaComoPendente(anterior.conta_pagar_id);
  }

  if (input.tipo === "Saida" && input.conta_pagar_id) {
    await marcarContaComoPaga(input.conta_pagar_id, input.data);
  }

  revalidatePath("/caixa");
  revalidatePath("/contas");
  revalidatePath("/contas/proximos");
  revalidatePath("/");
}

export async function excluirMovimento(id: number) {
  const movimento = await getMovimento(id);

  db.prepare("DELETE FROM movimento_caixa WHERE id = ?").run(id);

  if (movimento?.conta_pagar_id) {
    await marcarContaComoPendente(movimento.conta_pagar_id);
  }

  revalidatePath("/caixa");
  revalidatePath("/contas");
  revalidatePath("/contas/proximos");
  revalidatePath("/");
}

export async function listarContasParaVinculo() {
  return db
    .prepare(
      `SELECT id, descricao, categoria, valor, vencimento
       FROM contas_pagar WHERE status = 'Pendente' ORDER BY vencimento ASC`
    )
    .all() as {
    id: number;
    descricao: string;
    categoria: string;
    valor: number;
    vencimento: string;
  }[];
}
