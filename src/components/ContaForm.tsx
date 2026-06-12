"use client";

import { useState } from "react";
import {
  ENTIDADES,
  FORMAS_PAGAMENTO,
  PRIORIDADES,
  RECORRENCIAS,
  TIPOS_CONTA,
} from "@/lib/constants";
import { ContaPagar } from "@/lib/types";

interface ContaFormProps {
  categorias: string[];
  conta?: ContaPagar | null;
  action: (formData: FormData) => void;
}

export default function ContaForm({ categorias, conta, action }: ContaFormProps) {
  const [recorrencia, setRecorrencia] = useState(conta?.recorrencia ?? "Unica");
  const ehEdicao = !!conta;
  const ehParcelaExistente = !!conta?.grupo_parcelamento_id;

  return (
    <form action={action} className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-sm font-medium text-zinc-700">Descrição</label>
          <input
            type="text"
            name="descricao"
            required
            defaultValue={conta?.descricao}
            className="rounded-md border border-zinc-300 px-3 py-2 text-base"
            placeholder="Ex: Aluguel da sala"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Categoria</label>
          <select
            name="categoria"
            required
            defaultValue={conta?.categoria ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 text-base"
          >
            <option value="" disabled>
              Selecione...
            </option>
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">CNPJ/PF</label>
          <select
            name="entidade"
            required
            defaultValue={conta?.entidade ?? "Empresa"}
            className="rounded-md border border-zinc-300 px-3 py-2 text-base"
          >
            {ENTIDADES.map((ent) => (
              <option key={ent} value={ent}>
                {ent}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Valor (R$)</label>
          <input
            type="text"
            name="valor"
            required
            inputMode="decimal"
            defaultValue={conta ? conta.valor.toFixed(2).replace(".", ",") : ""}
            className="rounded-md border border-zinc-300 px-3 py-2 text-base"
            placeholder="0,00"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Vencimento</label>
          <input
            type="date"
            name="vencimento"
            required
            defaultValue={conta?.vencimento}
            className="rounded-md border border-zinc-300 px-3 py-2 text-base"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Forma de pagamento</label>
          <select
            name="forma_pagamento"
            defaultValue={conta?.forma_pagamento ?? "Pix"}
            className="rounded-md border border-zinc-300 px-3 py-2 text-base"
          >
            {FORMAS_PAGAMENTO.map((fp) => (
              <option key={fp} value={fp}>
                {fp}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Prioridade</label>
          <select
            name="prioridade"
            defaultValue={conta?.prioridade ?? "Importante"}
            className="rounded-md border border-zinc-300 px-3 py-2 text-base"
          >
            {PRIORIDADES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Tipo</label>
          <select
            name="tipo"
            defaultValue={conta?.tipo ?? "Operacional"}
            className="rounded-md border border-zinc-300 px-3 py-2 text-base"
          >
            {TIPOS_CONTA.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Recorrência</label>
          <select
            name="recorrencia"
            value={recorrencia}
            onChange={(e) => setRecorrencia(e.target.value as typeof recorrencia)}
            disabled={ehParcelaExistente}
            className="rounded-md border border-zinc-300 px-3 py-2 text-base disabled:bg-zinc-100"
          >
            {RECORRENCIAS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          {ehParcelaExistente && (
            <span className="text-xs text-zinc-500">
              Esta conta faz parte de um parcelamento e não gera recorrência.
            </span>
          )}
        </div>

        {recorrencia === "Personalizada" && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">
              Repetir a cada quantos dias?
            </label>
            <input
              type="number"
              name="recorrencia_dias"
              min={1}
              required
              defaultValue={conta?.recorrencia_dias ?? 30}
              className="rounded-md border border-zinc-300 px-3 py-2 text-base"
            />
          </div>
        )}

        {!ehEdicao && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700">
                Parcela atual (opcional)
              </label>
              <input
                type="number"
                name="parcela_atual"
                min={1}
                className="rounded-md border border-zinc-300 px-3 py-2 text-base"
                placeholder="Ex: 1"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700">
                Total de parcelas (opcional)
              </label>
              <input
                type="number"
                name="parcelas_total"
                min={1}
                className="rounded-md border border-zinc-300 px-3 py-2 text-base"
                placeholder="Ex: 3"
              />
              <span className="text-xs text-zinc-500">
                Se preenchido, as próximas parcelas serão geradas automaticamente
                (mesmo dia, mês a mês).
              </span>
            </div>
          </>
        )}

        {ehEdicao && conta?.parcelas_total && (
          <div className="grid grid-cols-2 gap-4 sm:col-span-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700">Parcela atual</label>
              <input
                type="number"
                name="parcela_atual"
                min={1}
                defaultValue={conta.parcela_atual ?? undefined}
                className="rounded-md border border-zinc-300 px-3 py-2 text-base"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700">Total de parcelas</label>
              <input
                type="number"
                name="parcelas_total"
                min={1}
                defaultValue={conta.parcelas_total ?? undefined}
                className="rounded-md border border-zinc-300 px-3 py-2 text-base"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-sm font-medium text-zinc-700">Observação</label>
          <textarea
            name="observacao"
            defaultValue={conta?.observacao ?? ""}
            rows={2}
            className="rounded-md border border-zinc-300 px-3 py-2 text-base"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <a
          href="/contas"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Cancelar
        </a>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {ehEdicao ? "Salvar alterações" : "Cadastrar conta"}
        </button>
      </div>
    </form>
  );
}
