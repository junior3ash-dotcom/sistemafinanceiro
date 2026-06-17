import { NextRequest } from "next/server";
import { dbAll } from "@/lib/db";
import { ContaPagar } from "@/lib/types";
import { formatDateBR, formatDateTimeBR } from "@/lib/format";
import { toCSV, numeroBR, csvResponse } from "@/lib/csv";
import { todayISO } from "@/lib/dates";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const inicio = searchParams.get("inicio");
  const fim = searchParams.get("fim");

  let sql = "SELECT * FROM contas_pagar";
  const params: string[] = [];
  if (inicio && fim) {
    sql += " WHERE vencimento >= ? AND vencimento <= ?";
    params.push(inicio, fim);
  }
  sql += " ORDER BY vencimento";

  const rows = await dbAll<ContaPagar>(sql, params);

  const header = [
    "ID", "Descrição", "Categoria", "Entidade", "Valor", "Vencimento", "Status",
    "Recorrência", "Recorrência (dias)", "Forma de Pagamento", "Prioridade", "Tipo",
    "Observação", "Parcela Atual", "Parcelas Total", "Grupo Parcelamento",
    "Conta Origem ID", "Data Pagamento", "Criado Em",
  ];

  const data = rows.map((r) => [
    r.id, r.descricao, r.categoria, r.entidade, numeroBR(r.valor),
    formatDateBR(r.vencimento), r.status, r.recorrencia, r.recorrencia_dias,
    r.forma_pagamento, r.prioridade, r.tipo, r.observacao,
    r.parcela_atual, r.parcelas_total, r.grupo_parcelamento_id,
    r.conta_origem_id, formatDateBR(r.data_pagamento), formatDateTimeBR(r.criado_em),
  ]);

  return csvResponse(toCSV([header, ...data]), `contas_a_pagar_${todayISO()}.csv`);
}
