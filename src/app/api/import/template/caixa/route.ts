import { toCSV, csvResponse } from "@/lib/csv";

export async function GET() {
  const header = [
    "data",
    "descricao",
    "categoria",
    "subcategoria",
    "entidade",
    "tipo",
    "valor",
    "forma_pagamento",
    "observacao",
  ];

  const exemplo = [
    "12/06/2026",
    "Vendas do dia - Shopee Loja 1",
    "Vendas Shopee Loja 1",
    "",
    "CNPJ 1",
    "Entrada",
    "350,50",
    "Pix",
    "Linha de exemplo - pode apagar antes de importar",
  ];

  const csv = toCSV([header, exemplo]);
  return csvResponse(csv, "modelo_movimento_caixa.csv");
}
