import { NextRequest } from "next/server";
import { getResumoPeriodo } from "@/lib/actions/dashboard";
import { formatDateBR } from "@/lib/format";
import { toCSV, numeroBR, csvResponse } from "@/lib/csv";
import { getPeriodo, todayISO } from "@/lib/dates";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const inicioParam = searchParams.get("inicio");
  const fimParam = searchParams.get("fim");

  const periodo =
    inicioParam && fimParam
      ? { inicio: inicioParam, fim: fimParam }
      : getPeriodo("quinzena");

  const resumo = await getResumoPeriodo(periodo);

  const rows = [
    ["Período", `${formatDateBR(periodo.inicio)} a ${formatDateBR(periodo.fim)}`],
    ["Entradas no período", numeroBR(resumo.totalEntradas)],
    ["Saídas no período", numeroBR(resumo.totalSaidas)],
    ["Saldo do período", numeroBR(resumo.saldoPeriodo)],
    [],
    ["Categoria", "Total de Saídas"],
    ...resumo.saidasPorCategoria.map((s) => [s.categoria, numeroBR(s.valor)]),
  ];

  const csv = toCSV(rows);
  return csvResponse(csv, `resumo_periodo_${todayISO()}.csv`);
}
