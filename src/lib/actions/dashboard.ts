"use server";

import { db } from "@/lib/db";
import { todayISO } from "@/lib/dates";
import { Periodo } from "@/lib/dates";

export interface ResumoPeriodo {
  totalEntradas: number;
  totalSaidas: number;
  saldoPeriodo: number;
  saidasPorCategoria: { categoria: string; valor: number }[];
}

export async function getResumoPeriodo(periodo: Periodo): Promise<ResumoPeriodo> {
  const totais = db
    .prepare(
      `SELECT
        COALESCE(SUM(CASE WHEN tipo = 'Entrada' THEN valor ELSE 0 END), 0) AS entradas,
        COALESCE(SUM(CASE WHEN tipo = 'Saida' THEN valor ELSE 0 END), 0) AS saidas
      FROM movimento_caixa
      WHERE data >= ? AND data <= ?`
    )
    .get(periodo.inicio, periodo.fim) as { entradas: number; saidas: number };

  const saidasPorCategoria = db
    .prepare(
      `SELECT categoria, SUM(valor) AS valor
       FROM movimento_caixa
       WHERE tipo = 'Saida' AND data >= ? AND data <= ?
       GROUP BY categoria
       ORDER BY valor DESC`
    )
    .all(periodo.inicio, periodo.fim) as { categoria: string; valor: number }[];

  return {
    totalEntradas: totais.entradas,
    totalSaidas: totais.saidas,
    saldoPeriodo: totais.entradas - totais.saidas,
    saidasPorCategoria,
  };
}

export interface ResumoContaCategoria {
  categoria: string;
  vencido: number;
  pendente: number;
  total: number;
}

export async function getResumoContasPorCategoria(): Promise<
  ResumoContaCategoria[]
> {
  const hoje = todayISO();

  const rows = db
    .prepare(
      `SELECT
        categoria,
        COALESCE(SUM(CASE WHEN vencimento < ? THEN valor ELSE 0 END), 0) AS vencido,
        COALESCE(SUM(CASE WHEN vencimento >= ? THEN valor ELSE 0 END), 0) AS pendente
      FROM contas_pagar
      WHERE status = 'Pendente'
      GROUP BY categoria
      ORDER BY categoria`
    )
    .all(hoje, hoje) as { categoria: string; vencido: number; pendente: number }[];

  return rows.map((r) => ({
    categoria: r.categoria,
    vencido: r.vencido,
    pendente: r.pendente,
    total: r.vencido + r.pendente,
  }));
}
