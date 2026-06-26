"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { dbAll, dbGet, dbRun } from "@/lib/db";
import { addDaysISO, addMonthsSameDayISO, getPeriodo, todayISO } from "@/lib/dates";
import { ContaPagar, Entidade, Prioridade, Recorrencia, TipoConta } from "@/lib/types";

export interface ContaPagarInput {
  descricao: string;
  categoria: string;
  entidade: Entidade;
  valor: number;
  vencimento: string;
  recorrencia: Recorrencia;
  recorrencia_dias: number | null;
  forma_pagamento: string | null;
  prioridade: Prioridade;
  tipo: TipoConta;
  observacao: string | null;
  parcela_atual: number | null;
  parcelas_total: number | null;
}

export interface FiltrosContasPagar {
  status?: "Vencido" | "Pendente" | "Pago" | "Abertas";
  categoria?: string;
  entidade?: string;
  tipo?: string;
  prioridade?: string;
}

const SELECT_BASE = `
  SELECT id, descricao, categoria, entidade, valor, vencimento, status,
         recorrencia, recorrencia_dias, forma_pagamento, prioridade, tipo,
         observacao, parcela_atual, parcelas_total, grupo_parcelamento_id,
         conta_origem_id, data_pagamento, criado_em
  FROM contas_pagar
`;

export async function listarContasPagar(
  filtros: FiltrosContasPagar = {}
): Promise<ContaPagar[]> {
  const cond: string[] = [];
  const params: (string | number)[] = [];

  if (filtros.categoria) { cond.push("categoria = ?"); params.push(filtros.categoria); }
  if (filtros.entidade) { cond.push("entidade = ?"); params.push(filtros.entidade); }
  if (filtros.tipo) { cond.push("tipo = ?"); params.push(filtros.tipo); }
  if (filtros.prioridade) { cond.push("prioridade = ?"); params.push(filtros.prioridade); }

  if (filtros.status === "Pago") {
    cond.push("status = 'Pago'");
  } else if (filtros.status === "Pendente") {
    cond.push("status = 'Pendente' AND vencimento >= ?");
    params.push(todayISO());
  } else if (filtros.status === "Vencido") {
    cond.push("status = 'Pendente' AND vencimento < ?");
    params.push(todayISO());
  } else if (filtros.status === "Abertas") {
    cond.push("status = 'Pendente'");
  }

  const where = cond.length ? `WHERE ${cond.join(" AND ")}` : "";
  return dbAll<ContaPagar>(`${SELECT_BASE} ${where} ORDER BY vencimento ASC, id ASC`, params);
}

export async function getContaPagar(id: number): Promise<ContaPagar | null> {
  return dbGet<ContaPagar>(`${SELECT_BASE} WHERE id = ?`, [id]);
}

export async function listarContasMesVigenteEVencidas(
  filtros: FiltrosContasPagar = {}
): Promise<ContaPagar[]> {
  const hoje = todayISO();
  const periodoMes = getPeriodo("mes");

  const cond: string[] = [
    "((vencimento >= ? AND vencimento <= ?) OR (status = 'Pendente' AND vencimento < ?))",
  ];
  const params: (string | number)[] = [periodoMes.inicio, periodoMes.fim, hoje];

  if (filtros.categoria) { cond.push("categoria = ?"); params.push(filtros.categoria); }
  if (filtros.entidade) { cond.push("entidade = ?"); params.push(filtros.entidade); }
  if (filtros.tipo) { cond.push("tipo = ?"); params.push(filtros.tipo); }
  if (filtros.prioridade) { cond.push("prioridade = ?"); params.push(filtros.prioridade); }

  if (filtros.status === "Pago") {
    cond.push("status = 'Pago'");
  } else if (filtros.status === "Pendente") {
    cond.push("status = 'Pendente' AND vencimento >= ?");
    params.push(hoje);
  } else if (filtros.status === "Vencido") {
    cond.push("status = 'Pendente' AND vencimento < ?");
    params.push(hoje);
  } else if (filtros.status === "Abertas") {
    cond.push("status = 'Pendente'");
  }

  const where = `WHERE ${cond.join(" AND ")}`;
  return dbAll<ContaPagar>(`${SELECT_BASE} ${where} ORDER BY vencimento ASC, id ASC`, params);
}

