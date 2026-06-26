"use client";

import { useState, useTransition } from "react";
import {
  excluirContasPagarEmLote,
  marcarContasComoPagasEmLote,
} from "@/lib/actions/contasPagar";
import { ContaPagar } from "@/lib/types";
import { formatBRL, formatDateBR } from "@/lib/format";
import { getStatusExibicao } from "@/lib/statusConta";
import StatusBadge from "@/components/StatusBadge";
import CategoriaBadge from "@/components/CategoriaBadge";
import ContaAcoes from "@/components/ContaAcoes";

export default function ContasLista({ contas }: { contas: ContaPagar[] }) {
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [pending, startTransition] = useTransition();

  const todasSelecionadas = contas.length > 0 && selecionados.length === contas.length;

  function alternar(id: number) {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function alternarTodas() {
    setSelecionados(todasSelecionadas ? [] : contas.map((c) => c.id));
  }

  function excluirSelecionadas() {
    if (!confirm(`Excluir ${selecionados.length} conta(s) selecionada(s)?`)) return;
    startTransition(async () => {
      await excluirContasPagarEmLote(selecionados);
      setSelecionados([]);
    });
  }

  function pagarSelecionadas() {
    if (!confirm(`Marcar ${selecionados.length} conta(s) como pagas?`)) return;
    startTransition(async () => {
      await marcarContasComoPagasEmLote(selecionados);
      setSelecionados([]);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {contas.length === 0 && (
        <p className="rounded-lg bg-white p-4 text-center text-sm text-zinc-500 shadow">
          Nenhuma conta encontrada para esse filtro.
        </p>
      )}

      {contas.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-white p-2 shadow">
          <label className="flex items-center gap-2 px-1 text-sm text-zinc-600">
            <input
              type="checkbox"
              checked={todasSelecionadas}
              onChange={alternarTodas}
              className="h-4 w-4 rounded border-zinc-300"
            />
            Selecionar todas
          </label>
          {selecionados.length > 0 && (
            <>
              <span className="text-sm text-zinc-500">
                {selecionados.length} selecionada(s)
              </span>
              <button
                disabled={pending}
                onClick={pagarSelecionadas}
                className="ml-auto rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                Pagar selecionadas
              </button>
              <button
                disabled={pending}
                onClick={excluirSelecionadas}
                className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                Excluir selecionadas
              </button>
            </>
          )}
        </div>
      )}

      {contas.map((conta) => {
        const status = getStatusExibicao(conta);
        const parcelaLabel = conta.parcelas_total
          ? ` (${conta.parcela_atual}/${conta.parcelas_total})`
          : "";
        return (
          <div
            key={conta.id}
            className="flex flex-col gap-2 rounded-lg bg-white p-3 shadow sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={selecionados.includes(conta.id)}
                onChange={() => alternar(conta.id)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-300"
              />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={status} />
                  <span className="font-medium text-zinc-800">
                    {conta.descricao}
                    {parcelaLabel}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <CategoriaBadge nome={conta.categoria} />
                  <span>
                    {conta.entidade} ·{" "}
                    <span
                      className={status === "Vencido" ? "font-semibold text-red-600" : ""}
                    >
                      {formatDateBR(conta.vencimento)}
                    </span>{" "}
                    ·{" "}
                    <span className="font-semibold text-zinc-700">
                      {formatBRL(conta.valor)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <ContaAcoes id={conta.id} status={conta.status} />
          </div>
        );
      })}
    </div>
  );
}
