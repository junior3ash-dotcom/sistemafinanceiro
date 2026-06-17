"use server";

import { dbAll, dbGet } from "@/lib/db";
import { todayISO, Periodo } from "@/lib/dates";

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
