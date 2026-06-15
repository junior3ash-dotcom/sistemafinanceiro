import { toCSV, csvResponse } from "@/lib/csv";

export async function GET() {
  const header = [
    "descricao",
    "categoria",
    "entidade",
    "valor",
    "vencimento",
    "status",
    "recorrencia",
    "recorrencia_dias",
    "forma_pagamento",
    "prioridade",
    "tipo",
    "observacao",
    "parcela_atual",
    "parcelas_total",
    "data_pagamento",
  ];

  const exemplo = [
    "Compra de chapas de MDF 3mm",
    "Matéria-prima (MDF/LED)",
    "CNPJ 1",
    "480,00",
    "20/06/2026",
    "Pendente",
    "Unica",
    "",
    "Pix",
    "Importante",
    "Operacional",
    "Linha de exemplo - pode apagar antes de importar",
    "",
    "",
    "",
  ];

  const csv = toCSV([header, exemplo]);
  return csvResponse(csv, "modelo_contas_a_pagar.csv");
}
