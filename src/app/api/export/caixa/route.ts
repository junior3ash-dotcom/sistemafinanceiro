import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { MovimentoCaixa } from "@/lib/types";
import { formatDateBR, formatDateTimeBR } from "@/lib/format";
import { toCSV, numeroBR, csvResponse } from "@/lib/csv";
import { todayISO } from "@/lib/dates";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const inicio = searchParams.get("inicio");
  const fim = searchParams.get("fim");

  let sql = "SELECT * FROM movimento_caixa";
  const params: string[] = [];
  if (inicio && fim) {
    sql += " WHERE data >= ? AND data <= ?";
    params.push(inicio, fim);
  }
  sql += " ORDER BY data, id";

  const rows = db.prepare(sql).all(...params) as MovimentoCaixa[];

  const header = [
    "ID",
    "Data",
    "Descrição",
    "Categoria",
    "Subcategoria",
    "Entidade",
    "Tipo",
    "Valor",
    "Forma de Pagamento",
    "Observação",
    "Conta a Pagar ID",
    "Criado Em",
  ];

  const data = rows.map((r) => [
    r.id,
    formatDateBR(r.data),
    r.descricao,
    r.categoria,
    r.subcategoria,
    r.entidade,
    r.tipo,
    numeroBR(r.valor),
    r.forma_pagamento,
    r.observacao,
    r.conta_pagar_id,
    formatDateTimeBR(r.criado_em),
  ]);

  const csv = toCSV([header, ...data]);
  return csvResponse(csv, `movimento_caixa_${todayISO()}.csv`);
}