async function inserirConta(
  input: ContaPagarInput & {
    vencimento: string;
    parcela_atual: number | null;
    parcelas_total: number | null;
    grupo_parcelamento_id: string | null;
    recorrencia: Recorrencia;
    recorrencia_dias: number | null;
    conta_origem_id?: number | null;
  }
): Promise<number> {
  const { lastInsertRowid } = await dbRun(
    `INSERT INTO contas_pagar (
      descricao, categoria, entidade, valor, vencimento, status,
      recorrencia, recorrencia_dias, forma_pagamento, prioridade, tipo,
      observacao, parcela_atual, parcelas_total, grupo_parcelamento_id, conta_origem_id
    ) VALUES (?, ?, ?, ?, ?, 'Pendente', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.descricao, input.categoria, input.entidade, input.valor, input.vencimento,
      input.recorrencia, input.recorrencia_dias, input.forma_pagamento,
      input.prioridade, input.tipo, input.observacao,
      input.parcela_atual, input.parcelas_total,
      input.grupo_parcelamento_id, input.conta_origem_id ?? null,
    ]
  );
  return lastInsertRowid;
}

export async function criarContaPagar(input: ContaPagarInput): Promise<number[]> {
  const temParcelamento =
    !!input.parcelas_total &&
    !!input.parcela_atual &&
    input.parcelas_total > 1 &&
    input.parcela_atual <= input.parcelas_total;

  const ids: number[] = [];

  if (temParcelamento) {
    const grupoId = randomUUID();
    const parcelaInicial = input.parcela_atual as number;
    const totalParcelas = input.parcelas_total as number;

    for (let parcela = parcelaInicial; parcela <= totalParcelas; parcela++) {
      const vencimento =
        parcela === parcelaInicial
          ? input.vencimento
          : addMonthsSameDayISO(input.vencimento, parcela - parcelaInicial);

      ids.push(
        await inserirConta({
          ...input,
          vencimento,
          recorrencia: "Unica",
          recorrencia_dias: null,
          parcela_atual: parcela,
          parcelas_total: totalParcelas,
          grupo_parcelamento_id: grupoId,
        })
      );
    }
  } else {
    ids.push(
      await inserirConta({
        ...input,
        parcela_atual: null,
        parcelas_total: null,
        grupo_parcelamento_id: null,
      })
    );
  }

  revalidatePath("/contas");
  revalidatePath("/");
  revalidatePath("/caixa");
  return ids;
}

export async function atualizarContaPagar(id: number, input: ContaPagarInput) {
  await dbRun(
    `UPDATE contas_pagar SET
      descricao = ?, categoria = ?, entidade = ?, valor = ?, vencimento = ?,
      recorrencia = ?, recorrencia_dias = ?, forma_pagamento = ?, prioridade = ?,
      tipo = ?, observacao = ?, parcela_atual = ?, parcelas_total = ?
    WHERE id = ?`,
    [
      input.descricao, input.categoria, input.entidade, input.valor, input.vencimento,
      input.recorrencia, input.recorrencia_dias, input.forma_pagamento,
      input.prioridade, input.tipo, input.observacao,
      input.parcela_atual, input.parcelas_total, id,
    ]
  );
  revalidatePath("/contas");
  revalidatePath("/");
  revalidatePath("/caixa");
}

export async function excluirContaPagar(id: number) {
  await dbRun("DELETE FROM contas_pagar WHERE id = ?", [id]);
  await dbRun("UPDATE movimento_caixa SET conta_pagar_id = NULL WHERE conta_pagar_id = ?", [id]);
  revalidatePath("/contas");
  revalidatePath("/");
  revalidatePath("/caixa");
}

function calcularProximoVencimento(conta: ContaPagar): string | null {
  switch (conta.recorrencia) {
    case "Mensal": return addMonthsSameDayISO(conta.vencimento, 1);
    case "Quinzenal": return addDaysISO(conta.vencimento, 15);
    case "Semanal": return addDaysISO(conta.vencimento, 7);
    case "Personalizada": return addDaysISO(conta.vencimento, conta.recorrencia_dias ?? 30);
    default: return null;
  }
}

export async function marcarContaComoPaga(id: number, dataPagamento: string = todayISO()) {
  const conta = await getContaPagar(id);
  if (!conta) return;

  await dbRun(
    "UPDATE contas_pagar SET status = 'Pago', data_pagamento = ? WHERE id = ?",
    [dataPagamento, id]
  );

  const proximoVencimento = calcularProximoVencimento(conta);
  if (proximoVencimento) {
    await inserirConta({
      descricao: conta.descricao,
      categoria: conta.categoria,
      entidade: conta.entidade,
      valor: conta.valor,
      vencimento: proximoVencimento,
      recorrencia: conta.recorrencia,
      recorrencia_dias: conta.recorrencia_dias,
      forma_pagamento: conta.forma_pagamento,
      prioridade: conta.prioridade,
      tipo: conta.tipo,
      observacao: conta.observacao,
      parcela_atual: null,
      parcelas_total: null,
      grupo_parcelamento_id: null,
      conta_origem_id: conta.id,
    });
  }

  revalidatePath("/contas");
  revalidatePath("/");
  revalidatePath("/caixa");
}

export async function marcarContaComoPendente(id: number) {
  await dbRun(
    "UPDATE contas_pagar SET status = 'Pendente', data_pagamento = NULL WHERE id = ?",
    [id]
  );
  await dbRun(
    "UPDATE movimento_caixa SET conta_pagar_id = NULL WHERE conta_pagar_id = ?",
    [id]
  );
  revalidatePath("/contas");
  revalidatePath("/");
  revalidatePath("/caixa");
}
