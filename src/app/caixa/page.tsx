import Link from "next/link";
import {
  getSaldoAtual,
  listarMovimentosComSaldo,
} from "@/lib/actions/movimentoCaixa";
import { formatBRL, formatDateBR } from "@/lib/format";
import MovimentoAcoes from "@/components/MovimentoAcoes";

export default async function CaixaPage() {
  const [movimentos, saldoAtual] = await Promise.all([
    listarMovimentosComSaldo(),
    getSaldoAtual(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">
            Movimento Diário de Caixa
          </h1>
          <p className="text-sm text-zinc-500">
            Saldo atual:{" "}
            <span
              className={`font-semibold ${
                saldoAtual >= 0 ? "text-green-700" : "text-red-700"
              }`}
            >
              {formatBRL(saldoAtual)}
            </span>
          </p>
        </div>
        <Link
          href="/caixa/novo"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Novo lançamento
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {movimentos.length === 0 && (
          <p className="rounded-lg bg-white p-4 text-center text-sm text-zinc-500 shadow">
            Nenhum lançamento ainda.
          </p>
        )}

        {movimentos.map((m) => (
          <div
            key={m.id}
            className="flex flex-col gap-2 rounded-lg bg-white p-3 shadow sm:flex-row sm:items-center sm:justify-between"
          >
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
              <div className="text-sm text-zinc-500">
                {formatDateBR(m.data)} · {m.categoria}
                {m.subcategoria && ` / ${m.subcategoria}`} · {m.entidade}
                {m.conta_pagar_id && (
                  <span className="ml-1 rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600">
                    vinculado a conta #{m.conta_pagar_id}
                  </span>
                )}
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
                <div className="text-xs text-zinc-400">
                  saldo: {formatBRL(m.saldo)}
                </div>
              </div>
              <MovimentoAcoes id={m.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
