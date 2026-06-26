"use client";

import { useState, useTransition } from "react";
import { excluirMovimentosEmLote } from "@/lib/actions/movimentoCaixa";
import { MovimentoComSaldo } from "@/lib/actions/movimentoCaixa";
import { formatBRL, formatDateBR } from "@/lib/format";
import MovimentoAcoes from "@/components/MovimentoAcoes";
import CategoriaBadge from "@/components/CategoriaBadge";

export default function MovimentosLista({
  movimentos,
}: {
  movimentos: MovimentoComSaldo[];
}) {
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [pending, startTransition] = useTransition();

  const todasSelecionadas =
    movimentos.length > 0 && selecionados.length === movimentos.length;

  function alternar(id: number) {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function alternarTodas() {
    setSelecionados(todasSelecionadas ? [] : movimentos.map((m) => m.id));
  }

  function excluirSelecionados() {
    if (!confirm(`Excluir ${selecionados.length} lançamento(s) selecionado(s)?`)) return;
    startTransition(async () => {
      await excluirMovimentosEmLote(selecionados);
      setSelecionados([]);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {movimentos.length === 0 && (
        <p className="rounded-lg bg-white p-4 text-center text-sm text-zinc-500 shadow">
          Nenhum lançamento ainda.
        </p>
      )}

      {movimentos.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-white p-2 shadow">
          <label className="flex items-center gap-2 px-1 text-sm text-zinc-600">
            <input
              type="checkbox"
              checked={todasSelecionadas}
              onChange={alternarTodas}
              className="h-4 w-4 rounded border-zinc-300"
            />
            Selecionar todos
          </label>
          {selecionados.length > 0 && (
            <>
              <span className="text-sm text-zinc-500">
                {selecionados.length} selecionado(s)
              </span>
              <button
                disabled={pending}
                onClick={excluirSelecionados}
                className="ml-auto rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                Excluir selecionados
              </button>
            </>
          )}
        </div>
      )}

      {movimentos.map((m) => (
        <div
          key={m.id}
          className="flex flex-col gap-2 rounded-lg bg-white p-3 shadow sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={selecionados.includes(m.id)}
              onChange={() => alternar(m.id)}
              className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-300"
            />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${
                    m.tipo === "Entrada"
                      ? "border-green-300 bg-green-100 text-green-800"
                      : "border-red-300 bg-red-100 text-red-800"
                  }`}
                >
                  {m.tipo}
                </span>
                <span className="font-medium text-zinc-800">{m.descricao}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                <span>{formatDateBR(m.data)}</span>
                <CategoriaBadge nome={m.categoria} />
                {m.subcategoria && <span>{m.subcategoria}</span>}
                <span>· {m.entidade}</span>
                {m.conta_pagar_id && (
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600">
                    vinculado a conta #{m.conta_pagar_id}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-4">
            <div className="text-right">
              <div
                className={`font-semibold ${
                  m.tipo === "Entrada" ? "text-green-700" : "text-red-700"
                }`}
              >
                {m.tipo === "Entrada" ? "+" : "-"}
                {formatBRL(m.valor)}
              </div>
              <div className="text-xs text-zinc-400">saldo: {formatBRL(m.saldo)}</div>
            </div>
            <MovimentoAcoes id={m.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
