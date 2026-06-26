"use server";

import { redirect } from "next/navigation";
import { parseBRLInput } from "@/lib/format";
import {
  MovimentoInput,
  atualizarMovimento,
  criarMovimento,
} from "@/lib/actions/movimentoCaixa";
import { Entidade, TipoMovimento } from "@/lib/types";

function parseFormData(formData: FormData): MovimentoInput {
  const contaPagarIdRaw = formData.get("conta_pagar_id");
  const tipo = formData.get("tipo") as TipoMovimento;

  return {
    data: String(formData.get("data") ?? ""),
    descricao: String(formData.get("descricao") ?? "").trim(),
    categoria: String(formData.get("categoria") ?? ""),
    subcategoria: String(formData.get("subcategoria") ?? "") || null,
    entidade: formData.get("entidade") as Entidade,
    tipo,
    valor: parseBRLInput(String(formData.get("valor") ?? "0")),
    forma_pagamento: String(formData.get("forma_pagamento") ?? "") || null,
    observacao: String(formData.get("observacao") ?? "") || null,
    conta_pagar_id:
      tipo === "Saida" && contaPagarIdRaw ? Number(contaPagarIdRaw) : null,
    conta_bancaria_id: Number(formData.get("conta_bancaria_id")),
  };
}

export async function criarMovimentoFormAction(formData: FormData) {
  const input = parseFormData(formData);
  await criarMovimento(input);
  redirect("/caixa");
}

export async function atualizarMovimentoFormAction(
  id: number,
  formData: FormData
) {
  const input = parseFormData(formData);
  await atualizarMovimento(id, input);
  redirect("/caixa");
}
