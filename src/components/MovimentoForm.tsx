"use client";

import { useMemo, useState } from "react";
import { ENTIDADES, FORMAS_PAGAMENTO } from "@/lib/constants";
import { formatBRL, formatDateBR } from "@/lib/format";
import { CategoriaMovimentoRow, MovimentoCaixa as MovimentoType } from "@/lib/types";
import { todayISO } from "@/lib/dates";

interface ContaParaVinculo {
  id: number;
  descricao: string;
  categoria: string;
  valor: number;
  vencimento: string;
}

interface MovimentoFormProps {
  categorias: CategoriaMovimentoRow[];
  contasPendentes: ContaParaVinculo[];
  movimento?: MovimentoType | null;
  action: (formData: FormData) => void;
}

export default function MovimentoForm({
  categorias,
  contasPendentes,
  movimento,
  action,
}: MovimentoFormProps) {
  const [tipo, setTipo] = useState(movimento?.tipo ?? "Saida");
  const [categoria, setCategoria] = useState(movimento?.categoria ?? "");
  const ehEdicao = !!movimento;

  const categoriasDoTipo = useMemo(
    () => categorias.filter((c) => c.tipo === tipo),
    [categorias, tipo]
  );

  const subcategorias = useMemo(
    () => categoriasDoTipo.find((c) => c.nome === categoria)?.subcategorias ?? [],
    [categoriasDoTipo, categoria]
  );

  return (
    <form action={action} className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Tipo</label>
          <div className="flex gap-2">
            <label
              className={`flex-1 cursor-pointer rounded-md border px-3 py-2 text-center text-sm font-medium ${
                tipo === "Entrada"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-zinc-300 text-zinc-600"
              }`}
            >
              <input
                type="radio"
                name="tipo"
                value="Entrada"
                className="sr-only"
                checked={tipo === "Entrada"}
                onChange={() => {
                  setTipo("Entrada");
                  setCategoria("");
                }}
              />
              Entrada
            </label>
            <label
              className={`flex-1 cursor-pointer rounded-md border px-3 py-2 text-center text-sm font-medium ${
                tipo === "Saida"
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-zinc-300 text-zinc-600"
              }`}
            >
              <input
                type="radio"
                name="tipo"
                value="Saida"
                className="sr-only"
                checked={tipo === "Saida"}
                onChange={() => {
                  setTipo("Saida");
                  setCategoria("");
                }}
              />
              Saída
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Data</label>
          <input
            type="date"
            name="data"
            required
            defaultValue={movimento?.data ?? todayISO()}
            className="rounded-md border border-zinc-300 px-3 py-2 text-base"
          />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-sm font-medium text-zinc-700">Descrição</label>
          <input
            type="text"
            name="descricao"
            required
            defaultValue={movimento?.descricao}
            className="rounded-md border border-zinc-300 px-3 py-2 text-base"
            placeholder="Ex: Vendas do dia - Shopee Loja 1"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Categoria</label>
          <select
            name="categoria"
            required
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-base"
          >
            <option value="" disabled>
              Selecione...
            </option>
            {categoriasDoTipo.map((cat) => (
              <option key={cat.id} value={cat.nome}>
                {cat.nome}
              </option>
            ))}
          </select>
        </div>

        {subcategorias.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Subcategoria</label>
            <select
              name="subcategoria"
              defaultValue={movimento?.subcategoria ?? ""}
              className="rounded-md border border-zinc-300 px-3 py-2 text-base"
            >
              <option value="">Nenhuma</option>
              {subcategorias.map((sub) => (
                <option key={sub.id} value={sub.nome}>
                  {sub.nome}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">CNPJ/PF</label>
          <select
            name="entidade"
            required
            defaultValue={movimento?.entidade ?? "Empresa"}
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
            defaultValue={
              movimento ? movimento.valor.toFixed(2).replace(".", ",") : ""
            }
            className="rounded-md border border-zinc-300 px-3 py-2 text-base"
            placeholder="0,00"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Forma de pagamento</label>
          <select
            name="forma_pagamento"
            defaultValue={movimento?.forma_pagamento ?? "Pix"}
            className="rounded-md border border-zinc-300 px-3 py-2 text-base"
          >
            {FORMAS_PAGAMENTO.map((fp) => (
              <option key={fp} value={fp}>
                {fp}
              </option>
            ))}
          </select>
        </div>

        {tipo === "Saida" && (
          <div className="flex min-w-0 flex-col gap-1 sm:col-span-2">
            <label className="text-sm font-medium text-zinc-700">
              Vincular a uma conta a pagar (opcional)
            </label>
            <select
              name="conta_pagar_id"
              defaultValue={movimento?.conta_pagar_id ?? ""}
              className="w-full min-w-0 rounded-md border border-zinc-300 px-3 py-2 text-base"
            >
              <option value="">Nenhuma</option>
              {contasPendentes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.descricao} · {c.categoria} · venc. {formatDateBR(c.vencimento)} ·{" "}
                  {formatBRL(c.valor)}
                </option>
              ))}
            </select>
            <span className="text-xs text-zinc-500">
              Ao vincular, a conta selecionada será marcada automaticamente
              como &quot;Paga&quot;.
            </span>
          </div>
        )}

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-sm font-medium text-zinc-700">Observação</label>
          <textarea
            name="observacao"
            defaultValue={movimento?.observacao ?? ""}
            rows={2}
            className="rounded-md border border-zinc-300 px-3 py-2 text-base"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <a
          href="/caixa"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Cancelar
        </a>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {ehEdicao ? "Salvar alterações" : "Lançar"}
        </button>
      </div>
    </form>
  );
}
