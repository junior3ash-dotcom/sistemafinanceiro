"use server";

import { redirect } from "next/navigation";
import { parseBRLInput } from "@/lib/format";
import {
  ContaPagarInput,
  atualizarContaPagar,
  criarContaPagar,
} from "@/lib/actions/contasPagar";
import {
  Entidade,
  Prioridade,
  Recorrencia,
  TipoConta,
} from "@/lib/types";

function parseFormData(formData: FormData): ContaPagarInput {
  const recorrencia = formData.get("recorrencia") as Recorrencia;
  const recorrenciaDiasRaw = formData.get("recorrencia_dias");
  const parcelaAtualRaw = formData.get("parcela_atual");
  const parcelasTotalRaw = formData.get("parcelas_total");

  return {
    descricao: String(formData.get("descricao") ?? "").trim(),
    categoria: String(formData.get("categoria") ?? ""),
    entidade: formData.get("entidade") as Entidade,
    valor: parseBRLInput(String(formData.get("valor") ?? "0")),
    vencimento: String(formData.get("vencimento") ?? ""),
    recorrencia,
    recorrencia_dias:
      recorrencia === "Personalizada" && recorrenciaDiasRaw
        ? Number(recorrenciaDiasRaw)
        : null,
    forma_pagamento: String(formData.get("forma_pagamento") ?? "") || null,
    prioridade: formData.get("prioridade") as Prioridade,
    tipo: formData.get("tipo") as TipoConta,
    observacao: String(formData.get("observacao") ?? "") || null,
    parcela_atual: parcelaAtualRaw ? Number(parcelaAtualRaw) : null,
    parcelas_total: parcelasTotalRaw ? Number(parcelasTotalRaw) : null,
  };
}

export async function criarContaFormAction(formData: FormData) {
  const input = parseFormData(formData);
  await criarContaPagar(input);
  redirect("/contas");
}

export async function atualizarContaFormAction(
  id: number,
  formData: FormData
) {
  const input = parseFormData(formData);
  await atualizarContaPagar(id, input);
  redirect("/contas");
}
