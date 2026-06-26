"use server";

import { dbAll, dbGet } from "@/lib/db";
import { todayISO, getPeriodo, Periodo } from "@/lib/dates";
import { getSaldoCaixaGeral } from "@/lib/actions/contasBancarias";

export interface ResumoPeriodo {
  totalEntradas: number;
  totalSaidas: number;
  saldoPeriodo: number;
  saidasPorCategoria: { categoria: string; valor: number }[];
}

export async function getResumoPeriodo(periodo: Periodo): Promise<ResumoPeriodo> {
  const totais = await dbGet<{ entradas: number; saidas: number }>(
    `SELECT
      COALESCE(SUM(CASE WHEN tipo = 'Entrada' THEN valor ELSE 0 END), 0) AS entradas,
      COALESCE(SUM(CASE WHEN tipo = 'Saida' THEN valor ELSE 0 END), 0) AS saidas
    FROM movimento_caixa WHERE data >= ? AND data <= ?`,
    [periodo.inicio, periodo.fim]
  );

  const saidasPorCategoria = await dbAll<{ categoria: string; valor: number }>(
    `SELECT categoria, SUM(valor) AS valor
     FROM movimento_caixa
     WHERE tipo = 'Saida' AND data >= ? AND data <= ?
     GROUP BY categoria ORDER BY valor DESC`,
    [periodo.inicio, periodo.fim]
  );

  return {
    totalEntradas: totais?.entradas ?? 0,
    totalSaidas: totais?.saidas ?? 0,
    saldoPeriodo: (totais?.entradas ?? 0) - (totais?.saidas ?? 0),
    saidasPorCategoria,
  };
}

export interface ResumoContaCategoria {
  categoria: string;
  vencido: number;
  pendente: number;
  total: number;
}

export async function getResumoContasPorCategoria(): Promise<ResumoContaCategoria[]> {
  const hoje = todayISO();
  const rows = await dbAll<{ categoria: string; vencido: number; pendente: number }>(
    `SELECT
      categoria,
      COALESCE(SUM(CASE WHEN vencimento < ? THEN valor ELSE 0 END), 0) AS vencido,
      COALESCE(SUM(CASE WHEN vencimento >= ? THEN valor ELSE 0 END), 0) AS pendente
    FROM contas_pagar WHERE status = 'Pendente'
    GROUP BY categoria ORDER BY categoria`,
    [hoje, hoje]
  );
  return rows.map((r) => ({ ...r, total: r.vencido + r.pendente }));
}

export interface ResumoMesVigente {
  totalMes: number;
  pago: number;
  restante: number;
  diasRestantesMes: number;
  percentPago: number;
  saldoCaixa: number;
  totalVencidas: number;
  qtdVencidas: number;
  valorNecessario: number;
}

export async function getResumoMesVigente(): Promise<ResumoMesVigente> {
  const hoje = todayISO();
  const periodoMes = getPeriodo("mes");

  const mesRow = await dbGet<{ total: number; pago: number }>(
    `SELECT
      COALESCE(SUM(valor), 0) AS total,
      COALESCE(SUM(CASE WHEN status = 'Pago' THEN valor ELSE 0 END), 0) AS pago
     FROM contas_pagar
     WHERE vencimento >= ? AND vencimento <= ?`,
    [periodoMes.inicio, periodoMes.fim]
  );

  const vencidasRow = await dbGet<{ total: number; qtd: number }>(
    `SELECT COALESCE(SUM(valor), 0) AS total, COUNT(*) AS qtd
     FROM contas_pagar
     WHERE status = 'Pendente' AND vencimento < ?`,
    [hoje]
  );

  const saldoCaixa = await getSaldoCaixaGeral();

  const totalMes = mesRow?.total ?? 0;
  const pago = mesRow?.pago ?? 0;
  const restante = totalMes - pago;
  const totalVencidas = vencidasRow?.total ?? 0;
  const qtdVencidas = Number(vencidasRow?.qtd ?? 0);

  const dia = Number(hoje.split("-")[2]);
  const ultimoDiaMes = Number(periodoMes.fim.split("-")[2]);
  const diasRestantesMes = Math.max(0, ultimoDiaMes - dia);

  return {
    totalMes,
    pago,
    restante,
    diasRestantesMes,
    percentPago: totalMes > 0 ? Math.round((pago / totalMes) * 100) : 0,
    saldoCaixa,
    totalVencidas,
    qtdVencidas,
    valorNecessario: restante + totalVencidas,
  };
}
